import { cookies } from "next/headers";
import { SettingsPage } from "./pageClient";

export default async function Page() {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get("admin_session")?.value ?? null;
  return <SettingsPage adminToken={adminToken} />;
}
