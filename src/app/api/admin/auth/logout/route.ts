import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true });

  // Clear admin_session cookie
  response.cookies.delete("admin_session");
  
  // Also return instruction to clear localStorage
  return response;
}
