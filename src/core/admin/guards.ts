import { requireAdminSession } from "./session";

export async function requireAdmin(): Promise<{ session: Awaited<ReturnType<typeof requireAdminSession>> }> {
  const session = await requireAdminSession();
  return { session };
}
