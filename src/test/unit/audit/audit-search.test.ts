import { describe, it, expect, vi, beforeEach } from "vitest";
import { searchAuditLog } from "@/core/audit/audit.service";

vi.mock("@/core/audit/audit.repository", () => ({
  queryAuditLog: vi.fn(),
  getAuditTimeline: vi.fn(),
  searchAuditLog: vi.fn(),
  exportAuditLog: vi.fn(),
  getAuditEntries: vi.fn(),
}));

import { searchAuditLog as repoSearchAuditLog } from "@/core/audit/audit.repository";

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

    (repoSearchAuditLog as ReturnType<typeof vi.fn>).mockResolvedValue(mockEntries);

    const results = await searchAuditLog("user");
    expect(results).toEqual(mockEntries);
    expect(repoSearchAuditLog).toHaveBeenCalledWith("user");
  });

  it("returns empty array when no matches", async () => {
    (repoSearchAuditLog as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    const results = await searchAuditLog("nonexistent");
    expect(results).toEqual([]);
  });
});
