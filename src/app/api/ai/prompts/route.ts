import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/core/auth/session";
import { promptService } from "@/core/ai/prompt.service";
import { logger } from "@/core/logger";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category") || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const result = await promptService.listTemplates({ category, page, limit });

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: {
        total: result.total,
        page: result.page,
        pageSize: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    });
  } catch (error) {
    logger.error("Failed to list prompt templates", error instanceof Error ? error : undefined);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to list prompt templates" } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireUser();
    const body = await request.json();
    const { name, description, category, prompt, variables, modelHint } = body;

    if (!name || !prompt) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "name and prompt are required" } },
        { status: 400 }
      );
    }

    const template = await promptService.createTemplate({
      name,
      description,
      category,
      prompt,
      variables,
      modelHint,
      userId: session.user.id,
    });

    return NextResponse.json({ success: true, data: template }, { status: 201 });
  } catch (error) {
    logger.error("Failed to create prompt template", error instanceof Error ? error : undefined);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to create prompt template" } },
      { status: 500 }
    );
  }
}
