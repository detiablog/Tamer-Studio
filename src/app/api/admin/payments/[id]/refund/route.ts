import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { adminAuthentication, requireAdminPermission } from "@/core/middleware";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse, errorResponse } from "@/app/api/mappers/response";
import { paymentEngineService } from "@/core/payment/payment-engine.service";
import { z } from "zod";

const RefundSchema = z.object({
  amount: z.number().positive(),
  reason: z.string().min(1),
  notes: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx: RequestContext = {
    request,
    params: await params,
    state: {
      rateLimit: undefined,
      origin: undefined,
      adminSession: undefined,
      userSession: undefined,
      authError: undefined,
      permissionError: undefined,
      csrfError: undefined,
      rateLimitError: undefined,
      auditContext: undefined,
    },
    method: "POST",
    pathname: request.nextUrl.pathname,
    ip: request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0].trim() || undefined,
  };

  const middlewareError = await runMiddleware([adminAuthentication(), requireAdminPermission("payments.write")], ctx);
  if (middlewareError) return middlewareError;

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = RefundSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(errorResponse("VALIDATION_ERROR", "Invalid input", { fieldErrors: parsed.error.flatten().fieldErrors }), { status: 422 });
    }

    const payment = await paymentEngineService.getPayment(id);
    if (!payment) {
      return NextResponse.json(errorResponse("NOT_FOUND", "Payment not found"), { status: 404 });
    }

    if (payment.status !== "paid") {
      return NextResponse.json(errorResponse("VALIDATION_ERROR", "Only paid payments can be refunded"), { status: 400 });
    }

    if (parsed.data.amount > Number(payment.finalAmount)) {
      return NextResponse.json(errorResponse("VALIDATION_ERROR", "Refund amount exceeds payment amount"), { status: 400 });
    }

    const adminId = ctx.state.adminSession?.adminId;
    const result = await paymentEngineService.processRefund(id, payment.userId, parsed.data.amount, parsed.data.reason, adminId);

    return NextResponse.json(successResponse(result));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
