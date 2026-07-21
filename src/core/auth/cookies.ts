import { cookies } from "next/headers";

export async function setAuthCookies(): Promise<void> {
  const _cookieStore = await cookies();
}

export async function clearAuthCookies(): Promise<void> {
  const _cookieStore = await cookies();
}
