import { useEffect, useState, useRef } from "react";
import { Socket, io } from "socket.io-client";
import { logger } from "@/core/logger";

interface UseWebSocketOptions {
  workspaceId?: string;
  productionId?: string;
  token?: string;
}

export function useWebSocket(options: UseWebSocketOptions) {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!options.token) return;

    const socket = io(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000", {
      auth: {
        token: options.token,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socket.on("connect", () => {
      logger.info("WebSocket connected");
      setConnected(true);

      if (options.workspaceId) {
        socket.emit("join-workspace", options.workspaceId);
      }
      if (options.productionId) {
        socket.emit("join-production", options.productionId);
      }
    });

    socket.on("disconnect", () => {
      logger.info("WebSocket disconnected");
      setConnected(false);
    });

    socket.on("error", (error) => {
      logger.error("WebSocket error:", error instanceof Error ? error : new Error(String(error)));
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [options.token, options.workspaceId, options.productionId]);

  const on = (event: string, callback: (...args: any[]) => void) => {
    socketRef.current?.on(event, callback);
  };

  const emit = (event: string, data: any) => {
    socketRef.current?.emit(event, data);
  };

  const off = (event: string) => {
    socketRef.current?.off(event);
  };

  return {
    socket: socketRef.current,
    connected,
    on,
    emit,
    off,
  };
}
