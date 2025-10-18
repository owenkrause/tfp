import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { familyId, name, age, dailyBrushGoal, priceIncrease, currentToothValue } = await req.json();

    if (!familyId || !name || !age) {
      return NextResponse.json(
        { error: "Family ID, name, and age are required" },
        { status: 400 }
      );
    }

    const child = await prisma.child.create({
      data: {
        familyId,
        name,
        age: parseInt(age),
        dailyBrushGoal: dailyBrushGoal ? parseInt(dailyBrushGoal) : 2,
        priceIncrease: priceIncrease ? parseFloat(priceIncrease) : 0.05,
        currentToothValue: currentToothValue ? parseFloat(currentToothValue) : 1.00,
      },
    });

    return NextResponse.json({ child });
  } catch (error) {
    console.error("Error creating child:", error);
    return NextResponse.json(
      { error: "Failed to create child" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const { childId, dailyBrushGoal, priceIncrease, currentToothValue } = await req.json();

    if (!childId) {
      return NextResponse.json(
        { error: "Child ID is required" },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (dailyBrushGoal !== undefined) updateData.dailyBrushGoal = parseInt(dailyBrushGoal);
    if (priceIncrease !== undefined) updateData.priceIncrease = parseFloat(priceIncrease);
    if (currentToothValue !== undefined) updateData.currentToothValue = parseFloat(currentToothValue);

    const child = await prisma.child.update({
      where: { id: childId },
      data: updateData,
    });

    return NextResponse.json({ child });
  } catch (error) {
    console.error("Error updating child:", error);
    return NextResponse.json(
      { error: "Failed to update child" },
      { status: 500 }
    );
  }
}
