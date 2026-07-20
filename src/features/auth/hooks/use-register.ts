import { authClient } from "@/lib/auth/auth-client";
import type { RegisterSchema } from "../schemas/register.schema";

export type { RegisterSchema } from "../schemas/register.schema";

export async function register(values: RegisterSchema) {
  return authClient.signUp.email({
    name: values.name,
    email: values.email,
    password: values.password,
  });
}
