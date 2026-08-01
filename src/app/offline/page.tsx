"use client";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
      <WifiOff className="size-16 text-muted-foreground mb-4" />
      <h1 className="text-2xl font-bold mb-2">You&apos;re Offline</h1>
      <p className="text-muted-foreground mb-6">Please check your internet connection and try again.</p>
      <Link href="/" className={buttonVariants()}>Try Again</Link>
    </div>
  );
}
