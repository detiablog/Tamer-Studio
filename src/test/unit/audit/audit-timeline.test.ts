import { describe, it, expect, vi, beforeEach } from "vitest";
import { getAuditTimeline } from "@/core/audit/audit.service";

vi.mock("@/core/audit/audit.repository", () => ({
  queryAuditLog: vi.fn(),
  getAuditTimeline: vi.fn(),
  searchAuditLog: vi.fn(),
  exportAuditLog: vi.fn(),
  getAuditEntries: vi.fn(),
}));

import { getAuditTimeline as repoGetAuditTimeline } from "@/core/audit/audit.repository";

describe("Audit Timeline", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns entries for a resource", async () => {
    const mockEntries = [
      {
        id: "audit-1",
        action: "user.updated",
        resourceType: "user",
        resourceId: "user-1",
        createdAt: new Date(),
      },
    ];

    (repoGetAuditTimeline as ReturnType<typeof vi.fn>).mockResolvedValue(mockEntries);

    const results = await getAuditTimeline("user", "user-1");
    expect(results).toEqual(mockEntries);
    expect(repoGetAuditTimeline).toHaveBeenCalledWith("user", "user-1");
  });

  it("returns empty array when timeline has no entries", async () => {
    (repoGetAuditTimeline as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    const results = await getAuditTimeline("workspace", "ws-1");
    expect(results).toEqual([]);
  });
});
