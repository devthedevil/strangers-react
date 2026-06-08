import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import Post from "@/models/Post";
import Comment from "@/models/Comment";

const CommentSchema = z.object({ content: z.string().min(1).max(1000) });

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const body = await req.json();
  const parsed = CommentSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  await dbConnect();
  const post = await Post.findById(id);
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const comment = await Comment.create({
    content: parsed.data.content,
    user: (session.user as { id: string }).id,
    post: post._id,
  });
  post.comments.push(comment._id.toString());
  await post.save();
  const populated = await Comment.findById(comment._id).populate("user", "name avatarUrl").lean();
  return NextResponse.json({ comment: populated }, { status: 201 });
}
