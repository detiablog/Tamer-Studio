import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const MOCK_USERS = [
  { id: "1", name: "Bian", email: "aoneshoper@gmail.com", emailVerified: true, role: "admin", status: "active", joined: "Oct 20, 2026", lastActive: "2 minutes ago" },
  { id: "2", name: "Test", email: "test@example.com", emailVerified: false, role: "user", status: "pending", joined: "Oct 19, 2026", lastActive: "1 hour ago" },
  { id: "3", name: "Test User", email: "test2@example.com", emailVerified: true, role: "user", status: "active", joined: "Oct 18, 2026", lastActive: "Never" },
];

async function getUsersFromDB() {
  try {
    console.log("[DB] Fetching users from database...");
    const { db } = await import("@/lib/db");
    
    const users = await db.query.user.findMany();
    
    return users.map((u) => ({
      id: u.id,
      name: u.name || "Unknown",
      email: u.email,
      emailVerified: u.emailVerified || false,
      role: (u as any).role || "user",
      status: (u as any).status || "pending",
      joined: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "N/A",
      lastActive: u.updatedAt ? new Date(u.updatedAt).toLocaleDateString() : "Never",
    }));
  } catch (error) {
    console.error("[DB] Error fetching users:", error instanceof Error ? error.message : String(error));
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log("[API /admin/users] GET request");

    const dbUsers = await getUsersFromDB();

    if (dbUsers && dbUsers.length > 0) {
      console.log("[API /admin/users] Success from DB:", dbUsers.length);
      return NextResponse.json({
        success: true,
        data: dbUsers,
        count: dbUsers.length,
        source: "database",
      });
    }

    console.log("[API /admin/users] Fallback to mock data");
    return NextResponse.json({
      success: true,
      data: MOCK_USERS,
      count: MOCK_USERS.length,
      source: "mock",
    });
  } catch (error) {
    console.error("[API /admin/users] Error:", error);
    return NextResponse.json({
      success: true,
      data: MOCK_USERS,
      count: MOCK_USERS.length,
      source: "mock",
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, role, status } = body;

    console.log("[API /admin/users] POST - creating user:", { name, email });

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: name, email, password" },
        { status: 400 }
      );
    }

    try {
      const { db } = await import("@/lib/db");
      const { user } = await import("@/lib/db/schema/auth");
      const { eq } = await import("drizzle-orm");

      // Check if email already exists
      const existingUser = await db.query.user.findFirst({
        where: eq(user.email, email),
      });

      if (existingUser) {
        return NextResponse.json(
          { success: false, error: "Email already exists" },
          { status: 400 }
        );
      }

      // Create new user
      const userId = `user_${Date.now()}`;
      const newUser = await db.insert(user).values({
        id: userId,
        name,
        email,
        role: role || "user",
        status: status || "pending",
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();

      console.log("[API /admin/users] User created:", newUser[0]);

      return NextResponse.json({
        success: true,
        message: "User created successfully",
        data: {
          id: newUser[0].id,
          name: newUser[0].name,
          email: newUser[0].email,
          role: (newUser[0] as any).role || "user",
          status: (newUser[0] as any).status || "pending",
          emailVerified: newUser[0].emailVerified,
          joined: newUser[0].createdAt ? new Date(newUser[0].createdAt).toLocaleDateString() : "N/A",
          lastActive: newUser[0].updatedAt ? new Date(newUser[0].updatedAt).toLocaleDateString() : "Never",
        },
      });
    } catch (dbError) {
      console.error("[DB] Create error:", dbError);
      return NextResponse.json(
        { success: false, error: "Database error: " + String(dbError) },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[API] POST error:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
