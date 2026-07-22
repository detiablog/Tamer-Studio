import { setAdminSessionCookie, clearAdminSessionCookie } from "./session";

export async function setAdminCookies(token: string): Promise<void> {
  await setAdminSessionCookie(token);
}

export async function clearAdminCookies(): Promise<void> {
  await clearAdminSessionCookie();
}
