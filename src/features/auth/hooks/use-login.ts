import { authClient } from "@/lib/auth/auth-client";
import type { LoginSchema } from "../schemas/login.schema";

export type { LoginSchema } from "../schemas/login.schema";

export async function login(values: LoginSchema) {
  return authClient.signIn.email({
    email: values.email,
    password: values.password,
  });
}
