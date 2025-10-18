import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const childId = searchParams.get("childId");
    const familyCode = searchParams.get("familyCode");
    const childName = searchParams.get("childName");

    if (!childId && !familyCode && !childName) {
      return NextResponse.json(
        { error: "Child ID, family code, or child name is required" },
        { status: 400 }
      );
    }

    let child;

    if (childId) {
      // Find child by ID
      child = await prisma.child.findUnique({
        where: { id: childId },
        include: {
          family: true,
          teeth: true,
          brushSessions: {
            orderBy: { timestamp: "desc" },
            take: 10,
          },
          transactions: {
            orderBy: { createdAt: "desc" },
            take: 10,
          },
        },
      });
    } else if (familyCode && childName) {
      // Find child by family code and name
      const family = await prisma.family.findUnique({
        where: { demoCode: familyCode },
      });

      if (!family) {
        return NextResponse.json(
          { error: "Family not found" },
          { status: 404 }
        );
      }

      child = await prisma.child.findFirst({
        where: {
          familyId: family.id,
          name: childName,
        },
        include: {
          family: true,
          teeth: true,
          brushSessions: {
            orderBy: { timestamp: "desc" },
            take: 10,
          },
          transactions: {
            orderBy: { createdAt: "desc" },
            take: 10,
          },
        },
      });
    } else if (familyCode) {
      // Find first child in family (for demo purposes)
      const family = await prisma.family.findUnique({
        where: { demoCode: familyCode },
        include: {
          children: {
            include: {
              teeth: true,
              brushSessions: {
                orderBy: { timestamp: "desc" },
                take: 10,
              },
              transactions: {
                orderBy: { createdAt: "desc" },
                take: 10,
              },
            },
          },
        },
      });

      if (!family || family.children.length === 0) {
        return NextResponse.json(
          { error: "No children found in family" },
          { status: 404 }
        );
      }

      child = family.children[0];
    }

    if (!child) {
      return NextResponse.json(
        { error: "Child not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ child });
  } catch (error) {
    console.error("Error fetching child:", error);
    return NextResponse.json(
      { error: "Failed to fetch child" },
      { status: 500 }
    );
  }
}
