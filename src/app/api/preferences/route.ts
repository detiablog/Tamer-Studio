import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { setCookiePreferences } from "@/lib/preferences";
import { getServerSession } from "@/core/auth";
import { db } from "@/lib/db/client";
import { user } from "@/lib/db/schema/auth";
import { eq } from "drizzle-orm";

export async function GET() {
  const cookieStore = await cookies();
  const locale = cookieStore.get("tamer_locale")?.value || "en";
  const currency = cookieStore.get("tamer_currency")?.value || "USD";
  const country = cookieStore.get("tamer_country")?.value || null;
  const timezone = cookieStore.get("tamer_timezone")?.value || null;

  try {
    const session = await getServerSession();
    if (session?.user) {
      const dbUser = await db.query.user.findFirst({
        where: eq(user.id, session.user.id),
        columns: {
          preferredLanguage: true,
          preferredCurrency: true,
          preferredCountry: true,
          preferredTimezone: true,
        },
      });
      if (dbUser) {
        return NextResponse.json({
          preferredLanguage: dbUser.preferredLanguage || locale,
          preferredCurrency: dbUser.preferredCurrency || currency,
          preferredCountry: dbUser.preferredCountry || country,
          preferredTimezone: dbUser.preferredTimezone || timezone,
          source: "database",
        });
      }
    }
  } catch {
    // ignore db errors, fall back to cookies
  }

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

    try {
      const session = await getServerSession();
      if (session?.user) {
        await db
          .update(user)
          .set({
            preferredLanguage: language,
            preferredCurrency: currency,
            preferredCountry: country || null,
            preferredTimezone: timezone || null,
          })
          .where(eq(user.id, session.user.id));
      }
    } catch {
      // ignore db errors
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to update preferences" },
      { status: 500 }
    );
  }
}
