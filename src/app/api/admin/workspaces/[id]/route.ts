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
      let query = `UPDATE workspace SET `;
      const values: any[] = [];
      let paramCount = 1;

      if (body.name) {
        values.push(body.name);
        query += `name = $${paramCount++}`;
      }
      if (body.slug) {
        if (values.length > 0) query += ", ";
        values.push(body.slug);
        query += `slug = $${paramCount++}`;
      }
      if (body.description !== undefined) {
        if (values.length > 0) query += ", ";
        values.push(body.description);
        query += `description = $${paramCount++}`;
      }
      if (body.status) {
        if (values.length > 0) query += ", ";
        values.push(body.status);
        query += `status = $${paramCount++}`;
      }

      if (values.length === 0) {
        await sql.end();
        return NextResponse.json(
          { success: false, error: "No fields to update" },
          { status: 400 }
        );
      }

      query += `, updated_at = NOW() WHERE id = $${paramCount} RETURNING *`;
      values.push(id);

      const result = await sql.unsafe(query, values);
      await sql.end();

      if (!result || result.length === 0) {
        return NextResponse.json(
          { success: false, error: "Workspace not found" },
          { status: 404 }
        );
      }

      const w = result[0];

      return NextResponse.json({
        success: true,
        message: "Workspace updated successfully",
        data: {
          id: w.id,
          name: w.name,
          slug: w.slug,
          description: w.description,
          status: w.status,
          createdAt: new Date(w.created_at).toLocaleDateString(),
        },
      });
    } finally {
      await sql.end();
    }
  } catch (error) {
    console.error("[PUT Error]", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
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
      const result = await sql`DELETE FROM workspace WHERE id = ${id} RETURNING id`;
      await sql.end();

      if (!result || result.length === 0) {
        return NextResponse.json(
          { success: false, error: "Workspace not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Workspace deleted successfully",
      });
    } finally {
      await sql.end();
    }
  } catch (error) {
    console.error("[DELETE Error]", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
