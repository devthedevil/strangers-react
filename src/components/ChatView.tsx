"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { getPusherClient } from "@/lib/pusher";
import { initials } from "@/lib/utils";

type Msg = {
  _id: string;
  message: string;
  createdAt: string;
  from: { _id: string; name: string; avatarUrl?: string };
};

export default function ChatView({
  meId,
  peerId,
  meName,
  chatroomId,
}: {
  meId: string;
  peerId: string;
  meName: string;
  chatroomId: string;
}) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/messages?chatroomId=${encodeURIComponent(chatroomId)}`)
      .then((r) => r.json())
      .then((d) => setMessages(d.messages ?? []));
  }, [chatroomId]);

  useEffect(() => {
    const pusher = getPusherClient();
    if (!pusher) return;
    const channel = pusher.subscribe(`presence-${chatroomId}`);
    const handler = (data: Msg) => setMessages((m) => [...m, data]);
    channel.bind("new-message", handler);
    return () => {
      channel.unbind("new-message", handler);
      pusher.unsubscribe(`presence-${chatroomId}`);
    };
  }, [chatroomId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const send = async () => {
    const v = text.trim();
    if (!v) return;
    if (peerId === meId) return toast.error("Open a profile and tap Message to start a chat.");
    setSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatroomId, message: v, to: peerId }),
      });
      if (!res.ok) throw new Error();
      setText("");
    } catch {
      toast.error("Could not send");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="border-b border-slate-100 px-4 py-3">
        <h1 className="text-sm font-semibold">Chat</h1>
        <p className="text-xs text-slate-500">
          {peerId === meId
            ? "Open a profile and tap Message to start a conversation."
            : `Talking to ${peerId.slice(-6)}`}
        </p>
      </header>
      <div className="h-[60vh] space-y-2 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="py-12 text-center text-sm text-slate-400">No messages yet.</p>
        )}
        {messages.map((m) => {
          const mine = m.from._id === meId;
          return (
            <div key={m._id} className={mine ? "flex justify-end" : "flex justify-start"}>
              {!mine && (
                <div className="mr-2 flex h-7 w-7 shrink-0 items-center justify-center self-end rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-[10px] font-bold text-white">
                  {initials(m.from.name || "U")}
                </div>
              )}
              <div
                className={
                  mine
                    ? "max-w-[75%] rounded-2xl rounded-br-md bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-4 py-2 text-sm text-white"
                    : "max-w-[75%] rounded-2xl rounded-bl-md bg-slate-100 px-4 py-2 text-sm text-slate-900"
                }
              >
                {m.message}
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
      <footer className="flex items-center gap-2 border-t border-slate-100 p-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder={peerId === meId ? "Select a friend first…" : `Message as ${meName}`}
          disabled={sending || peerId === meId}
          className="flex-1 rounded-full bg-slate-100 px-4 py-2 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-indigo-300 disabled:opacity-60"
          maxLength={1000}
        />
        <button
          onClick={send}
          disabled={sending || !text.trim() || peerId === meId}
          className="rounded-full bg-slate-900 p-2 text-white disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
        </button>
      </footer>
    </div>
  );
}
