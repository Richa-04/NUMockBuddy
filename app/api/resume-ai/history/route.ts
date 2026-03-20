import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId") ?? "anonymous";
  const scanType = req.nextUrl.searchParams.get("scanType");

  const scans = await prisma.resumeScan.findMany({
    where: {
      userId,
      ...(scanType ? { scanType: scanType as "JD_MATCH" | "ROLE_RATE" | "ATS" } : {}),
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(scans);
}
