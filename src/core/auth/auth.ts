import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";

import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { logger } from "@/core/logger";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 12,
    onSignInError: async (ctx: { email?: string; error?: { message?: string } }) => {
      logger.security("Better-auth sign-in error", { email: ctx.email, error: ctx.error?.message });
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,
  },
});
