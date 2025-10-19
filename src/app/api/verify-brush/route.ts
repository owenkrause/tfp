import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

type Decision = {
  verified: boolean,
  reason: string
}


export async function POST(request: NextRequest) {
  try {
    const { image, childId } = await request.json();

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    if (!childId) {
      return NextResponse.json({ error: "No Child Id provided"}, { status: 400 })
    }

    const prompt = `Analyze this image and determine if it shows a person brushing their teeth.
    Look for:
    - A toothbrush visible in the image
    - The toothbrush being held near or in the mouth
    - The person appearing to be actively brushing

    Respond with ONLY a JSON object in this exact format (no markdown, no code blocks, just the raw JSON):
    {"verified": true/false, "reason": "brief explanation"}`;

    const result = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: image.split(",")[1],
                mimeType: "image/jpeg",
              },
            },
          ],
        },
      ],
    });

    if (!result.text) {
      return NextResponse.json(
        { verified: false, reason: "No response from AI" },
        { status: 200 }
      );
    }

    let cleanedText = result.text.trim();
    if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    }

    let decision: Decision;
    try {
      decision = JSON.parse(cleanedText) as Decision;
    } catch {
      console.error("Invalid JSON response from AI:", result.text);

      return NextResponse.json(
        { verified: false, reason: "Verification failed due to error" },
        { status: 500 }
      );
    }

    if (decision.verified) {
      const child = await prisma.child.findUnique({
        where: { id: childId },
        select: {
          currentToothValue: true,
          priceIncrease: true,
          teeth: {
            where: { paid: false },
            select: { id: true }
          }
        }
      });

      if (child) {
        const newToothValue = child.currentToothValue + child.priceIncrease;

        await prisma.tooth.updateMany({
          where: {
            childId: childId,
            paid: false
          },
          data: {
            valueAtLoss: newToothValue
          }
        });

        await prisma.child.update({
          where: { id: childId },
          data: {
            currentToothValue: newToothValue
          }
        });

        await prisma.brushSession.create({
          data: {
            childId: childId,
            verified: true
          }
        });
      }
    }

    return NextResponse.json(decision);
  } catch (error) {
    console.error("Verification error:", error);
    
    return NextResponse.json(
      { verified: false, reason: "Verification failed due to error" },
      { status: 500 }
    );
  }
}
