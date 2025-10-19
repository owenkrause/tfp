import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pushFundsViaDirect } from "@/lib/visa";

export async function POST(request: NextRequest) {
  try {
    const { toothId, childId, recipientCardNumber } = await request.json();

    if (!toothId || !childId || !recipientCardNumber) {
      return NextResponse.json(
        { error: "Missing required fields" },
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

    // Push funds via Visa Direct
    const visaResponse = await pushFundsViaDirect({
      amount: tooth.valueAtLoss,
      recipientCardNumber,
      recipientName: tooth.child.name,
      senderName: tooth.child.family.parentName,
      transactionId: tooth.id,
    });

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
        description: `Visa Direct payment for ${tooth.toothType}`,
        toothId: toothId,
        status: "completed",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Payment sent via Visa Direct",
      transaction: visaResponse,
    });
  } catch (error) {
    console.error("Visa Direct payment error:", error);
    return NextResponse.json(
      {
        error: "Payment failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
