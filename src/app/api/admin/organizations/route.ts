import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const MOCK_ORGS = [
  { id: "1", name: "Acme Studio", plan: "Pro", status: "Active", members: 5, createdAt: "Oct 1, 2026" },
  { id: "2", name: "Marketing Team", plan: "Enterprise", status: "Active", members: 12, createdAt: "Sep 15, 2026" },
  { id: "3", name: "Solo Creator", plan: "Starter", status: "Active", members: 1, createdAt: "Aug 20, 2026" },
];

async function getOrgsFromDB() {
  try {
    const postgres = await import("postgres").then(m => m.default);
    const sql = postgres(process.env.DATABASE_URL!);
    
    const result = await sql`SELECT * FROM organization`;
    await sql.end();
    
    return result.map((o: any) => ({
      id: o.id,
      name: o.name,
      plan: o.settings?.plan || "Starter",
      status: o.status.charAt(0).toUpperCase() + o.status.slice(1),
      members: 0,
      createdAt: new Date(o.created_at).toLocaleDateString(),
    }));
  } catch (error) {
    console.error("[DB Error]", error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const dbOrgs = await getOrgsFromDB();

    if (dbOrgs && dbOrgs.length > 0) {
      return NextResponse.json({
        success: true,
        data: dbOrgs,
        count: dbOrgs.length,
        source: "database",
      });
    }

    return NextResponse.json({
      success: true,
      data: MOCK_ORGS,
      count: MOCK_ORGS.length,
      source: "mock",
    });
  } catch (error) {
    console.error("[API Error]", error);
    return NextResponse.json({
      success: true,
      data: MOCK_ORGS,
      count: MOCK_ORGS.length,
      source: "mock",
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, plan, status } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Organization name is required" },
        { status: 400 }
      );
    }

    const postgres = await import("postgres").then(m => m.default);
    const sql = postgres(process.env.DATABASE_URL!);

    try {
      const id = `org_${Date.now()}`;
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").substring(0, 63);
      const settings = JSON.stringify({ plan: plan || "Starter" });

      const result = await sql`
        INSERT INTO organization (id, name, slug, owner_id, status, settings, created_at, updated_at)
        VALUES (${id}, ${name}, ${slug}, ${"user_admin_default"}, ${status || "active"}, ${settings}, NOW(), NOW())
        RETURNING *
      `;

      await sql.end();

      if (!result || result.length === 0) {
        return NextResponse.json(
          { success: false, error: "Failed to create organization" },
          { status: 500 }
        );
      }

      const o = result[0];

      return NextResponse.json({
        success: true,
        message: "Organization created successfully",
        data: {
          id: o.id,
          name: o.name,
          plan: o.settings?.plan || "Starter",
          status: o.status,
          members: 0,
          createdAt: new Date(o.created_at).toLocaleDateString(),
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
