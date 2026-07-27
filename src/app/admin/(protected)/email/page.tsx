import { cookies } from "next/headers";
import EmailDashboardPage from "./pageClient";

export default async function Page() {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get("admin_session")?.value ?? null;
  return <EmailDashboardPage adminToken={adminToken} />;
}
