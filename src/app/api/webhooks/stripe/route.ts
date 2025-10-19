import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Handle the checkout.session.completed event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { toothId, childId } = session.metadata || {};

    if (toothId && childId) {
      try {
        // Get tooth details
        const tooth = await prisma.tooth.findUnique({
          where: { id: toothId },
        });

        if (tooth && !tooth.paid) {
          // Mark tooth as paid
          await prisma.tooth.update({
            where: { id: toothId },
            data: {
              paid: true,
              paidAt: new Date(),
            },
          });

          // Add amount to child's balance
          await prisma.child.update({
            where: { id: childId },
            data: {
              balance: {
                increment: tooth.valueAtLoss,
              },
            },
          });

          // Create transaction record
          await prisma.transaction.create({
            data: {
              childId: childId,
              amount: tooth.valueAtLoss,
              description: `Payment for ${tooth.toothType}`,
              toothId: toothId,
              status: "completed",
            },
          });

          console.log(`Tooth ${toothId} paid successfully via Stripe`);
        }
      } catch (error) {
        console.error("Error processing payment:", error);
        return NextResponse.json(
          { error: "Payment processing failed" },
          { status: 500 }
        );
      }
    }
  }

  return NextResponse.json({ received: true });
}
