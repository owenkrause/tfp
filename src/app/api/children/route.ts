import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Default baby teeth - 20 teeth total
const DEFAULT_TEETH = [
  // Upper teeth (10)
  { toothType: "Upper Central Incisor (Right)", position: 1 },
  { toothType: "Upper Central Incisor (Left)", position: 2 },
  { toothType: "Upper Lateral Incisor (Right)", position: 3 },
  { toothType: "Upper Lateral Incisor (Left)", position: 4 },
  { toothType: "Upper Canine (Right)", position: 5 },
  { toothType: "Upper Canine (Left)", position: 6 },
  { toothType: "Upper First Molar (Right)", position: 7 },
  { toothType: "Upper First Molar (Left)", position: 8 },
  { toothType: "Upper Second Molar (Right)", position: 9 },
  { toothType: "Upper Second Molar (Left)", position: 10 },
  // Lower teeth (10)
  { toothType: "Lower Central Incisor (Right)", position: 11 },
  { toothType: "Lower Central Incisor (Left)", position: 12 },
  { toothType: "Lower Lateral Incisor (Right)", position: 13 },
  { toothType: "Lower Lateral Incisor (Left)", position: 14 },
  { toothType: "Lower Canine (Right)", position: 15 },
  { toothType: "Lower Canine (Left)", position: 16 },
  { toothType: "Lower First Molar (Right)", position: 17 },
  { toothType: "Lower First Molar (Left)", position: 18 },
  { toothType: "Lower Second Molar (Right)", position: 19 },
  { toothType: "Lower Second Molar (Left)", position: 20 },
];

export async function POST(req: Request) {
  try {
    const { familyId, name, birthdate, dailyBrushGoal, priceIncrease, currentToothValue } = await req.json();

    if (!familyId || !name || !birthdate) {
      return NextResponse.json(
        { error: "Family ID, name, and birthdate are required" },
        { status: 400 }
      );
    }

    const initialToothValue = currentToothValue ? parseFloat(currentToothValue) : 1.00;

    // Create child with all teeth in a transaction
    const child = await prisma.child.create({
      data: {
        familyId,
        name,
        birthdate: new Date(birthdate),
        dailyBrushGoal: dailyBrushGoal ? parseInt(dailyBrushGoal) : 2,
        priceIncrease: priceIncrease ? parseFloat(priceIncrease) : 0.05,
        currentToothValue: initialToothValue,
        teeth: {
          create: DEFAULT_TEETH.map(tooth => ({
            toothType: tooth.toothType,
            valueAtLoss: initialToothValue,
            paid: false,
            lostDate: new Date(), // Default to today, will be updated when actually lost
          })),
        },
      },
      include: {
        teeth: true,
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
