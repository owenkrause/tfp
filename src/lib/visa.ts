import https from "https";
import fs from "fs";
import jose from "node-jose";

// Visa Direct API configuration
const VISA_API_BASE = "https://sandbox.api.visa.com";

// Create HTTPS agent with mutual SSL certificates
const createHttpsAgent = () => {
  return new https.Agent({
    cert: fs.readFileSync(process.env.VISA_CERT_PATH!),
    key: fs.readFileSync(process.env.VISA_KEY_PATH!),
    rejectUnauthorized: false, // Set to true in production
  });
};

// Generate basic auth header
const getAuthHeader = () => {
  const credentials = `${process.env.VISA_USER_ID}:${process.env.VISA_PASSWORD}`;
  return `Basic ${Buffer.from(credentials).toString("base64")}`;
};

// Encrypt payload using MLE
const encryptPayload = async (payload: any) => {
  const serverCertPath = `./certs/server_cert_${process.env.VISA_KEY_ID}.pem`;
  const certificatePem = fs.readFileSync(serverCertPath, "utf8");
  const encryptionKid = process.env.VISA_KEY_ID;

  const result = await jose.JWK.asKey(certificatePem, 'pem', {
    "kty": "RSA",
    "alg": "RSA-OAEP-256",
    "kid": encryptionKid,
    enc: "A128GCM",
    key_opts: ["wrapKey", "enc"]
  });

  const data = await jose.JWE.createEncrypt({
    format: 'compact',
    contentAlg: 'A128GCM',
    fields: { iat: Date.now() }
  }, result).update(JSON.stringify(payload)).final();

  const encData = data.toString();
  return encData;
};

const decryptResponse = async (encryptedData: string) => {
  const privateKeyPath = `./certs/privateKey-${process.env.VISA_KEY_ID}.pem`;
  const privateKey = fs.readFileSync(privateKeyPath, "utf8");

  // Import your private key
  const key = await jose.JWK.asKey(privateKey, "pem");

  // Decrypt the response
  const decrypted = await jose.JWE.createDecrypt(key).decrypt(encryptedData);

  return JSON.parse(decrypted.payload.toString());
};

// Push funds using Visa Direct
export async function pushFundsViaDirect({
  amount,
  recipientCardNumber,
  recipientName,
  senderName = "Parent",
  transactionId,
}: {
  amount: number;
  recipientCardNumber: string;
  recipientName: string;
  senderName?: string;
  transactionId: string;
}) {
  const endpoint = "/visadirect/fundstransfer/v1/pushfundstransactions";

  const systemsTraceAuditNumber = Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, "0");
  const retrievalReferenceNumber = transactionId.slice(-12).padStart(12, "0");

  const payload = {
    amount: parseFloat(amount.toFixed(2)),
    senderAddress: "901 Metro Center Blvd",
    localTransactionDateTime: "2023-05-05T12:00:00",
    pointOfServiceData: {
      panEntryMode: 90,
      posConditionCode: "00",
      motoECIIndicator: 0
    },
    recipientPrimaryAccountNumber: recipientCardNumber,
    cardAcceptor: {
      address: {
        country: "USA",
        zipCode: "94404",
        county: "San Mateo",
        state: "CA"
      },
      idCode: "CA-IDCode-77765",
      name: "Visa Inc. USA-Foster City",
      terminalId: "TID-9999"
    },
    senderReference: "",
    transactionIdentifier: parseInt(transactionId.slice(0, 15)),
    acquirerCountryCode: 840,
    acquiringBin: 408999,
    retrievalReferenceNumber,
    senderCity: "Foster City",
    senderStateCode: "CA",
    systemsTraceAuditNumber: parseInt(systemsTraceAuditNumber),
    senderName,
    businessApplicationId: "AA",
    merchantCategoryCode: 6012,
    transactionCurrencyCode: "USD",
    recipientName,
    senderCountryCode: "124",
    sourceOfFundsCode: "05",
    senderAccountNumber: "4060320000000126"
  };

  try {
    // Encrypt the payload
    const encryptedPayload = await encryptPayload(payload);

    console.log("Encrypted payload (first 50 chars):", encryptedPayload.substring(0, 50));
    console.log("KeyId:", process.env.VISA_KEY_ID);
    console.log("Endpoint:", `${VISA_API_BASE}${endpoint}`);

    const requestBody = JSON.stringify({ encData: encryptedPayload });
    console.log("Request body length:", requestBody.length);

    const response = await fetch(`${VISA_API_BASE}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: getAuthHeader(),
        keyId: process.env.VISA_KEY_ID!,
      },
      body: requestBody,
      // @ts-ignore - node.js specific
      agent: createHttpsAgent(),
    });

    console.log("Response status:", response.status);
    const responseData = await response.json();

    if (!response.ok) {
      console.error("Visa Direct error:", JSON.stringify(responseData, null, 2));
      throw new Error(`Visa Direct failed: ${responseData.responseStatus?.message || "Unknown error"}`);
    }

    // Decrypt the response
    const data = await decryptResponse(responseData.encData);

    return {
      success: true,
      transactionId: data.transactionIdentifier,
      approvalCode: data.approvalCode,
      responseCode: data.responseCode,
      actionCode: data.actionCode,
      ...data,
    };
  } catch (error) {
    console.error("Visa Direct payment failed:", error);
    throw error;
  }
}
