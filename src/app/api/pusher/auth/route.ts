import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPusherServer } from "@/lib/pusher";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const form = await req.formData();
  const socketId = String(form.get("socket_id") ?? "");
  const channel = String(form.get("channel_name") ?? "");
  const userId = (session.user as { id: string }).id;
  const presenceData = {
    user_id: userId,
    user_info: { name: session.user.name, avatarUrl: session.user.image ?? "" },
  };
  const authResponse = getPusherServer().authorizeChannel(socketId, channel, presenceData);
  return NextResponse.json(authResponse);
}
