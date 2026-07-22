import { db } from "@/lib/db";
import { userProfile, workspace } from "@/lib/db/schema/identity";
import { eq } from "drizzle-orm";

export class ModerationRepository {
  async suspendUser(userId: string, performedBy: string): Promise<void> {
    await db.update(userProfile).set({ status: "suspended", suspendedBy: performedBy }).where(eq(userProfile.userId, userId));
  }

  async unsuspendUser(userId: string, _performedBy: string): Promise<void> {
    await db.update(userProfile).set({ status: "active", suspendedBy: null }).where(eq(userProfile.userId, userId));
  }

  async suspendWorkspace(workspaceId: string, _performedBy: string): Promise<void> {
    await db.update(workspace).set({ status: "suspended" }).where(eq(workspace.id, workspaceId));
  }

  async unsuspendWorkspace(workspaceId: string, _performedBy: string): Promise<void> {
    await db.update(workspace).set({ status: "active" }).where(eq(workspace.id, workspaceId));
  }
}
