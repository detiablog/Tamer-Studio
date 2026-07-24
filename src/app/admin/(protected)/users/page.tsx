"use client";

import * as React from "react";
import useSWR from "swr";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, UserPlus, Loader, X, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";

const fetcher = (url: string) => 
  fetch(url)
    .then((r) => {
      if (!r.ok) throw new Error(`API error: ${r.status}`);
      return r.json();
    })
    .catch((error) => {
      console.error(`[Fetcher] Failed to fetch ${url}:`, error);
      throw error;
    });

export default function AdminUsersPage() {
  const { data, error, isLoading, mutate } = useSWR("/api/admin/users", fetcher, { 
    revalidateOnFocus: false,
    shouldRetryOnError: false,
    dedupingInterval: 0,
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
  const [formData, setFormData] = React.useState({ name: "", email: "", password: "", role: "user", status: "active" });

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
      status: statusValue
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
        toast.error(result.error || "Failed to create user");
        return;
      }

      toast.success("User created successfully!");
      setFormData({ name: "", email: "", password: "", role: "user", status: "active" });
      setAddUserOpen(false);
      mutate();
    } catch (error) {
      toast.error("Error creating user");
      console.error(error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingUser?.id) {
      toast.error("User ID not found");
      return;
    }

    if (!formData.name?.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    if (!formData.email?.trim()) {
      toast.error("Email cannot be empty");
      return;
    }

    const changedFields: Record<string, unknown> = {};

    if (formData.name.trim() !== originalData?.name) {
      changedFields.name = formData.name.trim();
    }
    if (formData.email.trim() !== originalData?.email) {
      changedFields.email = formData.email.trim();
    }
    if (formData.role !== originalData?.role) {
      changedFields.role = formData.role;
    }
    if (formData.status !== originalData?.status) {
      changedFields.status = formData.status;
    }

    if (Object.keys(changedFields).length === 0) {
      toast.info("No changes made");
      return;
    }

    const userId = String(editingUser.id);
    setFormLoading(true);

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changedFields),
      });

      const result = await response.json();
      if (!response.ok) {
        toast.error(result.error || "Failed to update user");
        return;
      }

      toast.success("User updated successfully!");
      setFormData({ name: "", email: "", password: "", role: "user", status: "active" });
      setOriginalData(null);
      setEditingUser(null);
      setEditUserOpen(false);
      mutate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error updating user");
      console.error(error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Delete "${userName}"?`)) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to delete user" }));
        toast.error(errorData.error || "Failed to delete user");
        return;
      }

      toast.success("User deleted successfully!");
      mutate();
    } catch (error) {
      toast.error("Error deleting user");
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Users" }]} />
      
      <DashboardCard>
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage platform users, roles, and access</p>
        </div>

        <div className="flex items-center gap-2 pb-4 flex-wrap">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
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
              Filter
              {hasActiveFilters && <span className="ml-1.5 size-1.5 rounded-full bg-primary" />}
            </Button>
            
            {filterOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 rounded-lg border border-border bg-card p-4 shadow-lg z-50">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Status</label>
                    <select 
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Role</label>
                    <select 
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    >
                      <option value="all">All Roles</option>
                      <option value="admin">Admin</option>
                      <option value="user">User</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Button size="sm" onClick={() => setAddUserOpen(true)}>
            <UserPlus className="mr-2 size-4" />
            Add User
          </Button>
        </div>

        {isLoading && dbUsers.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="size-6 animate-spin text-muted-foreground" />
            <p className="ml-2 text-muted-foreground">Loading users...</p>
          </div>
        ) : (
          <>
            {isUsingMockData && (
              <div className="mb-4 rounded-lg border border-amber-200/50 bg-amber-50/50 dark:bg-amber-950/20 p-3 text-xs text-amber-700 dark:text-amber-300">
                Database connection failed. Please check your connection and try again.
              </div>
            )}
            {dbUsers.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No users found</p>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={resetFilters} className="mt-2">
                    Clear filters
                  </Button>
                )}
              </div>
            ) : (
              <AdminDataTable
                key={`${search}-${statusFilter}-${roleFilter}`}
                data={filtered}
                keyExtractor={(u) => u.id}
                columns={[
                  { key: "user", header: "User", render: (u: any) => (
                    <div>
                      <p className="font-medium text-sm">{u.name}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  )},
                  { key: "role", header: "Role", align: "center", render: (u: any) => <Badge tone={u.role.toLowerCase() === "admin" ? "info" : "muted"}>{u.role}</Badge> },
                  { key: "status", header: "Status", align: "center", render: (u: any) => <Badge tone={u.status.toLowerCase() === "active" ? "success" : u.status.toLowerCase() === "pending" ? "warning" : "muted"}>{u.status}</Badge> },
                  { key: "emailVerified", header: "Email Verified", align: "center", render: (u: any) => <Badge tone={u.emailVerified ? "success" : "warning"}>{u.emailVerified ? "Yes" : "No"}</Badge> },
                  { key: "joined", header: "Joined", render: (u: any) => <span className="text-sm">{u.joined}</span> },
                  { key: "lastActive", header: "Last Active", render: (u: any) => <span className="text-sm">{u.lastActive}</span> },
                  { key: "actions", header: "", align: "right", render: (u: any) => (
                    <div className="flex items-center gap-1 justify-end">
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
              <h2 className="text-xl font-semibold">Add New User</h2>
              <button onClick={() => setAddUserOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Name</label>
                <Input type="text" placeholder="John Doe" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Email</label>
                <Input type="email" placeholder="john@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Password</label>
                <Input type="password" placeholder="••••••••" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Role</label>
                <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Status</label>
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setAddUserOpen(false)} className="flex-1">Cancel</Button>
                <Button type="submit" disabled={formLoading} className="flex-1">{formLoading ? "Creating..." : "Create"}</Button>
              </div>
            </form>
          </div>
        </>
      )}

      {editUserOpen && editingUser && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setEditUserOpen(false)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Edit User</h2>
              <button onClick={() => setEditUserOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleEditUser} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Name</label>
                <Input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Email</label>
                <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Password (optional)</label>
                <Input type="password" placeholder="••••••••" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Role</label>
                <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Status</label>
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setEditUserOpen(false)} className="flex-1">Cancel</Button>
                <Button type="submit" disabled={formLoading} className="flex-1">{formLoading ? "Updating..." : "Update"}</Button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
