import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockSearchAuditLog } = vi.hoisted(() => ({
  mockSearchAuditLog: vi.fn(),
}));

vi.mock("@/core/audit/audit.repository", () => ({
  DefaultAuditRepository: vi.fn().mockImplementation(function (this: Record<string, unknown>) {
    this.searchAuditLog = mockSearchAuditLog;
  }),
}));

import { searchAuditLog } from "@/core/audit/audit.service";

describe("Audit Search", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("searches audit log by action", async () => {
    const mockEntries = [
      {
        id: "audit-1",
        action: "user.login",
        createdAt: new Date(),
      },
    ];

    mockSearchAuditLog.mockResolvedValue(mockEntries);

    const results = await searchAuditLog("user");
    expect(results).toEqual(mockEntries);
    expect(mockSearchAuditLog).toHaveBeenCalledWith("user");
  });

  it("returns empty array when no matches", async () => {
    mockSearchAuditLog.mockResolvedValue([]);

    const results = await searchAuditLog("nonexistent");
    expect(results).toEqual([]);
  });
});
