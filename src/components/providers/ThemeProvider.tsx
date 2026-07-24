"use client"

import * as React from "react"
import { ThemeProvider as NextThemeProvider } from "next-themes"

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemeProvider 
      attribute="class" 
      defaultTheme="dark"
      enableSystem={false}
      storageKey="theme-preference"
      suppressHydrationWarning
      forcedTheme={undefined}
    >
      {children}
    </NextThemeProvider>
  )
}
