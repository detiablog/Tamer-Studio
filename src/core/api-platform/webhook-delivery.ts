import { db } from "@/lib/db";
import { apiWebhook, apiWebhookDelivery } from "@/lib/db/schema/api-platform";
import { eq } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";
import crypto from "crypto";

export async function deliverWebhook(webhookId: string, event: string, payload: Record<string, unknown>) {
  const id = generateId("whd");
  await db.insert(apiWebhookDelivery).values({ id, webhookId, event, payload });
  return id;
}

export async function processWebhookDelivery(deliveryId: string) {
  const [delivery] = await db.select().from(apiWebhookDelivery).where(eq(apiWebhookDelivery.id, deliveryId)).limit(1);
  if (!delivery) return;
  const [webhook] = await db.select().from(apiWebhook).where(eq(apiWebhook.id, delivery.webhookId)).limit(1);
  if (!webhook || !webhook.isActive) return;
  try {
    const body = JSON.stringify({ event: delivery.event, data: delivery.payload, timestamp: new Date().toISOString() });
    const headers: Record<string, string> = { "Content-Type": "application/json", "X-Webhook-Event": delivery.event };
    if (webhook.secret) {
      const signature = crypto.createHmac("sha256", webhook.secret).update(body).digest("hex");
      headers["X-Webhook-Signature"] = signature;
    }
    await fetch(webhook.url, { method: "POST", headers, body, signal: AbortSignal.timeout(10000) });
    await db.update(apiWebhookDelivery).set({ status: "delivered", statusCode: 200, deliveredAt: new Date() }).where(eq(apiWebhookDelivery.id, deliveryId));
  } catch (err) {
    const newAttempts = delivery.attemptCount + 1;
    if (newAttempts >= delivery.maxAttempts) {
      await db.update(apiWebhookDelivery).set({ status: "failed", response: err instanceof Error ? err.message : "Unknown", attemptCount: newAttempts }).where(eq(apiWebhookDelivery.id, deliveryId));
    } else {
      await db.update(apiWebhookDelivery).set({ attemptCount: newAttempts }).where(eq(apiWebhookDelivery.id, deliveryId));
    }
  }
}

export function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}
