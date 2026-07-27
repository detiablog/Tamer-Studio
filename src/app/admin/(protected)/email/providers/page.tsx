import { cookies } from "next/headers";
import { ProvidersPage } from "./pageClient";

export default async function Page() {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get("admin_session")?.value ?? null;
  return <ProvidersPage adminToken={adminToken} />;
}
