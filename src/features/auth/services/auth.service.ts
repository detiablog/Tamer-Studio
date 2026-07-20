import { authClient } from "@/lib/auth/auth-client";

export const authService = {
  signIn: authClient.signIn,

  signUp: authClient.signUp,

  signOut: authClient.signOut,
};
