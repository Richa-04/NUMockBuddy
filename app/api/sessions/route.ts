import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
console.log("RESEND_API_KEY:", process.env.RESEND_API_KEY); // 加这行
export async function POST(req: NextRequest) {
  try {
    const { volunteerId, requester, slotId, timeSlot, notes } = await req.json();

    if (!volunteerId || !requester) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. 创建 session
    const session = await prisma.session.create({
      data: { volunteerId, requester, slotId, notes, status: "pending" },
      include: { volunteer: true },
    });

    // 2. 把这个时间段标记为已预约
    if (slotId) {
      await prisma.availabilitySlot.update({
        where: { id: slotId },
        data: { booked: true },
      });
    }

    // 3. 发邮件给双方
    await resend.emails.send({
      from: "MockMate <noreply@yourdomain.com>",
      to: [requester, session.volunteer.email].filter(Boolean),
      subject: `Mock Interview Confirmed – ${timeSlot}`,
      html: `
        <h2>Mock Interview Session Confirmed 🎉</h2>
        <p><strong>Time:</strong> ${timeSlot}</p>
        <p><strong>Volunteer:</strong> ${session.volunteer.name}</p>
        <p><strong>Student:</strong> ${requester}</p>
        <br/>
        <a href="https://meet.google.com/new"
           style="background:#c8102e;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">
          Join Meeting
        </a>
      `,
    });

    return NextResponse.json(session, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}