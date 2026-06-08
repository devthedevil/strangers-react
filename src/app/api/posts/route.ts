import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import Post from "@/models/Post";
import "@/models/User";
import "@/models/Comment";

const MediaSchema = z.object({
  url: z.string().url(),
  publicId: z.string(),
  type: z.enum(["image", "video"]),
  width: z.number().optional(),
  height: z.number().optional(),
  duration: z.number().optional(),
});

const CreatePostSchema = z.object({
  content: z.string().min(1).max(2000),
  media: z.array(MediaSchema).max(4).optional(),
});

export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get("limit") ?? 30), 60);
  const userId = searchParams.get("userId");
  const filter = userId ? { user: userId } : {};
  const posts = await Post.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("user", "name avatarUrl")
    .populate({
      path: "comments",
      options: { sort: { createdAt: 1 }, limit: 50 },
      populate: { path: "user", select: "name avatarUrl" },
    })
    .lean();
  return NextResponse.json({ posts });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const parsed = CreatePostSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.issues }, { status: 400 });
    }
    await dbConnect();
    const post = await Post.create({
      content: parsed.data.content,
      media: parsed.data.media ?? [],
      user: (session.user as { id: string }).id,
    });
    const populated = await Post.findById(post._id).populate("user", "name avatarUrl").lean();
    return NextResponse.json({ post: populated }, { status: 201 });
  } catch (err) {
    console.error("create post error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
