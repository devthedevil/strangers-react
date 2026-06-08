"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import PostComposer from "./PostComposer";
import PostCard from "./PostCard";
import type { PostWithUser } from "@/types";

export default function Feed({ initialPosts }: { initialPosts: PostWithUser[] }) {
  const { data: session, status } = useSession();
  const [posts, setPosts] = useState<PostWithUser[]>(initialPosts);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialPosts.length > 0) return;
    setLoading(true);
    fetch("/api/posts")
      .then((r) => r.json())
      .then((d) => setPosts(d.posts))
      .finally(() => setLoading(false));
  }, [initialPosts.length]);

  return (
    <div className="space-y-4">
      {status === "authenticated" ? (
        <PostComposer onPosted={(p) => setPosts([p, ...posts])} />
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <h2 className="text-lg font-bold">Welcome to Strangers</h2>
          <p className="mt-1 text-sm text-slate-600">
            Sign in to share photos, videos, and meet new people.
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <Link
              href="/signin"
              className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold"
            >
              Create account
            </Link>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      )}

      {posts.length === 0 && !loading ? (
        <p className="py-12 text-center text-sm text-slate-500">No posts yet. Be the first.</p>
      ) : (
        posts.map((p) => (
          <PostCard key={p._id} post={p} onDeleted={(id) => setPosts(posts.filter((x) => x._id !== id))} />
        ))
      )}
    </div>
  );
}
