import { z } from "zod";

export const CreateUserRequestSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  email: z.string().email("Invalid email format"),
  role: z.string().default("user"),
  status: z.string().optional(),
});

export type CreateUserRequest = z.infer<typeof CreateUserRequestSchema>;

export const UpdateUserRequestSchema = z.object({
  name: z.string().min(1, "Name is required").max(255).optional(),
  email: z.string().email("Invalid email format").optional(),
  role: z.string().optional(),
  status: z.string().optional(),
});

export type UpdateUserRequest = z.infer<typeof UpdateUserRequestSchema>;

export const UserResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  emailVerified: z.boolean().optional(),
  role: z.string().optional(),
  status: z.string().optional(),
  joined: z.string().optional(),
  lastActive: z.string().optional(),
});

export type UserResponse = z.infer<typeof UserResponseSchema>;