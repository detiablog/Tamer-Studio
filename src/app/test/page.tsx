"use client";

import { authClient } from "@/lib/auth/auth-client";

export default function TestPage() {
  const { data, isPending, error } = authClient.useSession();

  if (isPending) return <div>Loading...</div>;

  return (
    <pre>
      {JSON.stringify(
        {
          session: data,
          error,
        },
        null,
        2,
      )}
    </pre>
  );
}
