export * from "./auth";
export * from "./client";
export * from "./session";
export * from "./errors";
export * from "./permissions";
export * from "./types";
export * from "./events";

import { auth } from "./auth";
export const handler = auth.handler;
