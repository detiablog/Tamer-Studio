import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const postgres = await import("postgres").then(m => m.default);
    const sql = postgres(process.env.DATABASE_URL!);

    try {
      let query = `UPDATE billing SET `;
      const values: any[] = [];
      let paramCount = 1;

      if (body.plan) {
        values.push(body.plan);
        query += `plan = $${paramCount++}`;
      }
      if (body.price) {
        if (values.length > 0) query += ", ";
        values.push(body.price);
        query += `price = $${paramCount++}`;
      }
      if (body.currency) {
        if (values.length > 0) query += ", ";
        values.push(body.currency);
        query += `currency = $${paramCount++}`;
      }
      if (body.billingCycle) {
        if (values.length > 0) query += ", ";
        values.push(body.billingCycle);
        query += `billing_cycle = $${paramCount++}`;
      }
      if (body.status) {
        if (values.length > 0) query += ", ";
        values.push(body.status);
        query += `status = $${paramCount++}`;
      }

      if (values.length === 0) {
        await sql.end();
        return NextResponse.json({ success: false, error: "No fields to update" }, { status: 400 });
      }

      query += `, updated_at = NOW() WHERE id = $${paramCount} RETURNING *`;
      values.push(id);

      const result = await sql.unsafe(query, values);
      await sql.end();

      if (!result || result.length === 0) {
        return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
      }

      return NextResponse.json({ success: true, message: "Updated successfully", data: result[0] });
    } finally {
      await sql.end();
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const postgres = await import("postgres").then(m => m.default);
    const sql = postgres(process.env.DATABASE_URL!);

    try {
      const result = await sql`DELETE FROM billing WHERE id = ${id} RETURNING id`;
      await sql.end();

      if (!result || result.length === 0) {
        return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
      }

      return NextResponse.json({ success: true, message: "Deleted successfully" });
    } finally {
      await sql.end();
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
