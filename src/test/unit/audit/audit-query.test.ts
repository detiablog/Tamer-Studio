import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockQueryAuditLog } = vi.hoisted(() => ({
  mockQueryAuditLog: vi.fn(),
}));

vi.mock("@/core/audit/audit.repository", () => ({
  DefaultAuditRepository: vi.fn().mockImplementation(function (this: Record<string, unknown>) {
    this.queryAuditLog = mockQueryAuditLog;
  }),
}));

import { queryAuditLog } from "@/core/audit/audit.service";

describe("Audit Query", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns entries matching filters", async () => {
    const mockEntries = [
      {
        id: "audit-1",
        action: "user.login",
        actorId: "user-1",
        actorType: "user",
        resourceType: "user",
        resourceId: "user-1",
        createdAt: new Date(),
      },
    ];

    mockQueryAuditLog.mockResolvedValue(mockEntries);

    const results = await queryAuditLog({ action: "user.login" });
    expect(results).toEqual(mockEntries);
    expect(mockQueryAuditLog).toHaveBeenCalledWith({ action: "user.login" });
  });

  it("passes date range filters", async () => {
    mockQueryAuditLog.mockResolvedValue([]);

    await queryAuditLog({
      action: "user.login",
      startDate: new Date("2024-01-01"),
      endDate: new Date("2024-01-31"),
    });

    expect(mockQueryAuditLog).toHaveBeenCalledWith({
      action: "user.login",
      startDate: new Date("2024-01-01"),
      endDate: new Date("2024-01-31"),
    });
  });

  it("passes pagination options", async () => {
    mockQueryAuditLog.mockResolvedValue([]);

    await queryAuditLog({ limit: 10, offset: 5 });

    expect(mockQueryAuditLog).toHaveBeenCalledWith({ limit: 10, offset: 5 });
  });
});
