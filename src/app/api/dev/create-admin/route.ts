import { NextRequest, NextResponse } from "next/server";
import { UserService } from "@/core/users/user.service";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse, errorResponse } from "@/app/api/mappers/response";

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(errorResponse("PERMISSION_DENIED", "Not available in production"), { status: 403 });
  }

  try {
    const userService = new UserService();
    const adminEmail = process.env.ADMIN_EMAIL || "";
    if (!adminEmail) {
      return NextResponse.json(errorResponse("CONFIGURATION_ERROR", "ADMIN_EMAIL environment variable is required"), { status: 500 });
    }

    const existingUser = await userService.getUserByEmail(adminEmail);

    if (existingUser) {
      return NextResponse.json(successResponse({
        message: "Admin user already exists",
        email: existingUser.email,
      }));
    }

    return NextResponse.json(errorResponse("NOT_IMPLEMENTED", "Admin creation requires additional setup"), { status: 501 });
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
