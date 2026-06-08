import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import Post from "@/models/Post";
import Comment from "@/models/Comment";
import { cloudinary } from "@/lib/cloudinary";

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  await dbConnect();
  const post = await Post.findById(id);
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (post.user.toString() !== (session.user as { id: string }).id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  // Best-effort delete from Cloudinary
  await Promise.allSettled(
    post.media.map((m) =>
      cloudinary.uploader.destroy(m.publicId, { resource_type: m.type === "video" ? "video" : "image" })
    )
  );
  await Comment.deleteMany({ post: post._id });
  await Post.deleteOne({ _id: post._id });
  return NextResponse.json({ ok: true });
}
