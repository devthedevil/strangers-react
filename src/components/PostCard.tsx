"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Heart, MessageCircle, Trash2, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { initials, cn } from "@/lib/utils";
import type { PostWithUser, CommentWithUser } from "@/types";

export default function PostCard({
  post,
  onDeleted,
}: {
  post: PostWithUser;
  onDeleted?: (id: string) => void;
}) {
  const { data: session } = useSession();
  const me = (session?.user as { id?: string } | undefined)?.id;

  const [likes, setLikes] = useState(post.likes);
  const [liked, setLiked] = useState(!!me && post.likes.includes(me));
  const [comments, setComments] = useState<CommentWithUser[]>(post.comments ?? []);
  const [commentOpen, setCommentOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [busy, setBusy] = useState(false);

  const toggleLike = async () => {
    if (!me) return toast.error("Sign in to like");
    const prev = liked;
    const prevCount = likes.length;
    setLiked(!prev);
    setLikes(prev ? likes.filter((id) => id !== me) : [...likes, me]);
    try {
      const res = await fetch(`/api/posts/${post._id}/like`, { method: "POST" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setLiked(data.liked);
    } catch {
      setLiked(prev);
      setLikes(prev ? [...likes, me] : Array.from({ length: prevCount }, (_, i) => likes[i] ?? ""));
      toast.error("Could not like");
    }
  };

  const addComment = async () => {
    if (!me) return toast.error("Sign in to comment");
    const text = commentText.trim();
    if (!text) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/posts/${post._id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setComments([...comments, data.comment]);
      setCommentText("");
    } catch {
      toast.error("Could not comment");
    } finally {
      setBusy(false);
    }
  };

  const del = async () => {
    if (!confirm("Delete this post?")) return;
    try {
      const res = await fetch(`/api/posts/${post._id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      onDeleted?.(post._id);
    } catch {
      toast.error("Could not delete");
    }
  };

  const mine = me === post.user._id;

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <header className="flex items-center justify-between">
        <Link href={`/profile/${post.user._id}`} className="flex items-center gap-3">
          {post.user.avatarUrl ? (
            <Image
              src={post.user.avatarUrl}
              alt={post.user.name}
              width={40}
              height={40}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-sm font-bold text-white">
              {initials(post.user.name)}
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-slate-900">{post.user.name}</p>
            <p className="text-xs text-slate-500">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </p>
          </div>
        </Link>
        {mine && (
          <button onClick={del} className="rounded-full p-2 text-slate-400 hover:bg-red-50 hover:text-red-600">
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </header>

      <p className="mt-3 whitespace-pre-wrap text-sm text-slate-800">{post.content}</p>

      {post.media?.length > 0 && (
        <div className={cn("mt-3 grid gap-2", post.media.length > 1 ? "grid-cols-2" : "grid-cols-1")}>
          {post.media.map((m) => (
            <div key={m.publicId} className="overflow-hidden rounded-xl bg-slate-100">
              {m.type === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.url} alt="" className="w-full object-cover" />
              ) : (
                <video src={m.url} controls className="w-full" />
              )}
            </div>
          ))}
        </div>
      )}

      <footer className="mt-3 flex items-center gap-1 border-t border-slate-100 pt-3 text-sm">
        <button
          onClick={toggleLike}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-1.5 font-medium transition",
            liked ? "bg-pink-50 text-pink-600" : "text-slate-600 hover:bg-slate-100"
          )}
        >
          <Heart className={cn("h-4 w-4", liked && "fill-current")} />
          {likes.length}
        </button>
        <button
          onClick={() => setCommentOpen((v) => !v)}
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-100"
        >
          <MessageCircle className="h-4 w-4" />
          {comments.length}
        </button>
      </footer>

      {commentOpen && (
        <div className="mt-3 space-y-3 border-t border-slate-100 pt-3">
          {comments.map((c) => (
            <div key={c._id} className="flex gap-2">
              {c.user.avatarUrl ? (
                <Image
                  src={c.user.avatarUrl}
                  alt={c.user.name}
                  width={28}
                  height={28}
                  className="h-7 w-7 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-[10px] font-bold text-white">
                  {initials(c.user.name)}
                </div>
              )}
              <div className="flex-1 rounded-2xl bg-slate-50 px-3 py-2">
                <p className="text-xs font-semibold text-slate-900">{c.user.name}</p>
                <p className="text-sm text-slate-800">{c.content}</p>
              </div>
            </div>
          ))}
          {me && (
            <div className="flex items-center gap-2">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addComment()}
                placeholder="Write a comment…"
                className="flex-1 rounded-full bg-slate-100 px-4 py-2 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-indigo-300"
                maxLength={1000}
              />
              <button
                onClick={addComment}
                disabled={busy || !commentText.trim()}
                className="rounded-full bg-slate-900 p-2 text-white disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
