import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/core/auth";

const SignInSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(12, "Invalid credentials"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = SignInSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid input", fieldErrors: parsed.error.flatten().fieldErrors } },
        { status: 422 }
      );
    }

    const url = new URL("/api/auth/sign-in/email", request.url);
    const forwardedRequest = new Request(url.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: parsed.data.email, password: parsed.data.password }),
    });

    return await auth.handler(forwardedRequest);
  } catch (error: any) {
    if (error?.statusCode && error?.body) {
      return NextResponse.json(error.body, { status: error.statusCode });
    }
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
