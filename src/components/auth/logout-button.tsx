"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth/auth-client";
import { Button } from "@/components/ui/button";
import { logger } from "@/core/logger";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            toast.success("Signed out successfully");
            router.push("/login");
          },
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        logger.error("Logout error", error);
        toast.error(error.message || "Failed to sign out");
      } else {
        logger.error("Logout error", new Error(String(error)));
        toast.error("Failed to sign out");
      }
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLogout}
      className="text-destructive hover:text-destructive hover:bg-destructive/10"
    >
      <LogOut className="h-4 w-4 mr-2" />
      Logout
    </Button>
  );
}
