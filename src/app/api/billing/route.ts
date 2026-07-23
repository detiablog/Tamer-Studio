import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    plan: "Pro",
    nextInvoice: "$49.00",
    nextInvoiceDate: "Nov 1, 2026",
    paymentMethod: "•••• 4242",
    paymentExpiry: "12/27",
    creditsRemaining: 8432,
    creditsValue: "$120.50",
    invoices: [
      { id: "1", date: "Oct 1, 2026", amount: "$49.00", status: "Paid", plan: "Pro" },
      { id: "2", date: "Sep 1, 2026", amount: "$49.00", status: "Paid", plan: "Pro" },
      { id: "3", date: "Aug 1, 2026", amount: "$29.00", status: "Paid", plan: "Starter" },
      { id: "4", date: "Nov 1, 2026", amount: "$49.00", status: "Upcoming", plan: "Pro" },
    ],
    usage: {
      aiGenerations: { used: 1248, limit: 5000 },
      storage: { used: 24.5, limit: 100, unit: "GB" },
      apiCalls: { used: 3420, limit: 10000 },
    },
  });
}