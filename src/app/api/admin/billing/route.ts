import { NextResponse } from "next/server";
import type { NextRequest } from "next/request";

const MOCK_BILLING = [
  { id: "bill_1", workspaceId: "ws_1", plan: "Pro", price: "99.00", currency: "USD", billingCycle: "monthly", status: "active", createdAt: new Date().toISOString() },
  { id: "bill_2", workspaceId: "ws_2", plan: "Starter", price: "29.00", currency: "USD", billingCycle: "monthly", status: "active", createdAt: new Date().toISOString() },
];

async function getBillingFromDB() {
  try {
    const postgres = await import("postgres").then(m => m.default);
    const sql = postgres(process.env.DATABASE_URL!);
    const result = await sql`SELECT * FROM billing`;
    await sql.end();
    return result;
  } catch (error) {
    console.error("[DB Error]", error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const dbBilling = await getBillingFromDB();
    if (dbBilling) {
      return NextResponse.json({ success: true, data: dbBilling, source: "database" });
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

    const postgres = await import("postgres").then(m => m.default);
    const sql = postgres(process.env.DATABASE_URL!);

    try {
      const id = `bill_${Date.now()}`;
      const result = await sql`
        INSERT INTO billing (id, workspace_id, plan, price, currency, billing_cycle, status, created_at, updated_at)
        VALUES (${id}, ${workspaceId}, ${plan}, ${price}, ${currency || "USD"}, ${billingCycle}, ${status || "active"}, NOW(), NOW())
        RETURNING *
      `;
      await sql.end();

      return NextResponse.json({ success: true, message: "Created successfully", data: result[0] });
    } catch (dbError) {
      await sql.end();
      throw dbError;
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
