import { NextRequest, NextResponse } from "next/server";
import { NotificationRepository } from "@/core/notifications/notification.repository";

const repository = new NotificationRepository();

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get("userId") || "demo-user";
  const filter = searchParams.has("status") ? { status: searchParams.get("status") as any } : undefined;
  const category = searchParams.get("category");

  const notifications = await repository.getByUser(userId, { ...filter, category: category as any });
  return NextResponse.json({ notifications });
}

export async function PATCH(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");
  const action = searchParams.get("action");

  if (!id || !action) {
    return NextResponse.json({ error: "Missing id or action" }, { status: 400 });
  }

  let notification;
  switch (action) {
    case "read":
      notification = await repository.markAsRead(id, "demo-user");
      break;
    case "archive":
      notification = await repository.archive(id, "demo-user");
      break;
    case "delete":
      await repository.softDelete(id);
      break;
    default:
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  return NextResponse.json({ notification });
}