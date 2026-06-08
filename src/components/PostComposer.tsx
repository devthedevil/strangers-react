"use client";

import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import MediaUploader, { UploadedMedia } from "./MediaUploader";
import type { PostWithUser } from "@/types";

export default function PostComposer({ onPosted }: { onPosted: (p: PostWithUser) => void }) {
  const [content, setContent] = useState("");
  const [media, setMedia] = useState<UploadedMedia[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!content.trim()) return toast.error("Say something");
    setSubmitting(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim(), media }),
      });
      if (!res.ok) throw new Error("Failed");
      const { post } = await res.json();
      onPosted(post);
      setContent("");
      setMedia([]);
      toast.success("Posted");
    } catch (err) {
      console.error(err);
      toast.error("Could not post");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind?"
        rows={3}
        className="w-full resize-none rounded-lg border border-transparent bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white"
        maxLength={2000}
      />
      <div className="mt-3">
        <MediaUploader media={media} setMedia={setMedia} disabled={submitting} />
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-slate-500">{content.length}/2000</span>
        <button
          onClick={submit}
          disabled={submitting || !content.trim()}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 disabled:opacity-50"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Post
        </button>
      </div>
    </div>
  );
}
