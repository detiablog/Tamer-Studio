import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";

import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { logger } from "@/core/logger";
import { defaultEmailService } from "@/modules/email";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),

  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      const token = await defaultEmailService.createVerificationToken(user.email, user.id);
      await defaultEmailService.sendVerification(user.email, token, user.name);
      logger.info("Verification email sent", { userId: user.id, email: user.email });
    },
  },

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 12,
    sendResetPassword: async ({ user, url }) => {
      const token = await defaultEmailService.createResetPasswordToken(user.email, user.id);
      await defaultEmailService.sendResetPassword(user.email, token, user.name);
      logger.info("Reset password email sent", { userId: user.id, email: user.email });
    },
    onSignInError: async (ctx: { email?: string; error?: { message?: string } }) => {
      logger.security("Better-auth sign-in error", { email: ctx.email, error: ctx.error?.message });
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,
  },
});
