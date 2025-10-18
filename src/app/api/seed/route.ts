import { PrismaClient } from '@prisma/client'
import { NextResponse } from "next/server"

const prisma = new PrismaClient()

export async function POST() {
  try {
    // Create a test family
    const family = await prisma.family.upsert({
      where: { demoCode: "DEMO123" },
      update: {},
      create: {
        name: "The Johnson Family",
        demoCode: "DEMO123",
        parentName: "Sarah Johnson"
      }
    })

    // Create a test child
    const child = await prisma.child.upsert({
      where: { id: "test-child-id" },
      update: {},
      create: {
        id: "test-child-id",
        familyId: family.id,
        name: "Emma",
        age: 7,
        balance: 5.50,
        dailyBrushGoal: 2,
        priceIncrease: 0.05,
        currentToothValue: 1.00
      }
    })

    // Create all 20 baby teeth
    const teeth = [
      // Upper teeth (10)
      { childId: child.id, toothType: "Upper Right Molar", valueAtLoss: 1.00, paid: true, paidAt: new Date("2024-01-15") },
      { childId: child.id, toothType: "Upper Right Molar", valueAtLoss: 1.05, paid: true, paidAt: new Date("2024-02-20") },
      { childId: child.id, toothType: "Upper Right Canine", valueAtLoss: 1.10, paid: false },
      { childId: child.id, toothType: "Upper Right Lateral Incisor", valueAtLoss: 1.15, paid: false },
      { childId: child.id, toothType: "Upper Right Central Incisor", valueAtLoss: 1.20, paid: false },
      { childId: child.id, toothType: "Upper Left Central Incisor", valueAtLoss: 1.25, paid: false },
      { childId: child.id, toothType: "Upper Left Lateral Incisor", valueAtLoss: 1.30, paid: false },
      { childId: child.id, toothType: "Upper Left Canine", valueAtLoss: 1.35, paid: false },
      { childId: child.id, toothType: "Upper Left Molar", valueAtLoss: 1.40, paid: false },
      { childId: child.id, toothType: "Upper Left Molar", valueAtLoss: 1.45, paid: false },
      
      // Lower teeth (10)
      { childId: child.id, toothType: "Lower Right Molar", valueAtLoss: 1.50, paid: false },
      { childId: child.id, toothType: "Lower Right Molar", valueAtLoss: 1.55, paid: false },
      { childId: child.id, toothType: "Lower Right Canine", valueAtLoss: 1.60, paid: false },
      { childId: child.id, toothType: "Lower Right Lateral Incisor", valueAtLoss: 1.65, paid: false },
      { childId: child.id, toothType: "Lower Right Central Incisor", valueAtLoss: 1.70, paid: false },
      { childId: child.id, toothType: "Lower Left Central Incisor", valueAtLoss: 1.75, paid: false },
      { childId: child.id, toothType: "Lower Left Lateral Incisor", valueAtLoss: 1.80, paid: false },
      { childId: child.id, toothType: "Lower Left Canine", valueAtLoss: 1.85, paid: false },
      { childId: child.id, toothType: "Lower Left Molar", valueAtLoss: 1.90, paid: false },
      { childId: child.id, toothType: "Lower Left Molar", valueAtLoss: 1.95, paid: false }
    ]

    // Clear existing teeth and create new ones
    await prisma.tooth.deleteMany({
      where: { childId: child.id }
    })

    for (const toothData of teeth) {
      await prisma.tooth.create({
        data: toothData
      })
    }

    // Create some sample transactions
    await prisma.transaction.deleteMany({
      where: { childId: child.id }
    })

    await prisma.transaction.createMany({
      data: [
        {
          childId: child.id,
          amount: 1.00,
          description: "Upper Right Molar payment",
          status: "completed"
        },
        {
          childId: child.id,
          amount: 1.05,
          description: "Upper Right Molar payment",
          status: "completed"
        }
      ]
    })

    return NextResponse.json({
      success: true,
      message: "Sample data created successfully!",
      data: {
        family: family.name,
        child: child.name,
        teethCount: teeth.length
      }
    })

  } catch (error) {
    console.error("Error seeding database:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create sample data" },
      { status: 500 }
    )
  }
}
