export type { LoginSchema } from "./schemas/login.schema";
export type { RegisterSchema } from "./schemas/register.schema";

export interface BetterAuthResult {
  error?: {
    message?: string;
  } | null;
}

export function hasAuthError(result: unknown): result is BetterAuthResult {
  return typeof result === "object" && result !== null && "error" in result && result.error !== null && result.error !== undefined;
}
