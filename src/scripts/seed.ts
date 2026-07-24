import { db } from "@/lib/db";
import { 
  user, 
  userProfile, 
  role, 
  permission, 
  rolePermission,
  organization, 
  workspace, 
  workspaceMember,
  organizationMember,
  apiKey,
  featureFlag,
  featureFlagHistory,
  aiProvider,
  aiProviderModel,
  job,
  queue,
  workflow,
  workflowExecution,
  billing,
  invoice,
  subscription,
  wallet,
  creditTransaction,
  coupon,
  voucher,
  order,
  checkoutSession,
  paymentIntent,
  refund,
  supportTicket,
  supportTicketComment,
  notificationTemplate,
  notificationPreference,
  notification,
  auditLog,
  asset,
  assetCollection,
  assetTag,
  productionMetrics,
  userActivityMetrics,
  workspaceMetrics,
  eventQueue,
  externalIdentity,
  userPreferences,
  invitation,
  workspaceTransfer,
  creditReservation,
  usageRecord,
  costRecord,
  voucherUsage,
  couponUsage,
  taxRule,
  paymentAttempt,
  supportKnowledgeCategory,
  supportKnowledgeArticle,
  supportFeedback,
  supportCustomerTimeline,
  supportSlaPolicy,
  supportSlaViolation,
  supportAttachment,
  supportInternalNote,
  notificationTemplateVersion,
  assetVersion,
  assetLineage,
  assetCollectionItem,
  assetLifecycleEvent,
} from "@/lib/db/schema";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("🌱 Starting database seed...");

  try {
    // Clear existing data
    console.log("Clearing existing data...");
    await db.delete(workspaceMember).execute();
    await db.delete(organizationMember).execute();
    await db.delete(invitation).execute();
    await db.delete(workspaceTransfer).execute();
    await db.delete(apiKey).execute();
    await db.delete(userPreferences).execute();
    await db.delete(externalIdentity).execute();
    await db.delete(userProfile).execute();
    await db.delete(rolePermission).execute();
    await db.delete(permission).execute();
    await db.delete(role).execute();
    await db.delete(workspace).execute();
    await db.delete(organization).execute();
    await db.delete(user).execute();
    await db.delete(featureFlagHistory).execute();
    await db.delete(featureFlag).execute();
    await db.delete(aiProviderModel).execute();
    await db.delete(aiProvider).execute();
    await db.delete(job).execute();
    await db.delete(queue).execute();
    await db.delete(workflowExecution).execute();
    await db.delete(workflow).execute();
    await db.delete(billing).execute();
    await db.delete(invoice).execute();
    await db.delete(subscription).execute();
    await db.delete(creditTransaction).execute();
    await db.delete(creditReservation).execute();
    await db.delete(wallet).execute();
    await db.delete(couponUsage).execute();
    await db.delete(coupon).execute();
    await db.delete(voucherUsage).execute();
    await db.delete(voucher).execute();
    await db.delete(taxRule).execute();
    await db.delete(refund).execute();
    await db.delete(paymentAttempt).execute();
    await db.delete(paymentIntent).execute();
    await db.delete(checkoutSession).execute();
    await db.delete(order).execute();
    await db.delete(supportInternalNote).execute();
    await db.delete(supportAttachment).execute();
    await db.delete(supportSlaViolation).execute();
    await db.delete(supportFeedback).execute();
    await db.delete(supportKnowledgeArticle).execute();
    await db.delete(supportKnowledgeCategory).execute();
    await db.delete(supportSlaPolicy).execute();
    await db.delete(supportTicketComment).execute();
    await db.delete(supportTicket).execute();
    await db.delete(supportCustomerTimeline).execute();
    await db.delete(notificationTemplateVersion).execute();
    await db.delete(notificationTemplate).execute();
    await db.delete(notificationPreference).execute();
    await db.delete(notification).execute();
    await db.delete(eventQueue).execute();
    await db.delete(assetLifecycleEvent).execute();
    await db.delete(assetTag).execute();
    await db.delete(assetCollectionItem).execute();
    await db.delete(assetVersion).execute();
    await db.delete(assetCollection).execute();
    await db.delete(assetLineage).execute();
    await db.delete(asset).execute();
    await db.delete(productionMetrics).execute();
    await db.delete(userActivityMetrics).execute();
    await db.delete(workspaceMetrics).execute();
    await db.delete(auditLog).execute();

    // Seed Users
    console.log("Seeding users...");
    const userId1 = `user_${randomUUID()}`;
    const userId2 = `user_${randomUUID()}`;
    const userId3 = `user_${randomUUID()}`;

    await db.insert(user).values([
      { id: userId1, email: "admin@tamer.studio", name: "Admin User", role: "admin", status: "active", emailVerified: true },
      { id: userId2, email: "user@example.com", name: "Regular User", role: "user", status: "active", emailVerified: true },
      { id: userId3, email: "demo@example.com", name: "Demo User", role: "user", status: "pending", emailVerified: false },
    ]);

    // Seed User Profiles
    console.log("Seeding user profiles...");
    await db.insert(userProfile).values([
      {
        userId: userId1,
        avatar: null,
        timezone: "UTC",
        language: "en",
        country: "US",
        status: "active",
        verificationStatus: "verified",
      },
      {
        userId: userId2,
        avatar: null,
        timezone: "UTC",
        language: "en",
        country: "UK",
        status: "active",
        verificationStatus: "verified",
      },
      {
        userId: userId3,
        avatar: null,
        timezone: "UTC",
        language: "en",
        country: null,
        status: "active",
        verificationStatus: "unverified",
      },
    ]);

    // Seed Roles
    console.log("Seeding roles...");
    const adminRoleId = `role_${randomUUID()}`;
    const userRoleId = `role_${randomUUID()}`;

    await db.insert(role).values([
      {
        id: adminRoleId,
        name: "Admin",
        description: "Full system access",
        level: "100",
        isSystem: true,
      },
      {
        id: userRoleId,
        name: "User",
        description: "Standard user access",
        level: "10",
        isSystem: true,
      },
    ]);

    // Seed Permissions
    console.log("Seeding permissions...");
    const permIds = [`perm_${randomUUID()}`, `perm_${randomUUID()}`, `perm_${randomUUID()}`];
    await db.insert(permission).values([
      {
        id: permIds[0],
        key: "admin:access",
        description: "Access admin panel",
        category: "admin",
      },
      {
        id: permIds[1],
        key: "user:create",
        description: "Create users",
        category: "users",
      },
      {
        id: permIds[2],
        key: "workspace:create",
        description: "Create workspaces",
        category: "workspaces",
      },
    ]);

    // Seed Role Permissions
    await db.insert(rolePermission).values([
      {
        id: `rp_${randomUUID()}`,
        roleId: adminRoleId,
        permissionId: permIds[0],
      },
      {
        id: `rp_${randomUUID()}`,
        roleId: adminRoleId,
        permissionId: permIds[1],
      },
      {
        id: `rp_${randomUUID()}`,
        roleId: adminRoleId,
        permissionId: permIds[2],
      },
      {
        id: `rp_${randomUUID()}`,
        roleId: userRoleId,
        permissionId: permIds[2],
      },
    ]);

    // Seed Organization
    console.log("Seeding organizations...");
    const orgId = `org_${randomUUID()}`;
    await db.insert(organization).values({
      id: orgId,
      name: "Acme Studio",
      slug: "acme-studio",
      ownerId: userId1,
      settings: { plan: "Pro", maxUsers: 10 },
      status: "active",
    });

    // Seed Workspace
    console.log("Seeding workspaces...");
    const workspaceId = `ws_${randomUUID()}`;
    await db.insert(workspace).values({
      id: workspaceId,
      name: "Default Workspace",
      slug: "default",
      description: "Main workspace",
      type: "personal",
      ownerId: userId1,
      organizationId: orgId,
      settings: { theme: "dark", notifications: true },
      limits: { maxProjects: 100, maxStorage: "10GB" },
      status: "active",
    });

    // Seed Workspace Member
    await db.insert(workspaceMember).values({
      id: `wm_${randomUUID()}`,
      workspaceId: workspaceId,
      userId: userId1,
      roleId: adminRoleId,
      status: "active",
      joinedAt: new Date(),
    });

    // Seed API Keys
    console.log("Seeding API keys...");
    await db.insert(apiKey).values({
      id: `key_${randomUUID()}`,
      userId: userId1,
      workspaceId: workspaceId,
      name: "Development Key",
      keyPrefix: "tam_",
      keyHash: "hashed_key_placeholder",
      scopes: ["read", "write"],
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      usageCount: "0",
      isRevoked: false,
    });

    // Seed Feature Flags
    console.log("Seeding feature flags...");
    await db.insert(featureFlag).values([
      {
        id: `flag_${randomUUID()}`,
        key: "dark_mode",
        description: "Enable dark mode UI",
        enabled: true,
        scope: "global",
        createdBy: userId1,
      },
      {
        id: `flag_${randomUUID()}`,
        key: "new_dashboard",
        description: "Redesigned dashboard layout",
        enabled: true,
        scope: "workspace",
        targetId: workspaceId,
        rolloutPercentage: 50,
        createdBy: userId1,
      },
      {
        id: `flag_${randomUUID()}`,
        key: "ai_suggestions",
        description: "AI-powered content suggestions",
        enabled: false,
        scope: "global",
        createdBy: userId1,
      },
    ]);

    // Seed AI Providers
    console.log("Seeding AI providers...");
    const openaiProviderId = `provider_${randomUUID()}`;
    const anthropicProviderId = `provider_${randomUUID()}`;

    await db.insert(aiProvider).values([
      {
        id: openaiProviderId,
        name: "OpenAI",
        providerType: "openai",
        status: "active",
        priority: 1,
        enabled: true,
        apiKeyConfigured: true,
        capabilities: ["text", "image", "audio"],
        models: ["gpt-4", "gpt-4-turbo", "gpt-3.5-turbo", "dall-e-3"],
        rateLimit: { requestsPerMinute: 60, tokensPerMinute: 100000 },
        costConfiguration: {
          currency: "USD",
          inputPricePerToken: 0.00003,
          outputPricePerToken: 0.00006,
        },
        config: {
          apiKey: "sk-...",
          baseUrl: "https://api.openai.com/v1",
          timeoutMs: 30000,
          retryCount: 3,
        },
        health: {
          lastChecked: new Date(),
          status: "healthy",
          latencyMs: 120,
        },
      },
      {
        id: anthropicProviderId,
        name: "Anthropic",
        providerType: "anthropic",
        status: "active",
        priority: 2,
        enabled: true,
        apiKeyConfigured: true,
        capabilities: ["text"],
        models: ["claude-3-opus", "claude-3-sonnet", "claude-3-haiku"],
        rateLimit: { requestsPerMinute: 50, tokensPerMinute: 50000 },
        costConfiguration: {
          currency: "USD",
          inputPricePerToken: 0.000015,
          outputPricePerToken: 0.000075,
        },
        config: {
          apiKey: "sk-ant-...",
          baseUrl: "https://api.anthropic.com",
          timeoutMs: 30000,
          retryCount: 3,
        },
        health: {
          lastChecked: new Date(),
          status: "healthy",
          latencyMs: 95,
        },
      },
    ]);

    // Seed AI Provider Models
    await db.insert(aiProviderModel).values([
      {
        id: `model_${randomUUID()}`,
        providerId: openaiProviderId,
        modelId: "gpt-4",
        capability: "text",
        available: true,
        deprecated: false,
      },
      {
        id: `model_${randomUUID()}`,
        providerId: openaiProviderId,
        modelId: "gpt-4-turbo",
        capability: "text",
        available: true,
        deprecated: false,
      },
      {
        id: `model_${randomUUID()}`,
        providerId: anthropicProviderId,
        modelId: "claude-3-opus",
        capability: "text",
        available: true,
        deprecated: false,
      },
      {
        id: `model_${randomUUID()}`,
        providerId: anthropicProviderId,
        modelId: "claude-3-haiku",
        capability: "text",
        available: true,
        deprecated: false,
      },
    ]);

    // Seed Jobs
    console.log("Seeding jobs...");
    const queueId = `queue_${randomUUID()}`;
    await db.insert(queue).values({
      id: queueId,
      name: "default",
      depth: 0,
      throughput: "12.5/min",
      avgWait: "45s",
      status: "active",
      failed: 0,
    });

    await db.insert(job).values([
      {
        id: `job_${randomUUID()}`,
        type: "video.generate",
        payload: { prompt: "Generate a marketing video", style: "modern" },
        status: "completed",
        priority: "high",
        progress: 100,
        attempts: 1,
        maxAttempts: 3,
        result: { outputUrl: "https://example.com/video.mp4" },
        completedAt: new Date(),
      },
      {
        id: `job_${randomUUID()}`,
        type: "image.generate",
        payload: { prompt: "Generate product image", size: "1024x1024" },
        status: "queued",
        priority: "normal",
        progress: 0,
        attempts: 0,
        maxAttempts: 3,
      },
      {
        id: `job_${randomUUID()}`,
        type: "audio.generate",
        payload: { prompt: "Generate voiceover", voice: "en-US" },
        status: "failed",
        priority: "normal",
        progress: 45,
        attempts: 3,
        maxAttempts: 3,
        error: "API timeout",
      },
    ]);

    // Seed Workflows
    console.log("Seeding workflows...");
    const workflowId = `wf_${randomUUID()}`;
    await db.insert(workflow).values({
      id: workflowId,
      name: "Content Generation Pipeline",
      description: "Generate marketing content from prompt",
      version: "1.0.0",
      steps: [
        { id: "step1", name: "Generate Script", handler: "script.generate", config: {}, dependsOn: [] },
        { id: "step2", name: "Generate Images", handler: "image.generate", config: {}, dependsOn: ["step1"] },
        { id: "step3", name: "Generate Audio", handler: "audio.generate", config: {}, dependsOn: ["step2"] },
      ],
      variables: ["prompt", "style", "voice"],
      tags: ["marketing", "content"],
      status: "active",
    });

    await db.insert(workflowExecution).values({
      id: `wf_exec_${randomUUID()}`,
      workflowId: workflowId,
      status: "completed",
      context: { prompt: "Test prompt", style: "modern" },
      result: { output: "Generated content" },
      startedAt: new Date(Date.now() - 60000),
      completedAt: new Date(),
    });

    // Seed Billing
    console.log("Seeding billing...");
    await db.insert(billing).values({
      id: `bill_${randomUUID()}`,
      workspaceId: workspaceId,
      plan: "Pro",
      price: "99.00",
      currency: "USD",
      billingCycle: "monthly",
      status: "active",
    });

    // Seed Subscription
    const subscriptionId = `sub_${randomUUID()}`;
    await db.insert(subscription).values({
      id: subscriptionId,
      workspaceId: workspaceId,
      planId: "plan_pro",
      status: "active",
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      cancelAtPeriodEnd: "false",
    });

    // Seed Invoice
    await db.insert(invoice).values({
      id: `inv_${randomUUID()}`,
      workspaceId: workspaceId,
      subscriptionId: subscriptionId,
      status: "paid",
      currency: "USD",
      subtotal: "99.00",
      tax: "0.00",
      total: "99.00",
      lineItems: [{ description: "Pro Plan - Monthly", amount: "99.00" }],
    });

    // Seed Wallet
    const walletId = `wallet_${randomUUID()}`;
    await db.insert(wallet).values({
      id: walletId,
      workspaceId: workspaceId,
      availableCredits: "1000",
      reservedCredits: "0",
      pendingCredits: "0",
      currency: "USD",
    });

    // Seed Credit Transaction
    await db.insert(creditTransaction).values({
      id: `txn_${randomUUID()}`,
      walletId: walletId,
      workspaceId: workspaceId,
      type: "purchase",
      amount: "1000",
      balanceBefore: "0",
      balanceAfter: "1000",
      description: "Initial credit purchase",
    });

    // Seed Coupons
    console.log("Seeding coupons...");
    await db.insert(coupon).values([
      {
        id: `coupon_${randomUUID()}`,
        code: "LAUNCH2026",
        type: "percentage",
        value: "20",
        currency: "USD",
        minPurchase: "50",
        maxDiscount: "100",
        expiresAt: new Date("2026-12-31"),
        usageLimit: "500",
        isActive: true,
      },
      {
        id: `coupon_${randomUUID()}`,
        code: "WELCOME50",
        type: "fixed",
        value: "50",
        currency: "USD",
        minPurchase: "100",
        maxDiscount: "50",
        expiresAt: new Date("2026-11-30"),
        usageLimit: "200",
        isActive: true,
      },
    ]);

    // Seed Vouchers
    await db.insert(voucher).values({
      id: `voucher_${randomUUID()}`,
      code: "GIFT100",
      type: "fixed",
      value: "100",
      currency: "USD",
      expiresAt: new Date("2026-12-31"),
      usageLimit: "50",
      isActive: true,
    });

    // Seed Orders
    console.log("Seeding orders...");
    const orderId = `order_${randomUUID()}`;
    await db.insert(order).values({
      id: orderId,
      workspaceId: workspaceId,
      userId: userId2,
      status: "paid",
      currency: "USD",
      subtotal: "99.00",
      tax: "0.00",
      discount: "0.00",
      total: "99.00",
      items: [{ name: "Pro Plan", quantity: 1, price: "99.00" }],
      paidAt: new Date(),
    });

    // Seed Checkout Session
    const checkoutSessionId = `cs_${randomUUID()}`;
    await db.insert(checkoutSession).values({
      id: checkoutSessionId,
      workspaceId: workspaceId,
      userId: userId2,
      orderId: orderId,
      status: "completed",
      paymentProvider: "stripe",
      paymentIntentId: `pi_${randomUUID()}`,
      currency: "USD",
      amount: "99.00",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      completedAt: new Date(),
    });

    // Seed Payment Intent
    const paymentIntentId = `pi_${randomUUID()}`;
    await db.insert(paymentIntent).values({
      id: paymentIntentId,
      orderId: orderId,
      checkoutSessionId: checkoutSessionId,
      workspaceId: workspaceId,
      userId: userId2,
      status: "succeeded",
      provider: "stripe",
      providerReference: "pi_1234567890",
      amount: "99.00",
      currency: "USD",
      succeededAt: new Date(),
    });

    // Seed Refund
    await db.insert(refund).values({
      id: `refund_${randomUUID()}`,
      orderId: orderId,
      paymentIntentId: paymentIntentId,
      workspaceId: workspaceId,
      userId: userId2,
      status: "pending",
      amount: "0.00",
      currency: "USD",
      reason: "Customer request",
      refundType: "full",
    });

    // Seed Tax Rules
    await db.insert(taxRule).values({
      id: `tax_${randomUUID()}`,
      name: "US Sales Tax",
      region: "US",
      rate: "0.08",
      type: "percentage",
      currency: "USD",
      isActive: true,
      priority: "1",
    });

    // Seed Support Tickets
    console.log("Seeding support tickets...");
    const ticketId = `ticket_${randomUUID()}`;
    await db.insert(supportTicket).values({
      id: ticketId,
      userId: userId2,
      workspaceId: workspaceId,
      category: "billing",
      priority: "medium",
      status: "open",
      subject: "Billing question about invoice",
      description: "I have a question about my recent invoice...",
    });

    await db.insert(supportTicketComment).values({
      id: `comment_${randomUUID()}`,
      ticketId: ticketId,
      userId: userId2,
      content: "I was charged twice for this month",
      isInternal: false,
    });

    // Seed Support Knowledge Base
    const kbCategoryId = `kb_cat_${randomUUID()}`;
    await db.insert(supportKnowledgeCategory).values({
      id: kbCategoryId,
      name: "Billing",
      description: "Billing and payment related articles",
    });

    await db.insert(supportKnowledgeArticle).values({
      id: `kb_article_${randomUUID()}`,
      categoryId: kbCategoryId,
      title: "How to update payment method",
      content: "Go to Settings > Billing > Payment Methods...",
      status: "published",
      version: 1,
      publishedAt: new Date(),
    });

    // Seed Support SLA Policy
    await db.insert(supportSlaPolicy).values({
      id: `sla_${randomUUID()}`,
      name: "Standard Response Time",
      priority: "medium",
      responseTimeMinutes: 60,
      resolutionTimeMinutes: 1440,
      isActive: true,
    });

    // Seed Notifications
    console.log("Seeding notifications...");
    const notifTemplateId = `tmpl_${randomUUID()}`;
    await db.insert(notificationTemplate).values({
      id: notifTemplateId,
      name: "Welcome Email",
      category: "system",
      channel: "email",
      subject: "Welcome to Tamer Studio!",
      body: "Thank you for signing up...",
      locale: "en",
      version: 1,
      isActive: true,
    });

    await db.insert(notificationPreference).values({
      id: `pref_${randomUUID()}`,
      userId: userId2,
      channel: "email",
      category: "billing",
      enabled: true,
    });

    await db.insert(notification).values({
      id: `notif_${randomUUID()}`,
      userId: userId2,
      type: "billing",
      category: "invoice",
      channel: "email",
      title: "Invoice Paid",
      message: "Your invoice #INV-001 has been paid successfully",
      priority: "normal",
      status: "sent",
      sentAt: new Date(),
    });

    await db.insert(eventQueue).values({
      id: `event_${randomUUID()}`,
      eventType: "notification.send",
      eventData: { notificationId: `notif_${randomUUID()}`, userId: userId2 },
      priority: 1,
      attempts: 0,
      maxAttempts: 3,
    });

    // Seed Assets
    console.log("Seeding assets...");
    const assetId = `asset_${randomUUID()}`;
    await db.insert(asset).values({
      assetId: assetId,
      kind: "image",
      status: "ready",
      metadata: { width: 1024, height: 1024, format: "png" },
      currentVersion: "1.0.0",
      storageRef: { bucket: "tamer-assets", key: `assets/${assetId}/1.0.0.png` },
      preview: { url: "https://example.com/preview.png" },
      createdBy: userId2,
    });

    const collectionId = `col_${randomUUID()}`;
    await db.insert(assetCollection).values({
      id: collectionId,
      name: "Marketing Assets",
      description: "Marketing materials and assets",
      visibility: "private",
      createdBy: userId2,
    });

    await db.insert(assetCollectionItem).values({
      id: `aci_${randomUUID()}`,
      collectionId: collectionId,
      assetId: assetId,
    });

    await db.insert(assetTag).values({
      id: `tag_${randomUUID()}`,
      assetId: assetId,
      tag: "marketing",
    });

    await db.insert(assetVersion).values({
      id: `ver_${randomUUID()}`,
      assetId: assetId,
      version: "1.0.0",
      changelog: "Initial version",
      storageRef: { bucket: "tamer-assets", key: `assets/${assetId}/1.0.0.png` },
      createdBy: userId2,
    });

    // Seed Analytics
    console.log("Seeding analytics...");
    await db.insert(productionMetrics).values({
      productionId: `prod_${randomUUID()}`,
      workspaceId: workspaceId,
      status: "completed",
      aiModel: "gpt-4",
      inputTokens: 1500,
      outputTokens: 800,
      costUsd: "0.105",
      executionTimeMs: 2300,
    });

    await db.insert(userActivityMetrics).values({
      userId: userId2,
      workspaceId: workspaceId,
      action: "create_project",
      resourceId: `project_${randomUUID()}`,
      resourceType: "project",
    });

    await db.insert(workspaceMetrics).values({
      workspaceId: workspaceId,
      date: new Date(),
      productionsRun: 10,
      productionsSucceeded: 9,
      productionsFailed: 1,
      mediaGenerated: 5,
      totalCostUsd: "1.50",
      totalTokensUsed: BigInt(15000),
      activeUsers: 3,
    });

    // Seed Audit Log
    console.log("Seeding audit logs...");
    await db.insert(auditLog).values({
      id: `audit_${randomUUID()}`,
      action: "user.login",
      actorId: userId2,
      actorType: "user",
      resourceType: "auth",
      resourceId: userId2,
      metadata: { ipAddress: "192.168.1.1", userAgent: "Mozilla/5.0" },
    });

    console.log("✅ Database seeded successfully!");
    console.log("\nSeeded data:");
    console.log("- 3 users (admin@tamer.studio, user@example.com, demo@example.com)");
    console.log("- 2 roles (Admin, User)");
    console.log("- 3 permissions");
    console.log("- 1 organization (Acme Studio)");
    console.log("- 1 workspace (Default Workspace)");
    console.log("- 2 AI providers (OpenAI, Anthropic)");
    console.log("- 4 AI models");
    console.log("- 3 jobs");
    console.log("- 1 workflow with execution");
    console.log("- 1 billing record with subscription and invoice");
    console.log("- 2 coupons");
    console.log("- 1 voucher");
    console.log("- 1 order with payment");
    console.log("- 1 support ticket");
    console.log("- 1 notification template and notification");
    console.log("- 1 asset collection with asset");
    console.log("- Analytics metrics");
    console.log("- 1 audit log entry");
    console.log("\nYou can now run: pnpm dev");

  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seed();
