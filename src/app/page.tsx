import { dbConnect } from "@/lib/db";
import Post from "@/models/Post";
import "@/models/User";
import "@/models/Comment";
import Feed from "@/components/Feed";
import type { PostWithUser } from "@/types";

export const dynamic = "force-dynamic";

async function getInitialPosts(): Promise<PostWithUser[]> {
  try {
    await dbConnect();
    const docs = await Post.find({})
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("user", "name avatarUrl")
      .populate({
        path: "comments",
        options: { sort: { createdAt: 1 } },
        populate: { path: "user", select: "name avatarUrl" },
      })
      .lean();
    return JSON.parse(JSON.stringify(docs)) as PostWithUser[];
  } catch (e) {
    console.error("Initial posts fetch failed", e);
    return [];
  }
}

export default async function HomePage() {
  const posts = await getInitialPosts();
  return <Feed initialPosts={posts} />;
}
