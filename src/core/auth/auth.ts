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
      try {
        const token = await defaultEmailService.createVerificationToken(user.email, user.id);
        await defaultEmailService.sendVerification(user.email, token, user.name);
        logger.info("Verification email sent", { userId: user.id, email: user.email });
      } catch (err) {
        logger.error("Failed to send verification email (non-blocking)", err as Error);
      }
    },
  },

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 12,
    sendResetPassword: async ({ user, url }) => {
      try {
        const token = await defaultEmailService.createResetPasswordToken(user.email, user.id);
        await defaultEmailService.sendResetPassword(user.email, token, user.name);
        logger.info("Reset password email sent", { userId: user.id, email: user.email });
      } catch (err) {
        logger.error("Failed to send reset password email (non-blocking)", err as Error);
      }
    },
    onSignInError: async (ctx: { email?: string; error?: { message?: string } }) => {
      logger.security("Better-auth sign-in error", { email: ctx.email, error: ctx.error?.message });
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,
  },
});
