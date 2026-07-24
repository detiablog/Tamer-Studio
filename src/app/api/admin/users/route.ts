import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema/auth";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const dbUsers = await db.query.user.findMany();

    const mapped = dbUsers.map((u) => ({
      id: u.id,
      name: u.name || "Unknown",
      email: u.email,
      emailVerified: u.emailVerified || false,
      role: u.role || "user",
      status: u.status || "pending",
      joined: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "N/A",
      lastActive: u.updatedAt ? new Date(u.updatedAt).toLocaleDateString() : "Never",
    }));

    return NextResponse.json({
      success: true,
      data: mapped,
      count: mapped.length,
      source: "database",
    });
  } catch (error) {
    console.error("[API /admin/users] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch users from database",
        details: String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, role, status } = body;

    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: name, email" },
        { status: 400 }
      );
    }

    const existingUser = await db.query.user.findFirst({
      where: eq(user.email, email),
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Email already exists" },
        { status: 400 }
      );
    }

    const userId = `user_${Date.now()}`;
    const newUser = await db.insert(user).values({
      id: userId,
      name,
      email,
      role: role || "user",
      status: status || "pending",
      emailVerified: false,
    }).returning();

    return NextResponse.json({
      success: true,
      message: "User created successfully",
      data: {
        id: newUser[0].id,
        name: newUser[0].name,
        email: newUser[0].email,
        role: newUser[0].role,
        status: newUser[0].status,
        emailVerified: newUser[0].emailVerified,
        joined: newUser[0].createdAt ? new Date(newUser[0].createdAt).toLocaleDateString() : "N/A",
        lastActive: newUser[0].updatedAt ? new Date(newUser[0].updatedAt).toLocaleDateString() : "Never",
      },
    });
  } catch (error) {
    console.error("[API /admin/users] Create error:", error);
    return NextResponse.json(
      { success: false, error: "Database error: " + String(error) },
      { status: 500 }
    );
  }
}
