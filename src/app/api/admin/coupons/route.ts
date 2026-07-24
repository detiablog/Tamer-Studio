import { NextResponse } from "next/server";

export async function GET() {
  const MOCK_COUPONS = [
    { id: "1", code: "LAUNCH2026", type: "Percentage", value: "20%", uses: 145, limit: 500, expires: "Dec 31, 2026", status: "Active" },
    { id: "2", code: "WELCOME50", type: "Fixed", value: "$50", uses: 89, limit: 200, expires: "Nov 30, 2026", status: "Active" },
    { id: "3", code: "BLACKFRIDAY", type: "Percentage", value: "30%", uses: 0, limit: 1000, expires: "Nov 28, 2026", status: "Scheduled" },
  ];

  return NextResponse.json({ success: true, data: MOCK_COUPONS, count: MOCK_COUPONS.length });
}

export async function POST() {
  return NextResponse.json({ success: true, message: "Coupon created successfully" });
}
