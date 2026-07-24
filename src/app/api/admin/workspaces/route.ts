import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const MOCK_WORKSPACES = [
  { id: "ws_1", name: "Default Workspace", slug: "default", description: "Main workspace", status: "active", createdAt: new Date().toISOString() },
  { id: "ws_2", name: "Development", slug: "development", description: "Dev environment", status: "active", createdAt: new Date().toISOString() },
  { id: "ws_3", name: "Testing", slug: "testing", description: "QA workspace", status: "active", createdAt: new Date().toISOString() },
];

async function getWorkspacesFromDB() {
  try {
    const postgres = await import("postgres").then(m => m.default);
    const sql = postgres(process.env.DATABASE_URL!);
    
    const result = await sql`SELECT * FROM workspace`;
    await sql.end();
    
    return result.map((w: any) => ({
      id: w.id,
      name: w.name,
      slug: w.slug,
      description: w.description,
      status: w.status,
      createdAt: new Date(w.created_at).toLocaleDateString(),
    }));
  } catch (error) {
    console.error("[DB Error]", error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const dbWorkspaces = await getWorkspacesFromDB();

    if (dbWorkspaces && dbWorkspaces.length > 0) {
      return NextResponse.json({
        success: true,
        data: dbWorkspaces,
        count: dbWorkspaces.length,
        source: "database",
      });
    }

    return NextResponse.json({
      success: true,
      data: MOCK_WORKSPACES,
      count: MOCK_WORKSPACES.length,
      source: "mock",
    });
  } catch (error) {
    console.error("[API Error]", error);
    return NextResponse.json({
      success: true,
      data: MOCK_WORKSPACES,
      count: MOCK_WORKSPACES.length,
      source: "mock",
    });
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

    const postgres = await import("postgres").then(m => m.default);
    const sql = postgres(process.env.DATABASE_URL!);

    try {
      const workspaceId = `ws_${Date.now()}`;
      const result = await sql`
        INSERT INTO workspace (id, name, slug, description, status, created_at, updated_at)
        VALUES (${workspaceId}, ${name}, ${slug}, ${description}, ${status || "active"}, NOW(), NOW())
        RETURNING *
      `;

      await sql.end();

      if (!result || result.length === 0) {
        return NextResponse.json(
          { success: false, error: "Failed to create workspace" },
          { status: 500 }
        );
      }

      const w = result[0];

      return NextResponse.json({
        success: true,
        message: "Workspace created successfully",
        data: {
          id: w.id,
          name: w.name,
          slug: w.slug,
          description: w.description,
          status: w.status,
          createdAt: new Date(w.created_at).toLocaleDateString(),
        },
      });
    } catch (dbError) {
      await sql.end();
      throw dbError;
    }
  } catch (error) {
    console.error("[API Error]", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
