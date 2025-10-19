import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { toothId, childId } = await request.json();

    if (!toothId || !childId) {
      return NextResponse.json(
        { error: "Missing toothId or childId" },
        { status: 400 }
      );
    }

    // Get tooth and child info
    const tooth = await prisma.tooth.findUnique({
      where: { id: toothId },
      include: {
        child: {
          include: {
            family: true,
          },
        },
      },
    });

    if (!tooth) {
      return NextResponse.json({ error: "Tooth not found" }, { status: 404 });
    }

    if (tooth.paid) {
      return NextResponse.json(
        { error: "Tooth already paid" },
        { status: 400 }
      );
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${tooth.child.name}'s ${tooth.toothType}`,
              description: `Lost on ${new Date(tooth.lostDate).toLocaleDateString()}`,
            },
            unit_amount: Math.round(tooth.valueAtLoss * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${request.headers.get("origin")}/parent`,
      cancel_url: `${request.headers.get("origin")}/parent`,
      metadata: {
        toothId: tooth.id,
        childId: tooth.childId,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
