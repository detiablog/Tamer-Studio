import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { StripeGateway } from "@/core/payment/stripe-gateway";
import { PaymentService } from "@/core/payment/payment.service";
import { logger } from "@/core/logger";

let gatewayInstance: StripeGateway | null = null;
let paymentServiceInstance: PaymentService | null = null;

function getGateway(): StripeGateway {
  if (!gatewayInstance) gatewayInstance = new StripeGateway();
  return gatewayInstance;
}

function getPaymentService(): PaymentService {
  if (!paymentServiceInstance) paymentServiceInstance = new PaymentService(getGateway());
  return paymentServiceInstance;
}

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

    const event = await getGateway().verifyWebhook(body, signature);

    await getPaymentService().handleWebhook(event);

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error("Webhook processing failed", error as Error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 400 }
    );
  }
}
