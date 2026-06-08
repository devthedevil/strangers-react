import PusherServer from "pusher";
import PusherClient from "pusher-js";

let _server: PusherServer | null = null;
export function getPusherServer(): PusherServer {
  if (!_server) {
    _server = new PusherServer({
      appId: process.env.PUSHER_APP_ID!,
      key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
      secret: process.env.PUSHER_SECRET!,
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      useTLS: true,
    });
  }
  return _server;
}

let _client: PusherClient | null = null;
export const getPusherClient = () => {
  if (typeof window === "undefined") return null;
  if (!_client) {
    _client = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      authEndpoint: "/api/pusher/auth",
    });
  }
  return _client;
};
