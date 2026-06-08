import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import Post from "@/models/Post";

export async function POST(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  await dbConnect();
  const userId = (session.user as { id: string }).id;
  const post = await Post.findById(id);
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const idx = post.likes.findIndex((l) => l.toString() === userId);
  let liked: boolean;
  if (idx >= 0) {
    post.likes.splice(idx, 1);
    liked = false;
  } else {
    post.likes.push(userId);
    liked = true;
  }
  await post.save();
  return NextResponse.json({ liked, count: post.likes.length });
}
