import { NextResponse } from "next/server";
import { AppError } from "./app-error";

export function errorHandler(error: unknown): NextResponse {
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        code: error.code,
        message: error.message,
        details: error.details,
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof Error) {
    return NextResponse.json(
      {
        success: false,
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred",
        details: {},
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      success: false,
      code: "UNKNOWN_ERROR",
      message: "An unknown error occurred",
      details: {},
    },
    { status: 500 }
  );
}
