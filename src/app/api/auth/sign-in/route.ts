import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/core/auth";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse, errorResponse } from "@/app/api/mappers/response";

const SignInSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(12, "Invalid credentials"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = SignInSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(errorResponse("VALIDATION_ERROR", "Invalid input", { fieldErrors: parsed.error.flatten().fieldErrors }), { status: 422 });
    }

    const response = await auth.api.signInEmail({
      body: { email: parsed.data.email, password: parsed.data.password },
      headers: {},
    });

    return response as unknown as NextResponse;
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
