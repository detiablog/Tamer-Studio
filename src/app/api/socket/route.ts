import type { NextApiRequest, NextApiResponse } from "next";
import { Server as HTTPServer } from "http";
import { Socket as NetSocket } from "net";
import { initializeWebSocket } from "@/core/websocket/server";

interface SocketServer extends HTTPServer {
  socket?: NetSocket;
}

interface ResponseWithSocket extends NextApiResponse {
  socket?: {
    server?: SocketServer;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: ResponseWithSocket
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!res.socket?.server) {
    return res.status(500).json({ error: "Socket server not available" });
  }

  const httpServer = res.socket.server as SocketServer;

  // Initialize Socket.io if not already done
  if (!httpServer.socket) {
    console.log("Initializing Socket.io server...");
    const io = await initializeWebSocket(httpServer);
    (httpServer as SocketServer).socket = io as unknown as NetSocket;
    console.log("Socket.io server initialized");
  }

  return res.status(200).json({ ok: true, message: "Socket.io server ready" });
}
