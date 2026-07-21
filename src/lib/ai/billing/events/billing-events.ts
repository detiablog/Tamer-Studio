import type { BillingEvent, BillingEventType, BillingEventHandler } from "../../types/billing";

export interface BillingEventBus {
  emit(event: BillingEvent): Promise<void>;
  subscribe(type: BillingEventType, handler: BillingEventHandler): () => void;
}
