import { pgTable, text, timestamp, jsonb, index, unique, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./auth";

export { user } from "./auth";

export const userProfile = pgTable(
  "user_profile",
  {
    userId: text("user_id").primaryKey().references(() => user.id, { onDelete: "cascade" }),
    avatar: text("avatar"),
    timezone: text("timezone").default("UTC").notNull(),
    language: text("language").default("en").notNull(),
    country: text("country"),
    status: text("status").notNull().default("active"),
    verificationStatus: text("verification_status").notNull().default("unverified"),
    suspendedAt: timestamp("suspended_at"),
    suspendedBy: text("suspended_by"),
    deletedAt: timestamp("deleted_at"),
    deletedBy: text("deleted_by"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("user_profile_status_idx").on(table.status),
    index("user_profile_userId_idx").on(table.userId),
  ]
);

export const externalIdentity = pgTable(
  "external_identity",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(),
    providerUserId: text("provider_user_id").notNull(),
    linkedAt: timestamp("linked_at").defaultNow().notNull(),
  },
  (table) => [
    unique("external_identity_user_provider_unique").on(table.userId, table.provider),
    index("external_identity_userId_idx").on(table.userId),
    index("external_identity_provider_idx").on(table.provider),
  ]
);

export const userPreferences = pgTable(
  "user_preferences",
  {
    userId: text("user_id").primaryKey().references(() => user.id, { onDelete: "cascade" }),
    preferences: jsonb("preferences").$type<Record<string, unknown>>().notNull().default({}),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  }
);

export const role = pgTable(
  "role",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull().unique(),
    description: text("description"),
    level: text("level").notNull().default("0"),
    isSystem: boolean("is_system").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("role_level_idx").on(table.level)]
);

export const permission = pgTable(
  "permission",
  {
    id: text("id").primaryKey(),
    key: text("key").notNull().unique(),
    description: text("description"),
    category: text("category"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("permission_key_idx").on(table.key),
    index("permission_category_idx").on(table.category),
  ]
);

export const rolePermission = pgTable(
  "role_permission",
  {
    id: text("id").primaryKey(),
    roleId: text("role_id").notNull().references(() => role.id, { onDelete: "cascade" }),
    permissionId: text("permission_id").notNull().references(() => permission.id, { onDelete: "cascade" }),
  },
  (table) => [
    unique("role_permission_unique").on(table.roleId, table.permissionId),
    index("role_permission_roleId_idx").on(table.roleId),
    index("role_permission_permissionId_idx").on(table.permissionId),
  ]
);

export const organization = pgTable(
  "organization",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    ownerId: text("owner_id").notNull().references(() => user.id),
    settings: jsonb("settings").$type<Record<string, unknown>>().notNull().default({}),
    status: text("status").notNull().default("active"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("organization_ownerId_idx").on(table.ownerId),
    index("organization_slug_idx").on(table.slug),
    index("organization_status_idx").on(table.status),
  ]
);

export const workspace = pgTable(
  "workspace",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    type: text("type").notNull().default("personal"),
    ownerId: text("owner_id").notNull().references(() => user.id),
    organizationId: text("organization_id").references(() => organization.id),
    settings: jsonb("settings").$type<Record<string, unknown>>().notNull().default({}),
    limits: jsonb("limits").$type<Record<string, unknown>>().notNull().default({}),
    status: text("status").notNull().default("active"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("workspace_ownerId_idx").on(table.ownerId),
    index("workspace_organizationId_idx").on(table.organizationId),
    index("workspace_slug_idx").on(table.slug),
    index("workspace_status_idx").on(table.status),
  ]
);

export const workspaceMember = pgTable(
  "workspace_member",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id").notNull().references(() => workspace.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    roleId: text("role_id").references(() => role.id),
    status: text("status").notNull().default("active"),
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
    invitedBy: text("invited_by").references(() => user.id),
    leftAt: timestamp("left_at"),
  },
  (table) => [
    unique("workspace_member_unique").on(table.workspaceId, table.userId),
    index("workspace_member_workspaceId_idx").on(table.workspaceId),
    index("workspace_member_userId_idx").on(table.userId),
    index("workspace_member_status_idx").on(table.status),
  ]
);

export const organizationMember = pgTable(
  "organization_member",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    roleId: text("role_id").references(() => role.id),
    status: text("status").notNull().default("active"),
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
  },
  (table) => [
    unique("organization_member_unique").on(table.organizationId, table.userId),
    index("organization_member_organizationId_idx").on(table.organizationId),
    index("organization_member_userId_idx").on(table.userId),
    index("organization_member_status_idx").on(table.status),
  ]
);

export const invitation = pgTable(
  "invitation",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    workspaceId: text("workspace_id").references(() => workspace.id, { onDelete: "cascade" }),
    organizationId: text("organization_id").references(() => organization.id, { onDelete: "cascade" }),
    roleId: text("role_id").references(() => role.id),
    token: text("token").notNull().unique(),
    invitedBy: text("invited_by").notNull().references(() => user.id),
    status: text("status").notNull().default("pending"),
    expiresAt: timestamp("expires_at").notNull(),
    acceptedAt: timestamp("accepted_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("invitation_workspaceId_idx").on(table.workspaceId),
    index("invitation_organizationId_idx").on(table.organizationId),
    index("invitation_email_idx").on(table.email),
    index("invitation_status_idx").on(table.status),
    index("invitation_token_idx").on(table.token),
  ]
);

export const apiKey = pgTable(
  "api_key",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    workspaceId: text("workspace_id").references(() => workspace.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    keyPrefix: text("key_prefix").notNull(),
    keyHash: text("key_hash").notNull(),
    scopes: jsonb("scopes").$type<string[]>().notNull().default([]),
    expiresAt: timestamp("expires_at"),
    lastUsedAt: timestamp("last_used_at"),
    usageCount: text("usage_count").notNull().default("0"),
    isRevoked: boolean("is_revoked").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("api_key_userId_idx").on(table.userId),
    index("api_key_workspaceId_idx").on(table.workspaceId),
    index("api_key_keyPrefix_idx").on(table.keyPrefix),
    index("api_key_isRevoked_idx").on(table.isRevoked),
  ]
);

export const workspaceTransfer = pgTable(
  "workspace_transfer",
  {
    id: text("id").primaryKey(),
    workspaceId: text("workspace_id").notNull().references(() => workspace.id, { onDelete: "cascade" }),
    fromOwnerId: text("from_owner_id").notNull().references(() => user.id),
    toOwnerId: text("to_owner_id").notNull().references(() => user.id),
    transferredAt: timestamp("transferred_at").defaultNow().notNull(),
  },
  (table) => [index("workspace_transfer_workspaceId_idx").on(table.workspaceId)]
);

export const userProfileRelations = relations(userProfile, ({ one }) => ({
  user: one(user, {
    fields: [userProfile.userId],
    references: [user.id],
  }),
}));

export const externalIdentityRelations = relations(externalIdentity, ({ one }) => ({
  user: one(user, {
    fields: [externalIdentity.userId],
    references: [user.id],
  }),
}));

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(user, {
    fields: [userPreferences.userId],
    references: [user.id],
  }),
}));

export const workspaceRelations = relations(workspace, ({ one, many }) => ({
  owner: one(user, {
    fields: [workspace.ownerId],
    references: [user.id],
  }),
  organization: one(organization, {
    fields: [workspace.organizationId],
    references: [organization.id],
  }),
  members: many(workspaceMember),
  apiKeys: many(apiKey),
  transfers: many(workspaceTransfer),
}));

export const organizationRelations = relations(organization, ({ one, many }) => ({
  owner: one(user, {
    fields: [organization.ownerId],
    references: [user.id],
  }),
  workspaces: many(workspace),
  members: many(organizationMember),
}));

export const workspaceMemberRelations = relations(workspaceMember, ({ one }) => ({
  workspace: one(workspace, {
    fields: [workspaceMember.workspaceId],
    references: [workspace.id],
  }),
  user: one(user, {
    fields: [workspaceMember.userId],
    references: [user.id],
  }),
  role: one(role, {
    fields: [workspaceMember.roleId],
    references: [role.id],
  }),
  invitedByUser: one(user, {
    fields: [workspaceMember.invitedBy],
    references: [user.id],
    relationName: "invitedByWorkspaceMember",
  }),
}));

export const organizationMemberRelations = relations(organizationMember, ({ one }) => ({
  organization: one(organization, {
    fields: [organizationMember.organizationId],
    references: [organization.id],
  }),
  user: one(user, {
    fields: [organizationMember.userId],
    references: [user.id],
  }),
  role: one(role, {
    fields: [organizationMember.roleId],
    references: [role.id],
  }),
}));

export const invitationRelations = relations(invitation, ({ one }) => ({
  workspace: one(workspace, {
    fields: [invitation.workspaceId],
    references: [workspace.id],
  }),
  organization: one(organization, {
    fields: [invitation.organizationId],
    references: [organization.id],
  }),
  role: one(role, {
    fields: [invitation.roleId],
    references: [role.id],
  }),
  invitedByUser: one(user, {
    fields: [invitation.invitedBy],
    references: [user.id],
  }),
}));

export const roleRelations = relations(role, ({ many }) => ({
  workspaceMembers: many(workspaceMember),
  organizationMembers: many(organizationMember),
  invitations: many(invitation),
  rolePermissions: many(rolePermission),
}));

export const permissionRelations = relations(permission, ({ many }) => ({
  rolePermissions: many(rolePermission),
}));

export const rolePermissionRelations = relations(rolePermission, ({ one }) => ({
  role: one(role, {
    fields: [rolePermission.roleId],
    references: [role.id],
  }),
  permission: one(permission, {
    fields: [rolePermission.permissionId],
    references: [permission.id],
  }),
}));

export const apiKeyRelations = relations(apiKey, ({ one }) => ({
  user: one(user, {
    fields: [apiKey.userId],
    references: [user.id],
  }),
  workspace: one(workspace, {
    fields: [apiKey.workspaceId],
    references: [workspace.id],
  }),
}));

export const workspaceTransferRelations = relations(workspaceTransfer, ({ one }) => ({
  workspace: one(workspace, {
    fields: [workspaceTransfer.workspaceId],
    references: [workspace.id],
  }),
  fromOwner: one(user, {
    fields: [workspaceTransfer.fromOwnerId],
    references: [user.id],
    relationName: "fromOwnerTransfer",
  }),
  toOwner: one(user, {
    fields: [workspaceTransfer.toOwnerId],
    references: [user.id],
    relationName: "toOwnerTransfer",
  }),
}));
