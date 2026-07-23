import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    name: "Alex Creator",
    email: "alex@example.com",
    role: "Admin",
    workspace: "Acme Studio",
    location: "Bangkok, Thailand",
    plan: "Pro",
    joined: "March 2026",
    avatar: "AC",
  });
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    return NextResponse.json({
      success: true,
      profile: {
        name: typeof body.name === "string" ? body.name : "Alex Creator",
        email: typeof body.email === "string" ? body.email : "alex@example.com",
        role: "Admin",
        workspace: "Acme Studio",
        location: typeof body.location === "string" ? body.location : "Bangkok, Thailand",
        plan: "Pro",
        joined: "March 2026",
        avatar: "AC",
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request body" }, { status: 400 });
  }
}