"use client";

import * as React from "react";

// Admin permissions - all permissions allowed in development
const ADMIN_PERMISSIONS = [
  "admin:users",
  "admin:organizations",
  "admin:workspaces",
  "admin:ai_providers",
  "admin:jobs",
  "admin:queues",
  "admin:billing",
  "admin:subscriptions",
  "admin:coupons",
  "admin:analytics",
  "admin:audit_logs",
  "admin:feature_flags",
  "admin:system",
] as const;

export type AdminPermission = typeof ADMIN_PERMISSIONS[number];

export function useAdminPermissions() {
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  // Check if admin session cookie exists - only on client side
  React.useEffect(() => {
    console.log("[useAdminPermissions] useEffect running...");
    console.log("[useAdminPermissions] typeof window:", typeof window);
    console.log("[useAdminPermissions] typeof document:", typeof document);
    
    // Check for admin_session cookie
    const allCookies = document.cookie;
    console.log("[useAdminPermissions] document.cookie raw:", allCookies);
    
    const adminSessionCookie = allCookies
      .split("; ")
      .find((row) => {
        console.log("[useAdminPermissions] checking cookie:", row);
        return row.startsWith("admin_session=");
      });
    
    console.log("[useAdminPermissions] admin_session cookie found:", !!adminSessionCookie);
    
    // Also check localStorage as fallback
    let localStorageToken = null;
    try {
      localStorageToken = localStorage.getItem("admin_session_token");
      console.log("[useAdminPermissions] localStorage token found:", !!localStorageToken);
    } catch (err) {
      console.error("[useAdminPermissions] localStorage error:", err);
    }
    
    const hasAdminSession = !!adminSessionCookie || !!localStorageToken;
    
    console.log("[useAdminPermissions] Final result - hasAdminSession:", hasAdminSession);
    console.log("[useAdminPermissions] isAdmin will be set to:", hasAdminSession);
    
    setIsAdmin(hasAdminSession);
    setMounted(true);
  }, []);

  const hasPermission = (permission: AdminPermission) => {
    // In development, if admin session exists and mounted, grant all permissions
    if (process.env.NODE_ENV === "development" && isAdmin && mounted) {
      return true;
    }
    
    // In production, would check actual admin roles
    return isAdmin && mounted;
  };

  return {
    isAdmin,
    mounted,
    hasPermission,
    permissions: isAdmin && mounted ? ADMIN_PERMISSIONS : [],
  };
}
