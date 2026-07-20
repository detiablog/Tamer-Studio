import { EmptyState } from "@/components/ui/EmptyState";

export default function ResetPasswordPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Reset password</h1>
        <p className="mt-2 text-sm text-muted-foreground">Set a new password for your account.</p>
      </div>
      <EmptyState title="Coming soon" description="Password reset will be available shortly." />
    </div>
  );
}
