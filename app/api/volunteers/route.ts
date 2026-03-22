import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/volunteers?company=Google&skill=DSA&availability=available
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const company      = searchParams.get("company");
    const skill        = searchParams.get("skill");
    const availability = searchParams.get("availability");

    const volunteers = await prisma.volunteer.findMany({
      where: {
        ...(company      && { company:      { equals: company,      mode: "insensitive" } }),
        ...(availability && { availability: { equals: availability } }),
        ...(skill        && { skills:        { contains: skill,      mode: "insensitive" } }),
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(volunteers);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch volunteers" }, { status: 500 });
  }
}

// POST /api/volunteers  ← "Become a volunteer" button
export async function POST(req: NextRequest) {
  try {
    const { name, degree, company, role, bio, skills, availability } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const volunteer = await prisma.volunteer.create({
      data: { name, degree, company, role, bio, skills, availability: availability ?? "available" },
    });

    return NextResponse.json(volunteer, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create volunteer" }, { status: 500 });
  }
}