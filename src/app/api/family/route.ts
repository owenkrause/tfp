import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { name, parentName } = await req.json();

    if (!name || !parentName) {
      return NextResponse.json(
        { error: "Family name and parent name are required" },
        { status: 400 }
      );
    }

    // Generate a unique demo code for family access
    const demoCode = Math.random().toString(36).substring(2, 10).toUpperCase();

    const family = await prisma.family.create({
      data: {
        name,
        parentName,
        demoCode,
      },
    });

    return NextResponse.json({ family });
  } catch (error) {
    console.error("Error creating family:", error);
    return NextResponse.json(
      { error: "Failed to create family" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const demoCode = searchParams.get("demoCode");

    if (!demoCode) {
      return NextResponse.json(
        { error: "Demo code is required" },
        { status: 400 }
      );
    }

    const family = await prisma.family.findUnique({
      where: { demoCode },
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

    if (!family) {
      return NextResponse.json(
        { error: "Family not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ family });
  } catch (error) {
    console.error("Error fetching family:", error);
    return NextResponse.json(
      { error: "Failed to fetch family" },
      { status: 500 }
    );
  }
}
