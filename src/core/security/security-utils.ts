import crypto from "crypto";

export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .replace(/data:text\/html/gi, "")
    .trim();
}

export function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/javascript:/gi, "")
    .trim();
}

export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function validateCSRFToken(token: string, secret: string): boolean {
  if (!token || !secret) return false;
  const expected = crypto.createHmac("sha256", secret).update(token).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
}

export function maskSensitive(value: string, visibleChars = 4): string {
  if (!value || value.length <= visibleChars) return "••••••••";
  return "•".repeat(value.length - visibleChars) + value.slice(-visibleChars);
}

export function hashPassword(password: string): string {
  const bcrypt = require("bcryptjs");
  return bcrypt.hashSync(password, 12);
}

export function verifyPassword(password: string, hash: string): boolean {
  const bcrypt = require("bcryptjs");
  return bcrypt.compareSync(password, hash);
}

export function generateSecureToken(length = 32): string {
  return crypto.randomBytes(length).toString("hex");
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function validateEmailFormat(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (password.length < 12) errors.push("At least 12 characters");
  if (!/[A-Z]/.test(password)) errors.push("At least one uppercase letter");
  if (!/[a-z]/.test(password)) errors.push("At least one lowercase letter");
  if (!/[0-9]/.test(password)) "At least one number";
  if (!/[^A-Za-z0-9]/.test(password)) errors.push("At least one special character");
  return { valid: errors.length === 0, errors };
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}

export function detectSuspiciousActivity(ip: string, action: string, recentAttempts: number): { suspicious: boolean; reason?: string } {
  if (recentAttempts > 10) return { suspicious: true, reason: "Excessive requests from same IP" };
  if (recentAttempts > 5 && action.includes("login")) return { suspicious: true, reason: "Possible brute force attempt" };
  return { suspicious: false };
}
