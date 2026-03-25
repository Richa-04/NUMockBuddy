import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { type, rating, text, extra } = await req.json();

    const feedback = await prisma.feedback.create({
      data: { type, rating: rating || null, text, extra: extra || {} },
    });

    return NextResponse.json({ success: true, id: feedback.id });
  } catch (err) {
    console.error("Feedback error:", err);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
