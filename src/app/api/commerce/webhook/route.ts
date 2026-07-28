import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { StripeGateway } from "@/core/payment/stripe-gateway";
import { handlePaymentCompleted } from "@/core/commerce/commerce-runtime";
import { logger } from "@/core/logger";
import { db } from "@/lib/db";
import { commerceOrder } from "@/lib/db/schema/commerce-plans";
import { eq } from "drizzle-orm";

const gateway = new StripeGateway();

export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  try {
    const body = await request.text();
    const event = await gateway.verifyWebhook(body, signature);

    if (event.type === "payment.completed") {
      const metadata = event.metadata ?? {};

      let orderId = metadata.orderId as string | undefined;

      if (!orderId) {
        const [existingOrder] = await db
          .select({ id: commerceOrder.id })
          .from(commerceOrder)
          .where(
            eq(commerceOrder.workspaceId, metadata.workspaceId as string)
          )
          .limit(1);

        if (existingOrder) {
          orderId = existingOrder.id;
        }
      }

      if (orderId) {
        await handlePaymentCompleted(orderId);
      } else {
        logger.warn("Webhook: no matching order found", {
          sessionId: event.sessionId,
          metadata,
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error("Commerce webhook processing failed", error as Error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 400 }
    );
  }
}
