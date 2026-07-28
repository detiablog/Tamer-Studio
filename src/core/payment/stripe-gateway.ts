import Stripe from "stripe";
import type {
  PaymentGateway,
  CheckoutInput,
  CheckoutSession,
  WebhookEvent,
  RefundInput,
  RefundResult,
} from "./payment.types";

let _stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    _stripe = new Stripe(key, {
      apiVersion: "2025-05-28.basil" as Stripe.LatestApiVersion,
    });
  }
  return _stripe;
}

export class StripeGateway implements PaymentGateway {
  async createCheckout(input: CheckoutInput): Promise<CheckoutSession> {
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: input.currency.toLowerCase(),
            product_data: {
              name: input.planId
                ? `Plan Upgrade - ${input.planId}`
                : `Credit Purchase - ${input.credits} credits`,
            },
            unit_amount: Math.round(input.amount * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        workspaceId: input.workspaceId,
        userId: input.userId,
        ...(input.planId && { planId: input.planId }),
        ...(input.credits !== undefined && { credits: String(input.credits) }),
      },
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
    });

    return {
      id: session.id,
      url: session.url!,
      status: "pending",
    };
  }

  async verifyWebhook(payload: unknown, signature: string): Promise<WebhookEvent> {
    const event = getStripe().webhooks.constructEvent(
      payload as string | Buffer,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        return {
          type: "payment.completed",
          sessionId: session.id,
          amount: (session.amount_total ?? 0) / 100,
          currency: session.currency ?? "usd",
          metadata: session.metadata as Record<string, unknown> | undefined,
        };
      }
      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        return {
          type: "payment.failed",
          sessionId: session.id,
          amount: (session.amount_total ?? 0) / 100,
          currency: session.currency ?? "usd",
          metadata: session.metadata as Record<string, unknown> | undefined,
        };
      }
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const checkoutSessionId = charge.metadata?.checkout_session_id as string | undefined;
        return {
          type: "refund.completed",
          sessionId: checkoutSessionId ?? "",
          amount: (charge.amount_refunded ?? 0) / 100,
          currency: charge.currency ?? "usd",
          metadata: charge.metadata as Record<string, unknown> | undefined,
        };
      }
      default:
        throw new Error(`Unhandled webhook event type: ${event.type}`);
    }
  }

  async refund(input: RefundInput): Promise<RefundResult> {
    const session = await getStripe().checkout.sessions.retrieve(input.sessionId);
    const paymentIntentId = session.payment_intent as string;

    if (!paymentIntentId) {
      throw new Error("No payment intent found for session");
    }

    const refund = await getStripe().refunds.create({
      payment_intent: paymentIntentId,
      ...(input.amount && { amount: Math.round(input.amount * 100) }),
      ...(input.reason && { reason: input.reason as Stripe.RefundCreateParams.Reason }),
    });

    return {
      id: refund.id,
      status: refund.status === "succeeded" ? "completed" : "pending",
      amount: (refund.amount ?? 0) / 100,
    };
  }
}
