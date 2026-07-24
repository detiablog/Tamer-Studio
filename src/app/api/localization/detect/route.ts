import { NextResponse } from "next/server";
import { detectLocale } from "@/lib/preferences";

export async function GET() {
  try {
    const locale = await detectLocale(new Request("http://localhost"));
    return NextResponse.json(locale);
  } catch {
    return NextResponse.json(
      { error: "Failed to detect locale" },
      { status: 500 }
    );
  }
}
