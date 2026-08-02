import type {
  PaymentGateway,
  CheckoutInput,
  CheckoutSession,
  WebhookEvent,
  RefundInput,
  RefundResult,
} from "./payment.types";
import { StripeGateway } from "./stripe-gateway";
import { WalletService } from "../wallet";
import { DefaultSubscriptionRepository, PlanService } from "../subscription";
import { DefaultInvoiceRepository } from "../invoice";
import { DefaultAuditService } from "../audit/audit.service";
import { logger } from "@/core/logger";
import { config } from "@/core/config";

export class PaymentService {
  private gateway: PaymentGateway;
  private walletService = new WalletService();
  private subscriptionRepository = new DefaultSubscriptionRepository();
  private planService = new PlanService();
  private invoiceRepository = new DefaultInvoiceRepository();
  private auditService = new DefaultAuditService();

  constructor(gateway?: PaymentGateway) {
    this.gateway = gateway ?? new StripeGateway();
  }

  async createCheckout(
    userId: string,
    workspaceId: string,
    planId?: string,
    credits?: number,
  ): Promise<CheckoutSession> {
    const plan = planId ? this.planService.getPlan(planId) : undefined;
    if (planId && !plan) {
      throw new Error(`Plan not found: ${planId}`);
    }

    const amount = plan
      ? (plan.pricePerCredit ?? 0) * plan.monthlyCredits
      : (credits ?? 0) * 0.01;

    if (amount <= 0) {
      throw new Error("Invalid amount: must be greater than 0");
    }

    const baseUrl = config.app.url;

    const input: CheckoutInput = {
      amount,
      currency: "USD",
      workspaceId,
      userId,
      planId,
      credits,
      successUrl: `${baseUrl}/billing?checkout=success`,
      cancelUrl: `${baseUrl}/billing?checkout=cancelled`,
    };

    const session = await this.gateway.createCheckout(input);

    await this.auditService.logUserAction("checkout.initiated", userId, {
      workspaceId,
      sessionId: session.id,
      planId,
      credits,
      amount,
    });

    logger.info("Checkout session created", {
      sessionId: session.id,
      workspaceId,
      userId,
      amount,
    });

    return session;
  }

  async handleWebhook(event: WebhookEvent): Promise<void> {
    switch (event.type) {
      case "payment.completed":
        await this.handlePaymentCompleted(event);
        break;
      case "payment.failed":
        await this.handlePaymentFailed(event);
        break;
      case "refund.completed":
        await this.handleRefundCompleted(event);
        break;
    }
  }

  private async handlePaymentCompleted(event: WebhookEvent): Promise<void> {
    const metadata = event.metadata ?? {};
    const workspaceId = metadata.workspaceId as string;
    const userId = metadata.userId as string;
    const planId = metadata.planId as string | undefined;
    const credits = metadata.credits ? Number(metadata.credits) : undefined;

    if (!workspaceId || !userId) {
      logger.error("Payment completed but missing workspaceId or userId", undefined, { metadata });
      return;
    }

    const wallet = await this.walletService.getOrCreateWallet(workspaceId);

    if (planId) {
      const existingSubscription = await this.subscriptionRepository.getSubscription(workspaceId);
      if (existingSubscription) {
        await this.subscriptionRepository.updateSubscriptionStatus(workspaceId, "canceled");
      }
      await this.subscriptionRepository.createSubscription(workspaceId, planId);

      const plan = this.planService.getPlan(planId);
      if (plan) {
        await this.walletService.credit(
          wallet.id,
          workspaceId,
          plan.monthlyCredits,
          "purchase",
          `Credits from ${plan.name} plan subscription`,
          { sessionId: event.sessionId, planId },
        );
      }
    } else if (credits) {
      await this.walletService.credit(
        wallet.id,
        workspaceId,
        credits,
        "purchase",
        `Purchased ${credits} credits`,
        { sessionId: event.sessionId, credits },
      );
    }

    const lineItems = [];
    if (planId) {
      const plan = this.planService.getPlan(planId);
      if (plan) {
        lineItems.push({
          description: `${plan.name} Plan - Monthly Subscription`,
          amount: event.amount,
        });
      }
    } else if (credits) {
      lineItems.push({
        description: `Credit Purchase - ${credits} credits`,
        amount: event.amount,
      });
    }

    if (lineItems.length > 0) {
      const invoice = await this.invoiceRepository.createInvoice(workspaceId, lineItems);
      await this.invoiceRepository.updateInvoiceStatus(invoice.id, "paid");
    }

    await this.auditService.logUserAction("payment.completed", userId, {
      workspaceId,
      sessionId: event.sessionId,
      planId,
      credits,
      amount: event.amount,
    });

    logger.info("Payment processed successfully", {
      sessionId: event.sessionId,
      workspaceId,
      amount: event.amount,
    });
  }

  private async handlePaymentFailed(event: WebhookEvent): Promise<void> {
    const metadata = event.metadata ?? {};
    const userId = metadata.userId as string;

    if (userId) {
      await this.auditService.logUserAction("payment.failed", userId, {
        sessionId: event.sessionId,
        amount: event.amount,
      });
    }

    logger.warn("Payment failed", {
      sessionId: event.sessionId,
      amount: event.amount,
    });
  }

  private async handleRefundCompleted(event: WebhookEvent): Promise<void> {
    const metadata = event.metadata ?? {};
    const workspaceId = metadata.workspaceId as string;
    const userId = metadata.userId as string;

    if (workspaceId) {
      const wallet = await this.walletService.getOrCreateWallet(workspaceId);
      const history = await this.walletService.getTransactionHistory(workspaceId);
      const purchaseTx = history.find(
        (tx) => tx.type === "purchase" && tx.metadata?.sessionId === event.sessionId
      );

      if (purchaseTx) {
        await this.walletService.refund(
          wallet.id,
          workspaceId,
          purchaseTx.id,
          "Stripe refund processed",
        );
      }
    }

    if (userId) {
      await this.auditService.logUserAction("payment.refunded", userId, {
        workspaceId,
        sessionId: event.sessionId,
        amount: event.amount,
      });
    }

    logger.info("Refund processed", {
      sessionId: event.sessionId,
      amount: event.amount,
    });
  }

  async refund(input: RefundInput): Promise<RefundResult> {
    const result = await this.gateway.refund(input);

    await this.auditService.logAction("refund.processed", undefined, undefined, {
      sessionId: input.sessionId,
      refundId: result.id,
      amount: result.amount,
    });

    logger.info("Refund processed via gateway", {
      refundId: result.id,
      sessionId: input.sessionId,
    });

    return result;
  }
}

export const paymentService = new PaymentService();
