import { NextResponse } from "next/server";

export async function PUT(request: any, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return NextResponse.json({ success: true, message: "Coupon updated successfully" });
}

export async function DELETE(request: any, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return NextResponse.json({ success: true, message: "Coupon deleted successfully" });
}
