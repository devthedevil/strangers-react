import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";

export async function POST(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: targetId } = await ctx.params;
  const myId = (session.user as { id: string }).id;
  if (myId === targetId) return NextResponse.json({ error: "Cannot friend self" }, { status: 400 });
  await dbConnect();
  const me = await User.findById(myId);
  const target = await User.findById(targetId);
  if (!me || !target) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const has = me.friendships.some((f) => f.toString() === targetId);
  let following: boolean;
  if (has) {
    me.friendships = me.friendships.filter((f) => f.toString() !== targetId);
    target.friendships = target.friendships.filter((f) => f.toString() !== myId);
    following = false;
  } else {
    me.friendships.push(targetId);
    target.friendships.push(myId);
    following = true;
  }
  await me.save();
  await target.save();
  return NextResponse.json({ following });
}
