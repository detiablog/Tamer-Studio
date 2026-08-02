import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: typeof window !== "undefined" ? `${window.location.origin}/api/auth` : (process.env.NEXT_PUBLIC_APP_URL || "") + "/api/auth",
  credentials: "include",
});
