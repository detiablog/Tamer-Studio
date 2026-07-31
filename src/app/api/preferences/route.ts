import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { setCookiePreferences } from "@/lib/preferences";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { successResponse, errorResponse } from "@/app/api/mappers/response";
import { z } from "zod";

const UpdatePreferencesSchema = z.object({
  language: z.string().optional(),
  currency: z.string().optional(),
  country: z.string().optional(),
  timezone: z.string().optional(),
});

export async function GET() {
  try {
    const cookieStore = await cookies();
    const locale = cookieStore.get("tamer_locale")?.value || "en";
    const currency = cookieStore.get("tamer_currency")?.value || "USD";
    const country = cookieStore.get("tamer_country")?.value || null;
    const timezone = cookieStore.get("tamer_timezone")?.value || null;

    return NextResponse.json(successResponse({
      preferredLanguage: locale,
      preferredCurrency: currency,
      preferredCountry: country,
      preferredTimezone: timezone,
    }));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = UpdatePreferencesSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(errorResponse("VALIDATION_ERROR", "Invalid input"), { status: 422 });
    }

    setCookiePreferences({
      locale: parsed.data.language,
      currency: parsed.data.currency,
      country: parsed.data.country || undefined,
      timezone: parsed.data.timezone || undefined,
    });

    return NextResponse.json(successResponse({ message: "Preferences updated successfully" }));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}