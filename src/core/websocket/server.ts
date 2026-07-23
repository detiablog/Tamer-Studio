import { Server as HTTPServer } from "http";
import { Server as IOServer, Socket } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";

let io: IOServer | null = null;

export async function initializeWebSocket(server: HTTPServer): Promise<IOServer> {
  if (io) return io;

  const redisClient = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379",
  });

  await redisClient.connect();

  const pubClient = redisClient.duplicate();
  await pubClient.connect();

  io = new IOServer(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      credentials: true,
    },
    adapter: createAdapter(pubClient, redisClient),
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error"));
    }
    // Validate token here
    socket.userId = extractUserIdFromToken(token);
    next();
  });

  io.on("connection", handleConnection);

  return io;
}

function extractUserIdFromToken(token: string): string {
  // Implement JWT validation here
  return token.split(":")[0];
}

interface Socket extends Socket {
  userId?: string;
}

function handleConnection(socket: Socket) {
  console.log(`User connected: ${socket.userId}`);

  // Join workspace room
  socket.on("join-workspace", (workspaceId: string) => {
    socket.join(`workspace:${workspaceId}`);
    socket.emit("workspace-joined", { workspaceId });
  });

  // Join production room (real-time collaboration)
  socket.on("join-production", (productionId: string) => {
    socket.join(`production:${productionId}`);
    socket.emit("production-joined", { productionId });
    
    // Notify others
    socket.to(`production:${productionId}`).emit("user-joined", {
      userId: socket.userId,
      timestamp: new Date(),
    });
  });

  // Collaborative editing: text input
  socket.on("edit-production-content", (data: {
    productionId: string;
    field: string;
    value: string;
    timestamp: number;
  }) => {
    socket.to(`production:${data.productionId}`).emit("production-content-updated", {
      ...data,
      userId: socket.userId,
    });
  });

  // Collaborative editing: cursor position
  socket.on("cursor-move", (data: {
    productionId: string;
    x: number;
    y: number;
  }) => {
    socket.to(`production:${data.productionId}`).emit("user-cursor-moved", {
      userId: socket.userId,
      x: data.x,
      y: data.y,
    });
  });

  // Production status change
  socket.on("production-status-changed", (data: {
    productionId: string;
    status: string;
    metadata?: Record<string, unknown>;
  }) => {
    socket.to(`production:${data.productionId}`).emit("production-status-changed", {
      ...data,
      userId: socket.userId,
      timestamp: new Date(),
    });
  });

  // Comments & feedback
  socket.on("add-comment", (data: {
    productionId: string;
    text: string;
    position?: { x: number; y: number };
  }) => {
    socket.to(`production:${data.productionId}`).emit("comment-added", {
      id: `${socket.userId}-${Date.now()}`,
      userId: socket.userId,
      ...data,
      timestamp: new Date(),
    });
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.userId}`);
    // Broadcast user left to all rooms
    socket.broadcast.emit("user-left", {
      userId: socket.userId,
      timestamp: new Date(),
    });
  });
}

export function getWebSocketServer(): IOServer {
  if (!io) {
    throw new Error("WebSocket server not initialized");
  }
  return io;
}

export function emitToWorkspace(workspaceId: string, event: string, data: unknown) {
  if (!io) return;
  io.to(`workspace:${workspaceId}`).emit(event, data);
}

export function emitToProduction(productionId: string, event: string, data: unknown) {
  if (!io) return;
  io.to(`production:${productionId}`).emit(event, data);
}
