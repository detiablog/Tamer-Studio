import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { paginatedResponse } from "@/app/api/mappers/response";
import { db } from "@/lib/db/client";
import { blogPost } from "@/lib/db/schema/landing";
import { eq, desc, sql, ilike, and, or } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(Math.max(1, parseInt(searchParams.get("limit") || "10", 10)), 100);
    const offset = (page - 1) * limit;

    const status = searchParams.get("status") || "published";
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    const conditions = [eq(blogPost.status, status)];

    if (category) {
      conditions.push(eq(blogPost.category, category));
    }

    if (search) {
      const searchPattern = `%${search}%`;
      conditions.push(
        or(
          ilike(blogPost.title, searchPattern),
          ilike(blogPost.excerpt, searchPattern)
        )!
      );
    }

    const where = and(...conditions);

    let query = db.select().from(blogPost);
    let countQuery = db.select({ count: sql<number>`count(*)::int` }).from(blogPost);

    if (where) {
      query = query.where(where) as typeof query;
      countQuery = countQuery.where(where) as typeof countQuery;
    }

    const [rows, [{ count: total }]] = await Promise.all([
      query.orderBy(desc(blogPost.publishedAt), desc(blogPost.createdAt)).limit(limit).offset(offset),
      countQuery,
    ]);

    return NextResponse.json(paginatedResponse(rows, total, page, limit));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
