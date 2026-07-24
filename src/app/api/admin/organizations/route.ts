import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { organization } from "@/lib/db/schema/identity";
import { sql, eq, desc } from "drizzle-orm";

const MOCK_ORGS = [
  { id: "1", name: "Acme Studio", plan: "Pro", status: "Active", members: 5, createdAt: "Oct 1, 2026" },
  { id: "2", name: "Marketing Team", plan: "Enterprise", status: "Active", members: 12, createdAt: "Sep 15, 2026" },
  { id: "3", name: "Solo Creator", plan: "Starter", status: "Active", members: 1, createdAt: "Aug 20, 2026" },
];

export async function GET(request: NextRequest) {
  try {
    const rows = await db.select().from(organization).orderBy(desc(organization.createdAt));
    if (rows.length > 0) {
      const data = rows.map((o) => ({
        id: o.id,
        name: o.name,
        plan: (o.settings as Record<string, unknown>)?.plan || "Starter",
        status: o.status.charAt(0).toUpperCase() + o.status.slice(1),
        members: 0,
        createdAt: new Date(o.createdAt).toLocaleDateString(),
      }));
      return NextResponse.json({ success: true, data, count: data.length, source: "database" });
    }
    return NextResponse.json({ success: true, data: MOCK_ORGS, count: MOCK_ORGS.length, source: "mock" });
  } catch (error) {
    return NextResponse.json({ success: true, data: MOCK_ORGS, count: MOCK_ORGS.length, source: "mock" });
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

    const id = `org_${Date.now()}`;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").substring(0, 63);
    const settings = { plan: plan || "Starter" };

    const [row] = await db.insert(organization).values({
      id,
      name,
      slug,
      ownerId: "user_admin_default",
      settings,
      status: status || "active",
    }).returning();

    return NextResponse.json({
      success: true,
      message: "Organization created successfully",
      data: {
        id: row.id,
        name: row.name,
        plan: (row.settings as Record<string, unknown>)?.plan || "Starter",
        status: row.status,
        members: 0,
        createdAt: new Date(row.createdAt).toLocaleDateString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
