import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { withApiAuth } from "@/core/api-platform/api-auth-middleware";
import { UserService } from "@/core/users/user.service";
import { successResponse } from "@/app/api/mappers/response";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";

export async function GET(request: NextRequest) {
  const auth = await withApiAuth(request, "read:profile");
  if (!auth.authenticated) return NextResponse.json(auth.response, { status: 401 });

  try {
    const userId = auth.keyRecord.userId;
    const service = new UserService();
    let profile = await service.getProfile(userId);
    if (!profile) {
      const user = await service.getUserById(userId);
      if (!user) {
        return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "User not found" } }, { status: 404 });
      }
      profile = { id: user.id, name: user.name, email: user.email, role: user.role } as any;
    }
    return NextResponse.json(successResponse(profile));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
