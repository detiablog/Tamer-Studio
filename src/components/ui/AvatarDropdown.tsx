"use client"

import * as React from "react"
import { Avatar } from "@/components/ui/Avatar"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { authService } from "@/features/auth/services/auth.service"
import { toast } from "sonner"

export function AvatarDropdown() {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await authService.signOut()
      toast.success("Signed out")
      router.push("/login")
    } catch (err: unknown) {
      console.error(err)
      toast.error(String(err ?? "Failed to sign out"))
    }
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen((v) => !v)} className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring/50">
        <Avatar name="A" />
        <span className="hidden sm:inline text-sm">Account</span>
      </button>

      {open ? (
        <div className="absolute right-0 mt-2 w-48 rounded-lg bg-card p-2 shadow-lg ring-1 ring-foreground/8">
          <Link href="/settings" className="block rounded-md px-3 py-2 hover:bg-muted/30">Settings</Link>
          <Link href="/workspace" className="block rounded-md px-3 py-2 hover:bg-muted/30">Switch Workspace</Link>
          <button onClick={handleSignOut} className="w-full text-left block rounded-md px-3 py-2 hover:bg-muted/30">Sign out</button>
        </div>
      ) : null}
    </div>
  )
}
