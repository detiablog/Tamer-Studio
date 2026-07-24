import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { billing } from "@/lib/db/schema/billing-admin";
import { sql, eq, desc } from "drizzle-orm";

const MOCK_BILLING = [
  { id: "bill_1", workspaceId: "ws_1", plan: "Pro", price: "99.00", currency: "USD", billingCycle: "monthly", status: "active", createdAt: new Date().toISOString() },
  { id: "bill_2", workspaceId: "ws_2", plan: "Starter", price: "29.00", currency: "USD", billingCycle: "monthly", status: "active", createdAt: new Date().toISOString() },
];

export async function GET(request: NextRequest) {
  try {
    const rows = await db.select().from(billing).orderBy(desc(billing.createdAt));
    if (rows.length > 0) {
      return NextResponse.json({ success: true, data: rows, source: "database" });
    }
    return NextResponse.json({ success: true, data: MOCK_BILLING, source: "mock" });
  } catch (error) {
    return NextResponse.json({ success: true, data: MOCK_BILLING, source: "mock" });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workspaceId, plan, price, currency, billingCycle, status } = body;

    if (!plan || !price || !workspaceId) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const id = `bill_${Date.now()}`;
    const [row] = await db.insert(billing).values({
      id,
      workspaceId,
      plan,
      price,
      currency: currency || "USD",
      billingCycle: billingCycle || "monthly",
      status: status || "active",
    }).returning();

    return NextResponse.json({ success: true, message: "Created successfully", data: row });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
