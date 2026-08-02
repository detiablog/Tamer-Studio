import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockExportAuditLog } = vi.hoisted(() => ({
  mockExportAuditLog: vi.fn(),
}));

vi.mock("@/core/audit/audit.repository", () => ({
  DefaultAuditRepository: vi.fn().mockImplementation(function (this: Record<string, unknown>) {
    this.exportAuditLog = mockExportAuditLog;
  }),
}));

import { exportAuditLog } from "@/core/audit/audit.service";

describe("Audit Export", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("exports audit log as CSV", async () => {
    mockExportAuditLog.mockResolvedValue(
      "id,action,actorId,actorType,resourceType,resourceId,metadata,ipAddress,userAgent,createdAt\naudit-1,user.login,user-1,user,user,user-1,{},{},,,2024-01-01T00:00:00.000Z"
    );

    const csv = await exportAuditLog();
    const lines = csv.split("\n");
    expect(lines[0]).toBe("id,action,actorId,actorType,resourceType,resourceId,metadata,ipAddress,userAgent,createdAt");
    expect(lines[1].startsWith("audit-1,user.login")).toBe(true);
  });

  it("exports empty log with headers only", async () => {
    mockExportAuditLog.mockResolvedValue(
      "id,action,actorId,actorType,resourceType,resourceId,metadata,ipAddress,userAgent,createdAt"
    );

    const csv = await exportAuditLog();
    expect(csv).toBe("id,action,actorId,actorType,resourceType,resourceId,metadata,ipAddress,userAgent,createdAt");
  });
});
