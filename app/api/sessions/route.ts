import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/sessions  ← "Request session" button
export async function POST(req: NextRequest) {
  try {
    const { volunteerId, requester, notes } = await req.json();

    if (!volunteerId || !requester) {
      return NextResponse.json({ error: "volunteerId and requester are required" }, { status: 400 });
    }

    // check if volunteers is available or useful
    const volunteer = await prisma.volunteer.findUnique({ where: { id: volunteerId } });
    if (!volunteer) {
      return NextResponse.json({ error: "Volunteer not found" }, { status: 404 });
    }
    if (volunteer.availability === "busy") {
      return NextResponse.json({ error: "Volunteer is busy this week" }, { status: 400 });
    }

    const session = await prisma.session.create({
      data: { volunteerId, requester, notes, status: "pending" },
    });

    return NextResponse.json(session, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}

// GET /api/sessions
export async function GET() {
  try {
    const sessions = await prisma.session.findMany({
      include: { volunteer: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(sessions);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
  }
}