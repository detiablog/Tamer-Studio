import { describe, it, expect, vi, beforeEach } from "vitest";
import { queryAuditLog } from "@/core/audit/audit.service";

vi.mock("@/core/audit/audit.repository", () => ({
  queryAuditLog: vi.fn(),
  getAuditTimeline: vi.fn(),
  searchAuditLog: vi.fn(),
  exportAuditLog: vi.fn(),
  getAuditEntries: vi.fn(),
}));

import { queryAuditLog as repoQueryAuditLog } from "@/core/audit/audit.repository";

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

    (repoQueryAuditLog as ReturnType<typeof vi.fn>).mockResolvedValue(mockEntries);

    const results = await queryAuditLog({ action: "user.login" });
    expect(results).toEqual(mockEntries);
    expect(repoQueryAuditLog).toHaveBeenCalledWith({ action: "user.login" });
  });

  it("passes date range filters", async () => {
    (repoQueryAuditLog as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    await queryAuditLog({
      action: "user.login",
      startDate: new Date("2024-01-01"),
      endDate: new Date("2024-01-31"),
    });

    expect(repoQueryAuditLog).toHaveBeenCalledWith({
      action: "user.login",
      startDate: new Date("2024-01-01"),
      endDate: new Date("2024-01-31"),
    });
  });

  it("passes pagination options", async () => {
    (repoQueryAuditLog as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    await queryAuditLog({ limit: 10, offset: 5 });

    expect(repoQueryAuditLog).toHaveBeenCalledWith({ limit: 10, offset: 5 });
  });
});
