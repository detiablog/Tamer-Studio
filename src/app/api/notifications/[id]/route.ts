import { NextResponse } from "next/server";
import { NotificationRepository } from "@/core/notifications";

const repository = new NotificationRepository();

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json().catch(() => ({}));
    const action = typeof body.action === "string" ? body.action : undefined;
    const userId = typeof body.userId === "string" ? body.userId : "demo-user";

    const allowedActions = ["read", "archive", "delete"];
    if (!action || !allowedActions.includes(action)) {
      return NextResponse.json({ error: "valid action is required (read|archive|delete)" }, { status: 400 });
    }

    const { id } = await params;
    const notification = await repository.getById(id);
    if (!notification || notification.userId !== userId) {
      return NextResponse.json({ error: "notification not found" }, { status: 404 });
    }

    let updated;
    if (action === "read") {
      updated = await repository.markAsRead(id, userId);
    } else if (action === "archive") {
      updated = await repository.archive(id, userId);
    } else if (action === "delete") {
      await repository.softDelete(id);
      updated = notification;
    }

    return NextResponse.json({ notification: updated });
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }
}
