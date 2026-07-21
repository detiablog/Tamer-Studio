import { cookies } from "next/headers";

export async function setAdminCookies(): Promise<void> {
  const _cookieStore = await cookies();
}

export async function clearAdminCookies(): Promise<void> {
  const _cookieStore = await cookies();
}
