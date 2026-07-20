import { EmptyState } from "@/components/ui/EmptyState";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Users", value: "0" },
          { label: "Active Workspaces", value: "0" },
          { label: "Active Jobs", value: "0" },
          { label: "Revenue", value: "$0" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-3xl border border-border bg-card p-5">
            <div className="text-sm text-muted-foreground">{stat.label}</div>
            <div className="mt-3 text-3xl font-semibold">{stat.value}</div>
          </div>
        ))}
      </div>
      <EmptyState title="Admin dashboard coming soon" description="Platform-wide metrics and management will appear here." />
    </div>
  );
}
