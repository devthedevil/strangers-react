import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import Navbar from "@/components/Navbar";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Strangers — Connect with someone new",
  description: "A modern social network for sharing photos, videos, and conversation.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-slate-50 text-slate-900 antialiased`}>
        <SessionProvider session={session}>
          <Navbar />
          <main className="mx-auto max-w-3xl px-4 pt-6 pb-24">{children}</main>
          <Toaster richColors position="top-center" />
        </SessionProvider>
      </body>
    </html>
  );
}
