import type { Order, OrderItem, CheckoutInput } from "../types";
import { DefaultOrderRepository } from "./order.repository";

export interface OrderService {
  createOrder(input: Omit<CheckoutInput, "voucherCode" | "couponCode">): Promise<Order>;
  getOrder(orderId: string): Promise<Order | undefined>;
  listOrders(workspaceId: string): Promise<Order[]>;
  markOrderPaid(orderId: string): Promise<Order>;
  markOrderFailed(orderId: string): Promise<Order>;
  cancelOrder(orderId: string): Promise<Order>;
  markOrderRefunded(orderId: string): Promise<Order>;
  updateOrderTotals(orderId: string, subtotal: number, tax: number, discount: number, total: number): Promise<Order>;
}

export class DefaultOrderService implements OrderService {
  private repository = new DefaultOrderRepository();

  async createOrder(input: Omit<CheckoutInput, "voucherCode" | "couponCode">): Promise<Order> {
    const subtotal = input.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const tax = 0;
    const discount = 0;
    const total = subtotal + tax - discount;

    const items: OrderItem[] = input.items.map((item) => ({
      id: `item_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      orderId: "",
      type: item.type,
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.unitPrice * item.quantity,
      metadata: item.metadata,
    }));

    return this.repository.createOrder({
      workspaceId: input.workspaceId,
      userId: input.userId,
      status: "draft",
      currency: input.currency,
      subtotal,
      tax,
      discount,
      total,
      items,
      metadata: input.metadata,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });
  }

  async getOrder(orderId: string): Promise<Order | undefined> {
    return this.repository.getOrder(orderId);
  }

  async listOrders(workspaceId: string): Promise<Order[]> {
    return this.repository.getOrdersByWorkspace(workspaceId);
  }

  async markOrderPaid(orderId: string): Promise<Order> {
    return this.repository.updateOrderStatus(orderId, "paid", { paidAt: new Date().toISOString() });
  }

  async markOrderFailed(orderId: string): Promise<Order> {
    return this.repository.updateOrderStatus(orderId, "failed");
  }

  async cancelOrder(orderId: string): Promise<Order> {
    return this.repository.cancelOrder(orderId);
  }

  async markOrderRefunded(orderId: string): Promise<Order> {
    return this.repository.updateOrderStatus(orderId, "refunded", { refundedAt: new Date().toISOString() });
  }

  async updateOrderTotals(orderId: string, subtotal: number, tax: number, discount: number, total: number): Promise<Order> {
    return this.repository.updateOrderTotals(orderId, subtotal, tax, discount, total);
  }
}
