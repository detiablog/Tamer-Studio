import { paymentEngine, type CreateCheckoutInput } from "./payment.engine";
import { paymentRepository } from "./payment.repository";
import { generateId } from "@/modules/email/email.encryption";

export class PaymentEngineService {
  async listPayments(filters?: { userId?: string; status?: string; providerId?: string; page?: number; limit?: number }) {
    return paymentRepository.findPayments(filters);
  }

  async getPayment(id: string) {
    return paymentRepository.findPaymentById(id);
  }

  async getPaymentByNumber(transactionNumber: string) {
    return paymentRepository.findPaymentByNumber(transactionNumber);
  }

  async getPaymentItems(paymentId: string) {
    return paymentRepository.findPaymentItems(paymentId);
  }

  async createCheckout(input: CreateCheckoutInput) {
    return paymentEngine.createCheckout(input);
  }

  async updatePaymentStatus(id: string, status: string, extra?: Record<string, unknown>) {
    return paymentRepository.updatePaymentStatus(id, status, extra);
  }

  async processRefund(paymentId: string, userId: string, amount: number, reason: string, adminId?: string) {
    const payment = await paymentRepository.findPaymentById(paymentId);
    if (!payment) throw new Error("Payment not found");

    return paymentEngine.processRefund(
      { providerTransactionId: payment.providerTransactionId || "", amount, reason },
      payment.providerId,
      userId,
      paymentId,
    );
  }

  async listInvoices(filters?: { userId?: string; status?: string; page?: number; limit?: number }) {
    return paymentRepository.findInvoices(filters);
  }

  async getInvoice(id: string) {
    return paymentRepository.findInvoiceById(id);
  }

  async getInvoiceByNumber(invoiceNumber: string) {
    return paymentRepository.findInvoiceByNumber(invoiceNumber);
  }

  async createInvoice(data: {
    userId: string;
    paymentId?: string;
    customerName: string;
    customerEmail: string;
    customerAddress?: Record<string, unknown>;
    items: Record<string, unknown>[];
    subtotal: string;
    tax?: string;
    discount?: string;
    total: string;
    currency?: string;
    notes?: string;
    companyInfo?: Record<string, unknown>;
    dueAt?: Date;
  }) {
    const invoiceNumber = this.generateInvoiceNumber();
    return paymentRepository.createInvoice({
      id: generateId("inv"),
      invoiceNumber,
      paymentId: data.paymentId || null,
      userId: data.userId,
      status: "draft",
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerAddress: data.customerAddress || null,
      items: data.items,
      subtotal: data.subtotal,
      tax: data.tax || "0",
      discount: data.discount || "0",
      total: data.total,
      currency: data.currency || "USD",
      notes: data.notes || null,
      companyInfo: data.companyInfo || {},
      dueAt: data.dueAt || null,
    });
  }

  async updateInvoiceStatus(id: string, status: string, extra?: Record<string, unknown>) {
    const updateExtra: Record<string, unknown> = { ...extra };
    if (status === "paid") updateExtra.paidAt = new Date();
    return paymentRepository.updateInvoiceStatus(id, status, updateExtra);
  }

  async listRefunds(filters?: { paymentId?: string; userId?: string; status?: string; page?: number; limit?: number }) {
    return paymentRepository.findRefunds(filters);
  }

  async updateRefundStatus(id: string, status: string, processedBy?: string) {
    const extra: Record<string, unknown> = {};
    if (status === "completed" || status === "failed") {
      extra.processedAt = new Date();
      if (processedBy) extra.processedBy = processedBy;
    }
    return paymentRepository.updateRefundStatus(id, status, extra);
  }

  async listWebhooks(filters?: { provider?: string; paymentId?: string; processed?: boolean; page?: number; limit?: number }) {
    return paymentRepository.findWebhooks(filters);
  }

  async handleWebhook(providerCode: string, payload: { provider: string; eventType: string; signature: string; data: Record<string, unknown>; rawBody: string }) {
    return paymentEngine.handleWebhook(providerCode, payload);
  }

  async getDashboardStats() {
    return paymentRepository.getDashboardStats();
  }

  async getAnalytics(dateRange?: { from?: Date; to?: Date }) {
    return paymentRepository.getAnalytics(dateRange);
  }

  async getPaymentStatusFromProvider(paymentId: string) {
    const payment = await paymentRepository.findPaymentById(paymentId);
    if (!payment) throw new Error("Payment not found");
    if (!payment.providerTransactionId) throw new Error("No provider transaction ID");
    return paymentEngine.getPaymentStatus(payment.providerId, payment.providerTransactionId);
  }

  private generateInvoiceNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `INV-${timestamp}-${random}`;
  }
}

export const paymentEngineService = new PaymentEngineService();
