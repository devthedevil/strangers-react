"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { LogOut, MessageCircle, User as UserIcon, Sparkles } from "lucide-react";
import { initials } from "@/lib/utils";

export default function Navbar() {
  const { data: session, status } = useSession();
  const user = session?.user as { id?: string; name?: string | null; image?: string | null } | undefined;

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
          <Sparkles className="h-5 w-5 text-indigo-600" />
          <span className="bg-gradient-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-transparent">
            Strangers
          </span>
        </Link>
        <nav className="flex items-center gap-2">
          {status === "loading" ? null : user ? (
            <>
              <Link
                href="/chat"
                className="flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                <MessageCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Chat</span>
              </Link>
              <Link
                href={`/profile/${user.id}`}
                className="flex items-center gap-2 rounded-full p-1 hover:bg-slate-100"
              >
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.name ?? ""}
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-xs font-bold text-white">
                    {initials(user.name ?? "U")}
                  </div>
                )}
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                aria-label="Sign out"
                className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <Link
                href="/signin"
                className="rounded-full px-4 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-slate-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
              >
                Join
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
