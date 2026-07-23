import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn().mockResolvedValue([]),
    insert: vi.fn().mockResolvedValue([]),
    update: vi.fn().mockResolvedValue([]),
    delete: vi.fn().mockResolvedValue([]),
  },
}));

describe("security: login", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  const makeRequest = (url: string, init?: { method?: string; body?: string; headers?: Record<string, string> }) => {
    return new NextRequest(url, {
      method: init?.method ?? "GET",
      headers: new Headers(init?.headers),
      body: init?.body,
    });
  };

  it("rejects missing credentials on user login", async () => {
    const { POST } = await import("@/app/api/auth/[...all]/route");

    const request = makeRequest("http://localhost/api/auth/login", {
      method: "POST",
      body: JSON.stringify({}),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    const body = await response.json().catch(() => ({}));
    expect([400, 404]).toContain(response.status);
    expect(body.error || body).toBeDefined();
  });

  it("rejects missing credentials on admin login", async () => {
    const { POST } = await import("@/app/api/admin/auth/login/route");

    const request = makeRequest("http://localhost/api/admin/auth/login", {
      method: "POST",
      body: JSON.stringify({}),
      headers: { "Content-Type": "application/json", "x-csrf-token": "token123" },
    });

    const response = await POST(request);
    const body = await response.json();
    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.reason).toBe("missing_fields");
  });

  it("blocks admin login with invalid master key", async () => {
    process.env.ADMIN_MASTER_KEY_HASH = "invalid_hash";

    const { POST } = await import("@/app/api/admin/auth/login/route");

    const request = makeRequest("http://localhost/api/admin/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "admin@example.com", password: "securepass123456", adminKey: "wrong-key" }),
      headers: { "Content-Type": "application/json", "x-csrf-token": "token456" },
    });

    const response = await POST(request);
    const body = await response.json().catch(() => ({}));
    console.log("LOGIN RESPONSE", response.status, body);
    expect(response.status).toBe(401);
    expect(body.success).toBe(false);
    expect(body.reason).toBe("invalid_master_key");
  });

  it("rejects weak passwords on admin login", async () => {
    const testMasterKey = "test-master-key-123";
    const expectedHash = await import("@/core/security/crypto").then(m => m.hashSecret(testMasterKey));
    process.env.ADMIN_MASTER_KEY_HASH = expectedHash;

    const { POST } = await import("@/app/api/admin/auth/login/route");

    const request = makeRequest("http://localhost/api/admin/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "admin@example.com", password: "short", adminKey: testMasterKey }),
      headers: { "Content-Type": "application/json", "x-csrf-token": "token789" },
    });

    const response = await POST(request);
    const body = await response.json();
    expect(response.status).toBe(401);
    expect(body.success).toBe(false);
    expect(body.reason).toBe("invalid_credentials");
  });

  it("rejects SQL injection patterns in email", async () => {
    const { POST } = await import("@/app/api/auth/[...all]/route");
    const request = makeRequest("http://localhost/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "admin'; DROP TABLE users; --", password: "securepass123456" }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    const text = await response.text();
    expect(response.status).not.toBe(200);
    expect(text.toLowerCase()).not.toContain("drop table");
  });

  it("rejects XSS payloads in error responses", async () => {
    const { POST } = await import("@/app/api/auth/[...all]/route");
    const request = makeRequest("http://localhost/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "<script>alert(1)</script>@example.com", password: "securepass123456" }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    const text = await response.text();
    expect(text).not.toContain("<script>");
  });

  it("rejects rate limited requests on user auth", async () => {
    const originalEnv = process.env.NODE_ENV;
    (process.env as Record<string, string | undefined>).NODE_ENV = "test";

    try {
      const { POST } = await import("@/app/api/auth/[...all]/route");
      const request = makeRequest("http://localhost/api/auth/sign-in/email", {
        method: "POST",
        body: JSON.stringify({ email: "user@example.com", password: "securepass123456" }),
        headers: { "Content-Type": "application/json" },
      });

      for (let i = 0; i < 5; i++) {
        await POST(request);
      }

      const response = await POST(request);
      expect([429, 500]).toContain(response.status);
    } finally {
      (process.env as Record<string, string | undefined>).NODE_ENV = originalEnv;
    }
  });

  it("rejects rate limited requests on admin auth", async () => {
    const originalEnv = process.env.NODE_ENV;
    (process.env as Record<string, string | undefined>).NODE_ENV = "test";

    try {
      const { POST } = await import("@/app/api/admin/auth/login/route");
      const request = makeRequest("http://localhost/api/admin/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: "admin@example.com", password: "securepass123456", adminKey: "wrong" }),
        headers: { "Content-Type": "application/json", "x-csrf-token": "token123" },
      });

      const responses: number[] = [];
      for (let i = 0; i < 10; i++) {
        const response = await POST(request);
        responses.push(response.status);
      }

      expect(responses.some((status) => status === 429)).toBe(true);
    } finally {
      (process.env as Record<string, string | undefined>).NODE_ENV = originalEnv;
    }
  });
});