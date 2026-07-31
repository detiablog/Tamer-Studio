"use client";

import * as React from "react";
import useSWR from "swr";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Filter, UserPlus, Loader, X, Trash2, Edit, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";
import { useLocalizationContext } from "@/providers/localization";

const fetcher = (url: string) => 
  fetch(url)
    .then((r) => {
      if (!r.ok) throw new Error(`API error: ${r.status}`);
      return r.json();
    })
    .catch((error) => {
      throw error;
    });

export default function AdminUsersPage() {
  const { t } = useLocalizationContext();
  const { data, error, isLoading, mutate } = useSWR("/api/admin/users", fetcher, { 
    revalidateOnFocus: false,
    shouldRetryOnError: false,
    dedupingInterval: 5000,
  });
  
  const [search, setSearch] = React.useState("");
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [roleFilter, setRoleFilter] = React.useState<string>("all");
  const [addUserOpen, setAddUserOpen] = React.useState(false);
  const [editUserOpen, setEditUserOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<any>(null);
  const [originalData, setOriginalData] = React.useState<any>(null);
  const [formLoading, setFormLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({ name: "", email: "", password: "", role: "user", status: "active", emailVerified: false });

  const dbUsers = React.useMemo(() => {
    if (data?.success && Array.isArray(data.data)) {
      return data.data;
    }
    if (error) {
      return [];
    }
    return [];
  }, [data, error]);

  const isUsingMockData = !data && error;

  const filtered = React.useMemo(() => {
    return dbUsers.filter((u: any) => {
      const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || u.status.toLowerCase() === statusFilter.toLowerCase();
      const matchesRole = roleFilter === "all" || u.role.toLowerCase() === roleFilter.toLowerCase();
      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [dbUsers, search, statusFilter, roleFilter]);

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setRoleFilter("all");
  };

  const hasActiveFilters = search.trim() || statusFilter !== "all" || roleFilter !== "all";

  const openEditModal = (user: any) => {
    setEditingUser(user);
    
    const roleValue = user.role || "user";
    const statusValue = user.status || "active";
    
    const data = { 
      name: user.name || "", 
      email: user.email || "", 
      password: "",
      role: roleValue,
      status: statusValue,
      emailVerified: user.emailVerified || false,
    };
    
    setOriginalData(data);
    setFormData(data);
    setEditUserOpen(true);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (!response.ok) {
        toast.error(typeof result.error === "string" ? result.error : (result.error?.message || result.error?.toString?.() || t("admin.failedToCreateUser", "Failed to create user")));
        return;
      }

      toast.success(t("admin.userCreatedSuccess", "User created successfully!"));
      setFormData({ name: "", email: "", password: "", role: "user", status: "active" });
      setAddUserOpen(false);
      mutate();
    } catch (error) {
      toast.error(t("admin.errorCreatingUser", "Error creating user"));
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingUser?.id) {
      toast.error(t("admin.userIdNotFound", "User ID not found"));
      return;
    }

    if (!formData.name?.trim()) {
      toast.error(t("admin.nameRequired", "Name cannot be empty"));
      return;
    }
    if (!formData.email?.trim()) {
      toast.error(t("admin.emailRequired", "Email cannot be empty"));
      return;
    }

    const payload: Record<string, unknown> = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      role: formData.role,
      status: formData.status,
      emailVerified: formData.emailVerified,
    };
    if (formData.password && formData.password.trim().length >= 12) {
      payload.password = formData.password.trim();
    }

    const userId = String(editingUser.id);
    setFormLoading(true);

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) {
        toast.error(typeof result.error === "string" ? result.error : (result.error?.message || result.error?.toString?.() || t("admin.failedToUpdateUser", "Failed to update user")));
        return;
      }

      toast.success(t("admin.userUpdatedSuccess", "User updated successfully!"));
      setFormData({ name: "", email: "", password: "", role: "user", status: "active", emailVerified: false });
      setOriginalData(null);
      setEditingUser(null);
      setEditUserOpen(false);
      mutate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("admin.errorUpdatingUser", "Error updating user"));
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(t("admin.confirmDeleteUser", `Delete "{{name}}"?`).replace("{{name}}", userName))) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: t("admin.failedToDeleteUser", "Failed to delete user") }));
        toast.error(errorData.error || t("admin.failedToDeleteUser", "Failed to delete user"));
        return;
      }

      toast.success(t("admin.userDeletedSuccess", "User deleted successfully!"));
      mutate();
    } catch (error) {
      toast.error(t("admin.errorDeletingUser", "Error deleting user"));
    }
  };

  const handleForceVerify = async (userId: string, userName: string) => {
    if (!confirm(t("admin.confirmForceVerify", `Force verify "{{name}}"?`).replace("{{name}}", userName))) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}/force-verify`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: t("admin.failedToForceVerify", "Failed to force verify user") }));
        toast.error(errorData.error || t("admin.failedToForceVerify", "Failed to force verify user"));
        return;
      }

      toast.success(t("admin.userForceVerified", "User force-verified successfully!"));
      mutate();
    } catch (error) {
      toast.error(t("admin.errorForceVerifying", "Error force verifying user"));
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: t("admin.users", "Users") }]} />
      
      <DashboardCard>
        <div className="mb-6">
          <h1 className="text-3xl font-bold">{t("admin.users", "Users")}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t("admin.manageUsers", "Manage platform users, roles, and access")}</p>
        </div>

        <div className="flex items-center gap-2 pb-4 flex-wrap">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("admin.searchUsers", "Search users...")}
              className="pl-9"
              disabled={isLoading}
            />
          </div>
          
          <div className="relative">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setFilterOpen(!filterOpen)}
            >
              <Filter className="mr-2 size-4" />
              {t("common.filter", "Filter")}
              {hasActiveFilters && <span className="ml-1.5 size-1.5 rounded-full bg-primary" />}
            </Button>
            
            {filterOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 rounded-lg border border-border bg-card p-4 shadow-lg z-50">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">{t("admin.status", "Status")}</label>
                    <select 
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    >
                      <option value="all">{t("admin.allStatus", "All Status")}</option>
                      <option value="active">{t("admin.active", "Active")}</option>
                      <option value="pending">{t("admin.pending", "Pending")}</option>
                      <option value="suspended">{t("admin.suspended", "Suspended")}</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">{t("admin.role", "Role")}</label>
                    <select 
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    >
                      <option value="all">{t("admin.allRoles", "All Roles")}</option>
                      <option value="admin">{t("admin.roleAdmin", "Admin")}</option>
                      <option value="user">{t("admin.roleUser", "User")}</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Button size="sm" onClick={() => setAddUserOpen(true)}>
            <UserPlus className="mr-2 size-4" />
            {t("admin.addUser", "Add User")}
          </Button>
        </div>

        {isLoading && dbUsers.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="size-6 animate-spin text-muted-foreground" />
            <p className="ml-2 text-muted-foreground">{t("admin.loadingUsers", "Loading users...")}</p>
          </div>
        ) : (
          <>
            {isUsingMockData && (
              <div className="mb-4 rounded-lg border border-amber-200/50 bg-amber-50/50 dark:bg-amber-950/20 p-3 text-xs text-amber-700 dark:text-amber-300">
                {t("admin.databaseError", "Database connection failed. Please check your connection and try again.")}
              </div>
            )}
            {dbUsers.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">{t("admin.noUsers", "No users found")}</p>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={resetFilters} className="mt-2">
                    {t("admin.clearFilters", "Clear filters")}
                  </Button>
                )}
              </div>
            ) : (
              <AdminDataTable
                key={`${search}-${statusFilter}-${roleFilter}`}
                data={filtered}
                keyExtractor={(u) => u.id}
                columns={[
                  { key: "user", header: t("admin.user", "User"), render: (u: any) => (
                    <div>
                      <p className="font-medium text-sm">{u.name}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  )},
                  { key: "role", header: t("admin.role", "Role"), align: "center", render: (u: any) => <Badge tone={u.role.toLowerCase() === "admin" ? "info" : "muted"}>{t(`admin.role${u.role.charAt(0).toUpperCase() + u.role.slice(1).toLowerCase()}`, u.role)}</Badge> },
                  { key: "status", header: t("admin.status", "Status"), align: "center", render: (u: any) => <Badge tone={u.status.toLowerCase() === "active" ? "success" : u.status.toLowerCase() === "pending" ? "warning" : "muted"}>{t(`admin.${u.status.toLowerCase()}`, u.status)}</Badge> },
                  { key: "verificationStatus", header: t("admin.verificationStatus", "Verification Status"), align: "center", render: (u: any) => {
                    if (u.emailVerified) return <Badge tone="success">{t("auth.verificationSuccess", "Verified")}</Badge>;
                    if (u.status === "pending_verification") return <Badge tone="warning">{t("admin.pending", "Pending")}</Badge>;
                    return <Badge tone="error">{t("admin.unverified", "Unverified")}</Badge>;
                  }},
                  { key: "joined", header: t("admin.joined", "Joined"), render: (u: any) => <span className="text-sm">{u.joined}</span> },
                  { key: "lastActive", header: t("admin.lastActive", "Last Active"), render: (u: any) => <span className="text-sm">{u.lastActive}</span> },
                  { key: "actions", header: "", align: "right", render: (u: any) => (
                    <div className="flex items-center gap-1 justify-end">
                      {!u.emailVerified && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="size-8 text-emerald-600 hover:text-emerald-600"
                          onClick={() => handleForceVerify(u.id, u.name)}
                          title={t("admin.forceVerify", "Force Verify")}
                        >
                          <ShieldCheck className="size-4" />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="size-8"
                        onClick={() => openEditModal(u)}
                      >
                        <Edit className="size-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="size-8 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteUser(u.id, u.name)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  )},
                ]}
              />
            )}
          </>
        )}
      </DashboardCard>

      {addUserOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setAddUserOpen(false)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">{t("admin.addUser", "Add New User")}</h2>
              <button onClick={() => setAddUserOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4">
               <div>
                 <label className="text-sm font-medium mb-1.5 block">{t("common.name", "Name")}</label>
                 <Input type="text" placeholder={t("admin.namePlaceholder", "John Doe")} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
               </div>
               <div>
                 <label className="text-sm font-medium mb-1.5 block">{t("common.email", "Email")}</label>
                 <Input type="email" placeholder={t("admin.emailPlaceholder", "john@example.com")} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
               </div>
               <div>
                 <label className="text-sm font-medium mb-1.5 block">{t("common.password", "Password")}</label>
                 <Input type="password" placeholder={t("admin.passwordPlaceholder", "••••••••")} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
               </div>
               <div>
                 <label className="text-sm font-medium mb-1.5 block">{t("admin.role", "Role")}</label>
                 <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                   <option value="admin">{t("admin.roleAdmin", "Admin")}</option>
                   <option value="user">{t("admin.roleUser", "User")}</option>
                 </select>
               </div>
               <div>
                 <label className="text-sm font-medium mb-1.5 block">{t("admin.status", "Status")}</label>
                 <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                   <option value="active">{t("admin.active", "Active")}</option>
                   <option value="pending">{t("admin.pending", "Pending")}</option>
                   <option value="suspended">{t("admin.suspended", "Suspended")}</option>
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setAddUserOpen(false)} className="flex-1">{t("common.cancel", "Cancel")}</Button>
                <Button type="submit" disabled={formLoading} className="flex-1">{formLoading ? t("admin.creating", "Creating...") : t("admin.create", "Create")}</Button>
              </div>
            </form>
          </div>
        </>
      )}

      {editUserOpen && editingUser && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setEditUserOpen(false)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card shadow-xl ring-1 ring-primary/5">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div>
                <h2 className="text-lg font-semibold">{t("admin.editUser", "Edit User")}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{editingUser.email}</p>
              </div>
              <button onClick={() => setEditUserOpen(false)} className="size-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition">
                <X className="size-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleEditUser} className="p-6 space-y-5">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="edit-name" className="text-sm font-semibold">{t("common.name", "Name")}</Label>
                <Input
                  id="edit-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Full name"
                  required
                  disabled={formLoading}
                  className="h-10 bg-background/50 border-border focus:border-primary transition"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="edit-email" className="text-sm font-semibold">{t("common.email", "Email")}</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="user@example.com"
                  required
                  disabled={formLoading}
                  className="h-10 bg-background/50 border-border focus:border-primary transition"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="edit-password" className="text-sm font-semibold">{t("admin.passwordOptional", "Password")} <span className="text-muted-foreground font-normal text-xs">({t("admin.leaveEmptyToKeep", "leave empty to keep current")})</span></Label>
                <Input
                  id="edit-password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  disabled={formLoading}
                  className="h-10 bg-background/50 border-border focus:border-primary transition"
                />
              </div>

              {/* Role & Status in a row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-role" className="text-sm font-semibold">{t("admin.role", "Role")}</Label>
                  <select
                    id="edit-role"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    disabled={formLoading}
                    className="w-full h-10 rounded-lg border border-border bg-background/50 px-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                  >
                    <option value="user">{t("admin.roleUser", "User")}</option>
                    <option value="admin">{t("admin.roleAdmin", "Admin")}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status" className="text-sm font-semibold">{t("admin.status", "Status")}</Label>
                  <select
                    id="edit-status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    disabled={formLoading}
                    className="w-full h-10 rounded-lg border border-border bg-background/50 px-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                  >
                    <option value="active">{t("admin.active", "Active")}</option>
                    <option value="pending">{t("admin.pending", "Pending")}</option>
                    <option value="suspended">{t("admin.suspended", "Suspended")}</option>
                  </select>
                </div>
              </div>

              {/* Email Verified Toggle */}
              <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-muted/30">
                <input
                  type="checkbox"
                  id="editEmailVerified"
                  checked={formData.emailVerified}
                  onChange={(e) => setFormData({ ...formData, emailVerified: e.target.checked })}
                  disabled={formLoading}
                  className="h-4 w-4 rounded border-border cursor-pointer transition accent-primary"
                />
                <div>
                  <label htmlFor="editEmailVerified" className="text-sm font-medium cursor-pointer">
                    {t("admin.emailVerified", "Email Verified")}
                  </label>
                  <p className="text-xs text-muted-foreground">{t("admin.emailVerifiedDesc", "Mark this user's email as verified")}</p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setEditUserOpen(false)} disabled={formLoading} className="flex-1 h-10">
                  {t("common.cancel", "Cancel")}
                </Button>
                <Button type="submit" disabled={formLoading} className="flex-1 h-10 text-sm font-semibold bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg transition">
                  {formLoading ? (
                    <><span className="inline-block animate-spin mr-2">⏳</span>{t("admin.updating", "Updating...")}</>
                  ) : t("admin.update", "Update User")}
                </Button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
