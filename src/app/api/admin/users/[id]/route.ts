import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: "User ID required" },
        { status: 400 }
      );
    }

    // Import postgres directly - fresh connection
    const postgres = await import("postgres").then(m => m.default);
    const sql = postgres(process.env.DATABASE_URL!);

    try {
      let query = `UPDATE "user" SET `;
      const values: any[] = [];
      let paramCount = 1;

      if (body.name) {
        values.push(body.name);
        query += `name = $${paramCount++}`;
      }

      if (body.email) {
        if (values.length > 0) query += ", ";
        values.push(body.email);
        query += `email = $${paramCount++}`;
      }

      if (body.role) {
        if (values.length > 0) query += ", ";
        values.push(body.role);
        query += `role = $${paramCount++}`;
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

      query += `, updated_at = NOW() WHERE id = $${paramCount} RETURNING id, name, email, role, status, email_verified, created_at, updated_at`;
      values.push(id);

      console.log("[PUT] Query:", query);
      console.log("[PUT] Values:", values.length, "params");

      // Execute raw query
      const [result] = await Promise.all([
        sql.unsafe(query, values),
      ]);

      await sql.end();

      if (!result || result.length === 0) {
        return NextResponse.json(
          { success: false, error: "User not found" },
          { status: 404 }
        );
      }

      const u = result[0];

      return NextResponse.json({
        success: true,
        message: "User updated successfully",
        data: {
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          status: u.status,
          emailVerified: u.email_verified,
          joined: new Date(u.created_at).toLocaleDateString(),
          lastActive: new Date(u.updated_at).toLocaleDateString(),
        },
      });
    } catch (dbError) {
      console.error("[PUT DB Error]", dbError);
      await sql.end();
      throw dbError;
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

    if (!id) {
      return NextResponse.json(
        { success: false, error: "User ID required" },
        { status: 400 }
      );
    }

    const postgres = await import("postgres").then(m => m.default);
    const sql = postgres(process.env.DATABASE_URL!);

    try {
      const result = await sql.unsafe(
        `DELETE FROM "user" WHERE id = $1 RETURNING id`,
        [id]
      );

      await sql.end();

      if (!result || result.length === 0) {
        return NextResponse.json(
          { success: false, error: "User not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (dbError) {
      console.error("[DELETE DB Error]", dbError);
      await sql.end();
      throw dbError;
    }
  } catch (error) {
    console.error("[DELETE Error]", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
