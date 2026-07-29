import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { StripeGateway } from "@/core/payment/stripe-gateway";
import { handlePaymentCompleted } from "@/core/commerce/commerce-runtime";
import { findOrdersByWorkspace } from "@/core/commerce/commerce.repository";
import { logger } from "@/core/logger";

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

      if (!orderId && metadata.workspaceId) {
        const orders = await findOrdersByWorkspace(metadata.workspaceId as string);
        if (orders.length > 0) {
          orderId = orders[0].id;
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
