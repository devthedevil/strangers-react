"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Camera, Loader2, MessageCircle, UserCheck, UserPlus } from "lucide-react";
import { toast } from "sonner";
import PostCard from "./PostCard";
import MediaUploader, { UploadedMedia } from "./MediaUploader";
import { initials } from "@/lib/utils";
import type { PostWithUser } from "@/types";

type Profile = {
  _id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  friendships: string[];
  createdAt: string;
};

export default function ProfileView({
  profile,
  initialPosts,
}: {
  profile: Profile;
  initialPosts: PostWithUser[];
}) {
  const { data: session } = useSession();
  const me = (session?.user as { id?: string } | undefined)?.id;
  const mine = me === profile._id;

  const [user, setUser] = useState(profile);
  const [posts, setPosts] = useState(initialPosts);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile.name);
  const [bio, setBio] = useState(profile.bio ?? "");
  const [avatar, setAvatar] = useState<UploadedMedia[]>(
    profile.avatarUrl
      ? [{ url: profile.avatarUrl, publicId: "avatar", type: "image" as const }]
      : []
  );
  const [saving, setSaving] = useState(false);
  const [isFriend, setIsFriend] = useState(!!me && profile.friendships.includes(me));
  const [friendBusy, setFriendBusy] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const avatarUrl = avatar[0]?.url || user.avatarUrl;
      const res = await fetch(`/api/users/${profile._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, bio, avatarUrl }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setUser({ ...user, ...data.user });
      setEditing(false);
      toast.success("Profile updated");
    } catch {
      toast.error("Could not save");
    } finally {
      setSaving(false);
    }
  };

  const toggleFriend = async () => {
    if (!me) return toast.error("Sign in first");
    setFriendBusy(true);
    try {
      const res = await fetch(`/api/friends/${profile._id}`, { method: "POST" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setIsFriend(data.following);
    } catch {
      toast.error("Could not update");
    } finally {
      setFriendBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <div className="relative">
            {user.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt={user.name}
                width={96}
                height={96}
                className="h-24 w-24 rounded-full object-cover ring-4 ring-white"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-2xl font-bold text-white">
                {initials(user.name)}
              </div>
            )}
          </div>
          <div className="flex-1 text-center sm:text-left">
            {editing ? (
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full max-w-xs rounded-lg border border-slate-300 px-3 py-1.5 text-lg font-bold"
              />
            ) : (
              <h1 className="text-2xl font-bold">{user.name}</h1>
            )}
            <p className="mt-1 text-sm text-slate-500">{user.email}</p>
            {editing ? (
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={2}
                maxLength={300}
                placeholder="A short bio…"
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            ) : (
              user.bio && <p className="mt-2 text-sm text-slate-700">{user.bio}</p>
            )}
            <p className="mt-2 text-xs text-slate-500">
              {user.friendships?.length ?? 0} friends
            </p>
          </div>
          <div className="flex flex-col gap-2">
            {mine ? (
              editing ? (
                <>
                  <button
                    onClick={save}
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Save
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="rounded-full border border-slate-300 px-4 py-2 text-sm"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-medium"
                >
                  <Camera className="h-4 w-4" /> Edit profile
                </button>
              )
            ) : (
              me && (
                <>
                  <button
                    onClick={toggleFriend}
                    disabled={friendBusy}
                    className={
                      isFriend
                        ? "inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-medium"
                        : "inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-4 py-2 text-sm font-semibold text-white"
                    }
                  >
                    {friendBusy ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isFriend ? (
                      <UserCheck className="h-4 w-4" />
                    ) : (
                      <UserPlus className="h-4 w-4" />
                    )}
                    {isFriend ? "Friends" : "Add friend"}
                  </button>
                  <Link
                    href={`/chat?with=${profile._id}`}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-medium"
                  >
                    <MessageCircle className="h-4 w-4" /> Message
                  </Link>
                </>
              )
            )}
          </div>
        </div>
        {editing && (
          <div className="mt-4">
            <p className="mb-2 text-sm font-medium">Profile picture</p>
            <MediaUploader media={avatar} setMedia={setAvatar} />
          </div>
        )}
      </section>

      <h2 className="text-lg font-semibold">Posts</h2>
      {posts.length === 0 ? (
        <p className="text-sm text-slate-500">No posts yet.</p>
      ) : (
        posts.map((p) => (
          <PostCard
            key={p._id}
            post={p}
            onDeleted={(id) => setPosts(posts.filter((x) => x._id !== id))}
          />
        ))
      )}
    </div>
  );
}
