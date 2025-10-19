import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { toothId, childId } = await req.json();

    if (!toothId || !childId) {
      return NextResponse.json(
        { error: "Tooth ID and Child ID are required" },
        { status: 400 }
      );
    }

    // Get tooth details
    const tooth = await prisma.tooth.findUnique({
      where: { id: toothId },
    });

    if (!tooth) {
      return NextResponse.json(
        { error: "Tooth not found" },
        { status: 404 }
      );
    }

    if (tooth.paid) {
      return NextResponse.json(
        { error: "Tooth already paid" },
        { status: 400 }
      );
    }

    // Update tooth as paid and add to child's balance
    const [updatedTooth, updatedChild, transaction] = await prisma.$transaction([
      prisma.tooth.update({
        where: { id: toothId },
        data: {
          paid: true,
          paidAt: new Date(),
        },
      }),
      prisma.child.update({
        where: { id: childId },
        data: {
          balance: {
            increment: tooth.valueAtLoss,
          },
        },
      }),
      prisma.transaction.create({
        data: {
          childId,
          amount: tooth.valueAtLoss,
          description: `Payment for ${tooth.toothType}`,
          toothId,
          status: "completed",
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      tooth: updatedTooth,
      transaction,
    });
  } catch (error) {
    console.error("Error processing purchase:", error);
    return NextResponse.json(
      { error: "Failed to process purchase" },
      { status: 500 }
    );
  }
}