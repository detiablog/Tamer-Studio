import type { NextRequest } from "next/server";
import { logger } from "@/core/logger";

export interface LogEntry {
  requestId: string;
  method: string;
  route: string;
  statusCode: number;
  duration: number;
  userId?: string;
  timestamp: string;
}

export function createLogEntry(
  requestId: string,
  method: string,
  route: string,
  statusCode: number,
  duration: number,
  userId?: string
): LogEntry {
  return {
    requestId,
    method,
    route,
    statusCode,
    duration,
    userId,
    timestamp: new Date().toISOString(),
  };
}

export function logRequest(entry: LogEntry): void {
  logger.info(JSON.stringify(entry));
}