import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { withApiAuth } from "@/core/api-platform/api-auth-middleware";
import { successResponse } from "@/app/api/mappers/response";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { db } from "@/lib/db";
import { wallet } from "@/lib/db/schema/billing";
import { workspaceMember } from "@/lib/db/schema/identity";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const auth = await withApiAuth(request, "read:profile");
  if (!auth.authenticated) return NextResponse.json(auth.response, { status: 401 });

  try {
    const userId = auth.keyRecord.userId;
    const members = await db.select().from(workspaceMember).where(eq(workspaceMember.userId, userId)).limit(1);
    if (members.length === 0) {
      return NextResponse.json(successResponse({ availableCredits: 0, reservedCredits: 0, totalCredits: 0 }));
    }
    const wallets = await db.select().from(wallet).where(eq(wallet.workspaceId, members[0].workspaceId)).limit(1);
    const userWallet = wallets[0];
    return NextResponse.json(successResponse({
      availableCredits: userWallet?.availableCredits ?? 0,
      reservedCredits: userWallet?.reservedCredits ?? 0,
      totalCredits: userWallet ? (Number(userWallet.availableCredits) + Number(userWallet.reservedCredits)) : 0,
    }));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
