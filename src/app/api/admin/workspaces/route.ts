import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { workspace } from "@/lib/db/schema/identity";
import { sql, eq, desc } from "drizzle-orm";

const MOCK_WORKSPACES = [
  { id: "ws_1", name: "Default Workspace", slug: "default", description: "Main workspace", status: "active", createdAt: new Date().toISOString() },
  { id: "ws_2", name: "Development", slug: "development", description: "Dev environment", status: "active", createdAt: new Date().toISOString() },
  { id: "ws_3", name: "Testing", slug: "testing", description: "QA workspace", status: "active", createdAt: new Date().toISOString() },
];

export async function GET(request: NextRequest) {
  try {
    const rows = await db.select().from(workspace).orderBy(desc(workspace.createdAt));
    if (rows.length > 0) {
      const data = rows.map((w) => ({
        id: w.id,
        name: w.name,
        slug: w.slug,
        description: w.description,
        status: w.status,
        createdAt: new Date(w.createdAt).toLocaleDateString(),
      }));
      return NextResponse.json({ success: true, data, count: data.length, source: "database" });
    }
    return NextResponse.json({ success: true, data: MOCK_WORKSPACES, count: MOCK_WORKSPACES.length, source: "mock" });
  } catch (error) {
    return NextResponse.json({ success: true, data: MOCK_WORKSPACES, count: MOCK_WORKSPACES.length, source: "mock" });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, description, status } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { success: false, error: "Name and slug required" },
        { status: 400 }
      );
    }

    const workspaceId = `ws_${Date.now()}`;
    await db.insert(workspace).values({
      id: workspaceId,
      name,
      slug,
      description,
      type: "personal",
      ownerId: "user_admin_default",
      status: status || "active",
    });

    const [w] = await db.select().from(workspace).where(eq(workspace.id, workspaceId)).limit(1);

    return NextResponse.json({
      success: true,
      message: "Workspace created successfully",
      data: {
        id: w.id,
        name: w.name,
        slug: w.slug,
        description: w.description,
        status: w.status,
        createdAt: new Date(w.createdAt).toLocaleDateString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
