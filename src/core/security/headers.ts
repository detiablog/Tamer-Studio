/**
 * Security Headers Configuration
 * 
 * Note: 'unsafe-inline' is needed for React/Next.js runtime.
 * In production, consider using a nonce-based approach.
 */

export const SECURITY_HEADERS = {
  "Content-Security-Policy": 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; " +
    "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; " +
    "img-src 'self' data: https://*.r2.cloudflarestorage.com https://api.github.com; " +
    "font-src 'self' data: https://fonts.googleapis.com https://fonts.gstatic.com; " +
    "connect-src 'self' https: http://localhost:*; " +
    "frame-ancestors 'none'; " +
    "object-src 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self';",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Embedder-Policy": "require-corp",
  "Cross-Origin-Resource-Policy": "same-origin",
} as const;

export function getSecurityHeaders(): Record<string, string> {
  const headers = { ...SECURITY_HEADERS };

  // Stricter CSP in production (optional - keeping unsafe-inline for now)
  if (process.env.NODE_ENV === "production") {
    headers["Content-Security-Policy"] =
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: https://*.r2.cloudflarestorage.com; " +
      "font-src 'self' data:; " +
      "connect-src 'self' https:; " +
      "frame-ancestors 'none'; " +
      "object-src 'none'; " +
      "base-uri 'self'; " +
      "form-action 'self';";
  }

  return headers;
}
