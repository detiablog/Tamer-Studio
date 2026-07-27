import { cookies } from "next/headers";
import StatisticsPage from "./pageClient";

export default async function Page() {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get("admin_session")?.value ?? null;
  return <StatisticsPage adminToken={adminToken} />;
}
