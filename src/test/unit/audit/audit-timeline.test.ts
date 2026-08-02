import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockGetAuditTimeline } = vi.hoisted(() => ({
  mockGetAuditTimeline: vi.fn(),
}));

vi.mock("@/core/audit/audit.repository", () => ({
  DefaultAuditRepository: vi.fn().mockImplementation(function (this: Record<string, unknown>) {
    this.getAuditTimeline = mockGetAuditTimeline;
  }),
}));

import { getAuditTimeline } from "@/core/audit/audit.service";

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

    mockGetAuditTimeline.mockResolvedValue(mockEntries);

    const results = await getAuditTimeline("user", "user-1");
    expect(results).toEqual(mockEntries);
    expect(mockGetAuditTimeline).toHaveBeenCalledWith("user", "user-1");
  });

  it("returns empty array when timeline has no entries", async () => {
    mockGetAuditTimeline.mockResolvedValue([]);

    const results = await getAuditTimeline("workspace", "ws-1");
    expect(results).toEqual([]);
  });
});
