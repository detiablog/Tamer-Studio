import { AdminLandingBuilderClient } from "./AdminLandingBuilderClient";
import { cookies } from "next/headers";

export default async function AdminLandingBuilderPage() {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get("admin_session")?.value ?? null;

  return <AdminLandingBuilderClient adminToken={adminToken} />;
}
