import { notFound } from "next/navigation";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import Post from "@/models/Post";
import "@/models/Comment";
import ProfileView from "@/components/ProfileView";
import type { PostWithUser } from "@/types";

export const dynamic = "force-dynamic";

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await dbConnect();
  let user;
  try {
    user = await User.findById(id).select("name email avatarUrl bio friendships createdAt").lean();
  } catch {
    notFound();
  }
  if (!user) notFound();

  const posts = await Post.find({ user: id })
    .sort({ createdAt: -1 })
    .limit(20)
    .populate("user", "name avatarUrl")
    .populate({
      path: "comments",
      options: { sort: { createdAt: 1 } },
      populate: { path: "user", select: "name avatarUrl" },
    })
    .lean();

  return (
    <ProfileView
      profile={JSON.parse(JSON.stringify(user))}
      initialPosts={JSON.parse(JSON.stringify(posts)) as PostWithUser[]}
    />
  );
}
