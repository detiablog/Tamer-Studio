export type GeoSource = "user" | "cookie" | "cloudflare" | "vercel" | "accept-language" | "geoip" | "fallback";

export interface GeoResult {
  country: string | null;
  source: string;
}
