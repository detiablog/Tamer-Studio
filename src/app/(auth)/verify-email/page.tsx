import { EmptyState } from "@/components/ui/EmptyState";

export default function VerifyEmailPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Verify your email</h1>
        <p className="mt-2 text-sm text-muted-foreground">We sent a verification link to your email address.</p>
      </div>
      <EmptyState title="Coming soon" description="Email verification will be available shortly." />
    </div>
  );
}
