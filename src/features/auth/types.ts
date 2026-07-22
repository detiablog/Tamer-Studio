export type { LoginSchema } from "./schemas/login.schema";
export type { RegisterSchema } from "./schemas/register.schema";

export interface BetterAuthResult {
  error?: {
    message?: string;
  };
}

export function hasAuthError(result: unknown): result is BetterAuthResult {
  return typeof result === "object" && result !== null && "error" in result;
}
