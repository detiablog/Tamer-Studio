import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { paymentEngineService } from "@/core/payment/payment-engine.service";
import { logger } from "@/core/logger";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;

  try {
    const rawBody = await request.text();
    const body = JSON.parse(rawBody);

    const signature = request.headers.get("x-ipaymu-signature")
      || request.headers.get("x-webhook-signature")
      || request.headers.get("stripe-signature")
      || "";

    const eventType = body.Event || body.event_type || body.type || "unknown";

    const result = await paymentEngineService.handleWebhook(provider, {
      provider,
      eventType,
      signature,
      data: body,
      rawBody,
    });

    if (!result.valid) {
      logger.warn(`Invalid webhook from ${provider}`, { eventType, error: result.error });
      return NextResponse.json({ received: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error(`Webhook processing failed for ${provider}`, error as Error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
