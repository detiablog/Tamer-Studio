import { z } from "zod";

export const CreateBillingRequestSchema = z.object({
  workspaceId: z.string().min(1, "Workspace ID is required"),
  plan: z.string().min(1, "Plan is required"),
  price: z.string().min(1, "Price is required"),
  currency: z.string().default("USD"),
  billingCycle: z.string().default("monthly"),
  status: z.string().optional(),
});

export type CreateBillingRequest = z.infer<typeof CreateBillingRequestSchema>;

export const BillingResponseSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  plan: z.string(),
  price: z.string(),
  currency: z.string(),
  billingCycle: z.string(),
  status: z.string(),
  createdAt: z.string().optional(),
});

export type BillingResponse = z.infer<typeof BillingResponseSchema>;