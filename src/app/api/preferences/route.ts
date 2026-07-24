import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { setCookiePreferences } from "@/lib/preferences";

export async function GET() {
  const cookieStore = await cookies();
  const locale = cookieStore.get("tamer_locale")?.value || "en";
  const currency = cookieStore.get("tamer_currency")?.value || "USD";
  const country = cookieStore.get("tamer_country")?.value || null;
  const timezone = cookieStore.get("tamer_timezone")?.value || null;

  return NextResponse.json({
    preferredLanguage: locale,
    preferredCurrency: currency,
    preferredCountry: country,
    preferredTimezone: timezone,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { language, currency, country, timezone } = body;

    setCookiePreferences({
      locale: language,
      currency,
      country: country || undefined,
      timezone: timezone || undefined,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to update preferences" },
      { status: 500 }
    );
  }
}
