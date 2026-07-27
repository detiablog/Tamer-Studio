import { z } from "zod";
import { NextResponse } from "next/server";
import { AppError } from "@/app/api/errors/AppError";

export function mapErrorToResponse(error: unknown): ReturnType<typeof NextResponse.json> {
  if (error instanceof AppError) {
    return NextResponse.json(error.toJSON(), { status: error.statusCode });
  }

  if (error instanceof z.ZodError) {
    const zodError = error as z.ZodError<any>;
    const messages = zodError.issues.map((e) => e.message).join("; ");
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: messages } },
      { status: 422 }
    );
  }

  return NextResponse.json(
    { success: false, error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
    { status: 500 }
  );
}