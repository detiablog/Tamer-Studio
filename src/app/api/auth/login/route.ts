import { NextRequest, NextResponse } from "next/server";
import { authLimiter, checkRateLimit } from "@/core/security/ratelimit";
import { getClientIdentifier } from "@/core/security/rate-limit";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse } from "@/app/api/mappers/response";
import { z } from "zod";

const LoginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(request: NextRequest) {
  try {
    const identifier = getClientIdentifier(request);

    const rateLimit = await checkRateLimit(authLimiter, identifier);
    if (!rateLimit.success) {
      return NextResponse.json(
        { success: false, error: { code: "RATE_LIMIT_EXCEEDED", message: "Too many login attempts. Please try again later.", details: { retryAfter: rateLimit.resetTime } } },
        { status: 429, headers: { "Retry-After": Math.ceil(rateLimit.resetTime / 1000).toString() } }
      );
    }

    const body = await request.json();
    const parsed = LoginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid input", details: { fieldErrors: parsed.error.flatten().fieldErrors } } },
        { status: 422 }
      );
    }

    return NextResponse.json(successResponse({ message: "Login successful" }));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
