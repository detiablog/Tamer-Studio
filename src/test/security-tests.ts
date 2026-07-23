import { describe, it, expect, vi, beforeEach } from "vitest";
import type { SecurityError, RequestContext } from "@/core/middleware/types";
import { NextRequest } from "next/server";

vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn().mockResolvedValue([]),
    insert: vi.fn().mockResolvedValue([]),
    update: vi.fn().mockResolvedValue([]),
    delete: vi.fn().mockResolvedValue([]),
  },
}));

describe("security: authentication middleware", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  const makeRequest = (url: string, init?: { method?: string; headers?: Record<string, string> }) => {
    return new NextRequest(url, {
      method: init?.method ?? "GET",
      headers: new Headers(init?.headers),
    });
  };

  it("adminAuthentication rejects missing token", async () => {
    const { adminAuthentication } = await import("@/core/middleware/auth.middleware");

    const request = makeRequest("http://localhost/api/admin/test", {
      method: "GET",
    });

    const middleware = adminAuthentication();
    const result = await middleware({
      request,
      state: {},
      method: "GET",
      pathname: "/api/admin/test",
    });

    expect(result).toBeDefined();
    expect((result as SecurityError).status).toBe(401);
    expect((result as SecurityError).message).toBe("Missing admin authentication");
  });

  it("adminAuthentication allows anonymous when configured", async () => {
    const { adminAuthentication } = await import("@/core/middleware/auth.middleware");

    const result = await adminAuthentication(true)({
      request: makeRequest("http://localhost/api/admin/test"),
      state: {},
      method: "GET",
      pathname: "/api/admin/test",
    });

    expect(result).toBeUndefined();
  });

  it("userAuthentication rejects missing token", async () => {
    const { userAuthentication } = await import("@/core/middleware/auth.middleware");

    const request = makeRequest("http://localhost/api/user/test", {
      method: "GET",
    });

    const middleware = userAuthentication();
    const result = await middleware({
      request,
      state: {},
      method: "GET",
      pathname: "/api/user/test",
    });

    expect(result).toBeDefined();
    expect((result as SecurityError).status).toBe(401);
  });

  it("userAuthentication allows anonymous when configured", async () => {
    const { userAuthentication } = await import("@/core/middleware/auth.middleware");

    const result = await userAuthentication(true)({
      request: makeRequest("http://localhost/api/user/test"),
      state: {},
      method: "GET",
      pathname: "/api/user/test",
    });

    expect(result).toBeUndefined();
  });
});

describe("security: authorization middleware", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  const makeContext = (overrides?: Partial<RequestContext>) => ({
    request: new NextRequest("http://localhost/api/admin/test", { method: "GET" }),
    state: {},
    method: "GET",
    pathname: "/api/admin/test",
    ...overrides,
  });

  it("requireAdminPermission denies missing session", async () => {
    const { requireAdminPermission } = await import("@/core/middleware/authz.middleware");
    const result = await requireAdminPermission("admin:read")(makeContext());
    expect(result).toBeDefined();
    expect((result as SecurityError).status).toBe(401);
  });

  it("requireAdminPermission denies insufficient role", async () => {
    const { requireAdminPermission } = await import("@/core/middleware/authz.middleware");
    const ctx = makeContext({
      state: { adminSession: { adminId: "1", expiresAt: new Date(), role: "viewer", id: "1" } },
    });
    const result = await requireAdminPermission("admin:system")(ctx);
    expect(result).toBeDefined();
    expect((result as SecurityError).status).toBe(403);
  });

  it("requireWorkspaceOwnership denies missing resource param", async () => {
    const { requireWorkspaceOwnership } = await import("@/core/middleware/authz.middleware");
    const ctx = makeContext({
      state: { userSession: { userId: "1", expiresAt: new Date(), role: "user", id: "1" } },
    });
    const result = await requireWorkspaceOwnership()(ctx);
    expect(result).toBeDefined();
    expect((result as SecurityError).status).toBe(400);
  });

  it("requireAnyRole allows matching session", async () => {
    const { requireAnyRole } = await import("@/core/middleware/authz.middleware");
    const ctx = makeContext({
      state: { adminSession: { id: "1", adminId: "1", expiresAt: new Date(), role: "admin" } },
    });
    const result = await requireAnyRole(["admin", "super_admin"])(ctx);
    expect(result).toBeUndefined();
  });
});

describe("security: CSRF middleware", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  const makeRequest = (url: string, init?: { method?: string; headers?: Record<string, string>; cookie?: string }) => {
    const headers = new Headers(init?.headers);
    if (init?.cookie) {
      headers.set("cookie", init.cookie);
    }
    return new NextRequest(url, {
      method: init?.method ?? "GET",
      headers,
    });
  };

  it("skips CSRF for GET requests", async () => {
    const { csrfMiddleware } = await import("@/core/middleware/csrf.middleware");
    const result = await csrfMiddleware()({
      request: makeRequest("http://localhost/api/test", { method: "GET" }),
      state: {},
      method: "GET",
      pathname: "/api/test",
    });
    expect(result).toBeUndefined();
  });

  it("rejects POST without CSRF token", async () => {
    const { csrfMiddleware } = await import("@/core/middleware/csrf.middleware");
    const result = await csrfMiddleware()({
      request: makeRequest("http://localhost/api/test", { method: "POST" }),
      state: {},
      method: "POST",
      pathname: "/api/test",
    });
    expect(result).toBeDefined();
    expect((result as SecurityError).status).toBe(403);
    expect((result as SecurityError).message).toBe("Missing CSRF token");
  });

  it("rejects DELETE with mismatched CSRF token", async () => {
    const { csrfMiddleware } = await import("@/core/middleware/csrf.middleware");
    const result = await csrfMiddleware()({
      request: makeRequest("http://localhost/api/test", {
        method: "DELETE",
        headers: { "x-csrf-token": "wrong-token" },
        cookie: "csrf_token=correct-token",
      }),
      state: {},
      method: "DELETE",
      pathname: "/api/test",
    });
    expect(result).toBeDefined();
    expect((result as SecurityError).status).toBe(403);
  });

  it("accepts valid CSRF token", async () => {
    const { csrfMiddleware } = await import("@/core/middleware/csrf.middleware");
    const validToken = "valid-csrf-token-123";
    const result = await csrfMiddleware()({
      request: makeRequest("http://localhost/api/test", {
        method: "POST",
        headers: { "x-csrf-token": validToken },
        cookie: `csrf_token=${validToken}`,
      }),
      state: {},
      method: "POST",
      pathname: "/api/test",
    });
    expect(result).toBeUndefined();
  });
});

describe("security: rate limit", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("getClientIdentifier uses x-cf-connecting-ip when present", async () => {
    const { getClientIdentifier } = await import("@/core/security/rate-limit");
    const request = new NextRequest("http://localhost/api/test", {
      method: "GET",
      headers: new Headers({ "cf-connecting-ip": "203.0.113.1" }),
    });
    expect(getClientIdentifier(request)).toBe("203.0.113.1");
  });

  it("getClientIdentifier uses x-vercel-forwarded-for", async () => {
    const { getClientIdentifier } = await import("@/core/security/rate-limit");
    const request = new NextRequest("http://localhost/api/test", {
      method: "GET",
      headers: new Headers({ "x-vercel-forwarded-for": "198.51.100.1" }),
    });
    expect(getClientIdentifier(request)).toBe("198.51.100.1");
  });

  it("getClientIdentifier uses x-real-ip", async () => {
    const { getClientIdentifier } = await import("@/core/security/rate-limit");
    const request = new NextRequest("http://localhost/api/test", {
      method: "GET",
      headers: new Headers({ "x-real-ip": "192.168.1.1" }),
    });
    expect(getClientIdentifier(request)).toBe("192.168.1.1");
  });

  it("getClientIdentifier falls back to x-forwarded-for", async () => {
    const { getClientIdentifier } = await import("@/core/security/rate-limit");
    const request = new NextRequest("http://localhost/api/test", {
      method: "GET",
      headers: new Headers({ "x-forwarded-for": "203.0.113.5, 70.41.3.18" }),
    });
    expect(getClientIdentifier(request)).toBe("203.0.113.5");
  });

  it("getClientIdentifier returns unknown when no headers", async () => {
    const { getClientIdentifier } = await import("@/core/security/rate-limit");
    const request = new NextRequest("http://localhost/api/test", {
      method: "GET",
    });
    expect(getClientIdentifier(request)).toBe("unknown");
  });
});

describe("security: secret management", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("hashSecret produces a scrypt hash", async () => {
    const { hashSecret } = await import("@/core/security/crypto");
    const secret = "my-super-secret-admin-key-12345";
    const hash = hashSecret(secret);
    expect(hash).toContain("scrypt:");
    expect(hash.split(":").length).toBe(3);
  });

  it("verifySecret returns true for matching secret", async () => {
    const { hashSecret, verifySecret } = await import("@/core/security/crypto");
    const secret = "my-super-secret-admin-key-12345";
    const hash = hashSecret(secret);
    expect(verifySecret(secret, hash)).toBe(true);
  });

  it("verifySecret returns false for wrong secret", async () => {
    const { hashSecret, verifySecret } = await import("@/core/security/crypto");
    const secret = "my-super-secret-admin-key-12345";
    const hash = hashSecret(secret);
    expect(verifySecret("wrong-secret", hash)).toBe(false);
  });

  it("verifySecret rejects non-scrypt hashes", async () => {
    const { verifySecret } = await import("@/core/security/crypto");
    expect(verifySecret("secret", "sha256:abcd1234")).toBe(false);
  });

  it("safeCompare returns true for equal strings", async () => {
    const { safeCompare } = await import("@/core/security/crypto");
    expect(safeCompare("hello", "hello")).toBe(true);
  });

  it("safeCompare returns false for different strings", async () => {
    const { safeCompare } = await import("@/core/security/crypto");
    expect(safeCompare("hello", "world")).toBe(false);
  });
});

describe("security: session validation", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("getAdminSessionFromToken returns null without DB match", async () => {
    const { getAdminSessionFromToken } = await import("@/core/admin/session");
    const result = await getAdminSessionFromToken("nonexistent-token");
    expect(result).toBeNull();
  });
});
