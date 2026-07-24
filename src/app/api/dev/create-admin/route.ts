import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { admin } from "@/lib/db/schema";
import { hashPassword } from "@/core/admin/login";
import { randomUUID } from "crypto";

/**
 * POST /api/dev/create-admin
 * 
 * DEVELOPMENT ONLY - Creates an admin user
 * Remove this endpoint in production!
 */
export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  try {
    const adminId = randomUUID();
    const passwordHash = await hashPassword("SecureAdminPassword123!");

    // Check if admin already exists
    const existingAdmin = await db
      .select()
      .from(admin)
      .limit(1);

    if (existingAdmin.length > 0) {
      return NextResponse.json({
        message: "Admin user already exists",
        email: existingAdmin[0].email,
      });
    }

    // Create admin
    await db.insert(admin).values({
      id: adminId,
      email: "admin@tamer.studio",
      passwordHash,
      name: "Admin",
      role: "admin",
      isActive: true,
    });

    return NextResponse.json({
      message: "Admin user created successfully",
      email: "admin@tamer.studio",
      password: "SecureAdminPassword123!",
      masterKey: "admin-master-key-development",
      loginUrl: "http://localhost:3000/admin/login",
    });
  } catch (error) {
    console.error("Error creating admin:", error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
