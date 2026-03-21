import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId") ?? "anonymous";
  const scanType = req.nextUrl.searchParams.get("scanType");
  const fileName = req.nextUrl.searchParams.get("fileName");
  const allScans = req.nextUrl.searchParams.get("all") === "true";

  try {
    const scans = await prisma.resumeScan.findMany({
      where: {
        userId,
        ...(scanType ? { scanType: scanType as "JD_MATCH" | "ROLE_RATE" | "ATS" } : {}),
        ...(!allScans && fileName ? { fileName } : {}),
      },
      orderBy: { createdAt: "asc" },
      select: { id: true, score: true, createdAt: true, scanType: true, fileName: true },
    });
    return NextResponse.json(scans);
  } catch {
    return NextResponse.json([]);
  }
}
