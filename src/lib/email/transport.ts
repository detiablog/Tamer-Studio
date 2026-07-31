import { db } from "@/lib/db";
import { emailProvider } from "@/lib/db/schema/email";
import { eq, and, desc } from "drizzle-orm";
import { decrypt } from "@/modules/email/email.encryption";
import { createSmtpTransport, type SmtpTransportConfig } from "./smtp";
import type { Transporter } from "nodemailer";

export async function getTransportForProvider(providerId: string): Promise<Transporter | null> {
  const [provider] = await db
    .select()
    .from(emailProvider)
    .where(eq(emailProvider.id, providerId))
    .limit(1);

  if (!provider || !provider.isActive || provider.type !== "smtp") return null;

  if (!provider.credentialsEncrypted) return null;

  try {
    const decrypted = decrypt(provider.credentialsEncrypted);
    const creds = JSON.parse(decrypted);

    const config: SmtpTransportConfig = {
      host: creds.host || "",
      port: Number(creds.port) || 587,
      secure: creds.secure === true || creds.secure === "true",
      username: creds.username,
      password: creds.password,
      timeout: (provider.timeout || 30) * 1000,
      encryption: creds.encryption || (creds.secure ? "ssl" : "none"),
    };

    return createSmtpTransport(config);
  } catch {
    return null;
  }
}

export async function getActiveSmtpTransport(): Promise<{ transporter: Transporter; provider: typeof emailProvider.$inferSelect } | null> {
  const [provider] = await db
    .select()
    .from(emailProvider)
    .where(and(eq(emailProvider.isActive, true), eq(emailProvider.type, "smtp")))
    .orderBy(emailProvider.priority)
    .limit(1);

  if (!provider) return null;

  const transporter = await getTransportForProvider(provider.id);
  if (!transporter) return null;

  return { transporter, provider };
}

export async function loadSmtpConfigFromDb(providerId?: string): Promise<SmtpTransportConfig | null> {
  let query = db.select().from(emailProvider);

  if (providerId) {
    query = query.where(eq(emailProvider.id, providerId)) as typeof query;
  } else {
    query = query.where(and(eq(emailProvider.isActive, true), eq(emailProvider.type, "smtp"))) as typeof query;
  }

  const [provider] = await query.orderBy(emailProvider.priority).limit(1);
  if (!provider || !provider.credentialsEncrypted) return null;

  try {
    const decrypted = decrypt(provider.credentialsEncrypted);
    const creds = JSON.parse(decrypted);

    return {
      host: creds.host || "",
      port: Number(creds.port) || 587,
      secure: creds.secure === true || creds.secure === "true",
      username: creds.username,
      password: creds.password,
      timeout: (provider.timeout || 30) * 1000,
      encryption: creds.encryption || (creds.secure ? "ssl" : "none"),
    };
  } catch {
    return null;
  }
}
