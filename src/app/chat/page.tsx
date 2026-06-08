import { redirect } from "next/navigation";
import { auth } from "@/auth";
import ChatView from "@/components/ChatView";

export const dynamic = "force-dynamic";

export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<{ with?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/signin");
  const { with: withUser } = await searchParams;
  const me = (session.user as { id: string }).id;
  const peer = withUser || me;
  const chatroomId = [me, peer].sort().join("-");
  return (
    <ChatView
      meId={me}
      peerId={peer}
      meName={session.user.name ?? "Me"}
      chatroomId={chatroomId}
    />
  );
}
