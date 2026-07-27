import { z } from "zod";

export const CreateOrganizationRequestSchema = z.object({
  name: z.string().min(1, "Organization name is required").max(255),
  plan: z.string().default("Starter"),
  status: z.string().optional(),
});

export type CreateOrganizationRequest = z.infer<typeof CreateOrganizationRequestSchema>;

export const UpdateOrganizationRequestSchema = z.object({
  name: z.string().min(1, "Name is required").max(255).optional(),
  plan: z.string().optional(),
  status: z.string().optional(),
});

export type UpdateOrganizationRequest = z.infer<typeof UpdateOrganizationRequestSchema>;

export const OrganizationResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  plan: z.string().optional(),
  status: z.string().optional(),
  members: z.number().optional(),
  createdAt: z.string().optional(),
});

export type OrganizationResponse = z.infer<typeof OrganizationResponseSchema>;