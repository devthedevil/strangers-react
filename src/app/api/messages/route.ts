import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import Message from "@/models/Message";
import { getPusherServer } from "@/lib/pusher";

const SendSchema = z.object({
  chatroomId: z.string().min(1),
  message: z.string().min(1).max(1000),
  to: z.string().min(1),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const chatroomId = searchParams.get("chatroomId");
  if (!chatroomId) return NextResponse.json({ messages: [] });
  await dbConnect();
  const messages = await Message.find({ chatroomId })
    .sort({ createdAt: 1 })
    .limit(200)
    .populate("from", "name avatarUrl")
    .lean();
  return NextResponse.json({ messages });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const parsed = SendSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  await dbConnect();
  const fromId = (session.user as { id: string }).id;
  const created = await Message.create({
    chatroomId: parsed.data.chatroomId,
    message: parsed.data.message,
    from: fromId,
    to: parsed.data.to,
  });
  const populated = await Message.findById(created._id).populate("from", "name avatarUrl").lean();
  await getPusherServer().trigger(`presence-${parsed.data.chatroomId}`, "new-message", populated);
  return NextResponse.json({ message: populated }, { status: 201 });
}
