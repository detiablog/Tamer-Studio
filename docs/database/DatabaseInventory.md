# Database Inventory

**Date:** 2026-07-29  
**Sprint:** DB-01  
**Database:** PostgreSQL — tamer_studio  

---

## Summary

| Metric | Value |
|--------|-------|
| Total Tables | 106 |
| Primary Keys | 106 |
| Foreign Keys | 74 |
| Unique Constraints | 21 |
| Indexes | 463 |
| Sequences | 3 |

---

## Tables by Domain

### Auth (Better Auth)
| Table | Columns | PK | FKs | Indexes |
|-------|---------|----|-----|---------|
| user | 14 | id | — | 2 (email unique, pkey) |
| session | 8 | id | session.user_id → user.id (CASCADE) | 3 (token unique, userId, pkey) |
| account | 7 | id | account.user_id → user.id (CASCADE) | 2 (userId, pkey) |
| verification | 6 | id | — | 2 (identifier, pkey) |

### Admin Auth
| Table | Columns | PK | FKs | Indexes |
|-------|---------|----|-----|---------|
| admin | 12 | id | — | 4 (email unique, role, pkey) |
| admin_session | 9 | id | admin_session.admin_id → admin.id (CASCADE) | 5 (token unique, adminId, pkey) |

### Identity & RBAC
| Table | Columns | PK | FKs |
|-------|---------|----|-----|
| user_profile | 14 | user_id | — |
| user_preferences | 5 | user_id | user_preferences.user_id → user.id (CASCADE) |
| role | 9 | id | — |
| permission | 6 | id | — |
| role_permission | 4 | id | role_permission.role_id → role.id (CASCADE), permission_id → permission.id (CASCADE) |
| organization | 9 | id | — |
| organization_member | 8 | id | organization_id → organization.id (CASCADE), user_id → user.id (CASCADE) |
| workspace | 14 | id | workspace.owner_id → user.id (NO ACTION), organization_id → organization.id (NO ACTION) |
| workspace_member | 10 | id | workspace_id → workspace.id (CASCADE), user_id → user.id (CASCADE) |
| invitation | 12 | id | invited_by → user.id (NO ACTION) |
| api_key | 15 | id | workspace_id → workspace.id (CASCADE), user_id → user.id (CASCADE) |
| external_identity | 7 | id | user_id → user.id (CASCADE) |
| workspace_transfer | 5 | id | workspace_id → workspace.id (CASCADE), from_owner_id → user.id (NO ACTION), to_owner_id → user.id (NO ACTION) |

### CMS
| Table | Columns | PK | FKs |
|-------|---------|----|-----|
| cms_page | 24 | id | — |
| cms_section | 15 | id | page_id → cms_page.id (CASCADE) |
| cms_block | 8 | id | section_id → cms_section.id (CASCADE) |
| cms_component | 8 | id | — |
| cms_media | 9 | id | — |
| cms_version | 8 | id | — |
| cms_publish_pipeline | 6 | id | — |
| cms_publish_step | 7 | id | pipeline_id → cms_publish_pipeline.id (CASCADE) |
| cms_audit_entry | 7 | id | — |

### Landing Builder
| Table | Columns | PK | FKs |
|-------|---------|----|-----|
| landing_section | 14 | id | — |
| landing_media | 7 | id | section_key → landing_section.section_key (CASCADE) |

### Localization
| Table | Columns | PK | FKs |
|-------|---------|----|-----|
| localization_profile | 16 | id | — |
| region | 9 | id | profile_code → localization_profile.code (RESTRICT) |
| pricing_profile | 9 | id | — |
| pricing_rule | 11 | id | profile_id → pricing_profile.id (CASCADE) |
| payment_profile | 8 | id | — |
| payment_method | 9 | id | profile_id → payment_profile.id (CASCADE) |
| currency_profile | 12 | id | — |

### Commerce
| Table | Columns | PK | FKs |
|-------|---------|----|-----|
| order | 18 | id | — |
| checkout_session | 15 | id | order_id → order.id (CASCADE) |
| payment_intent | 15 | id | order_id → order.id (CASCADE), checkout_session_id → checkout_session.id (CASCADE) |
| payment_attempt | 14 | id | payment_intent_id → payment_intent.id (CASCADE) |
| voucher | 16 | id | — |
| voucher_usage | 9 | id | voucher_id → voucher.id (CASCADE) |
| coupon | 16 | id | — |
| coupon_usage | 10 | id | coupon_id → coupon.id (CASCADE) |
| tax_rule | 13 | id | — |
| refund | 14 | id | order_id → order.id (CASCADE) |

### Commerce Plans
| Table | Columns | PK | FKs |
|-------|---------|----|-----|
| plan | 15 | id | — |
| billing_option | 9 | id | — |
| plan_pricing | 10 | id | plan_id → plan.id (CASCADE), billing_option_id → billing_option.id (CASCADE) |
| commerce_order | 19 | id | — |

### AI
| Table | Columns | PK | FKs |
|-------|---------|----|-----|
| ai_provider | 14 | id | — |
| ai_provider_model | 11 | id | provider_id → ai_provider.id (CASCADE) |

### Analytics
| Table | Columns | PK | FKs |
|-------|---------|----|-----|
| production_metrics | 11 | id (serial) | — |
| user_activity_metrics | 8 | id (serial) | — |
| workspace_metrics | 11 | id (serial) | — |

### Billing
| Table | Columns | PK | FKs |
|-------|---------|----|-----|
| wallet | 11 | id | — |
| credit_transaction | 10 | id | wallet_id → wallet.id (CASCADE) |
| credit_reservation | 9 | id | wallet_id → wallet.id (CASCADE) |
| usage_record | 19 | id | — |
| cost_record | 13 | id | — |
| subscription | 12 | id | — |
| invoice | 13 | id | subscription_id → subscription.id (NO ACTION) |
| billing | 11 | id | — |
| subscription_history | 8 | id | subscription_id → subscription.id (CASCADE) |

### Email
| Table | Columns | PK | FKs |
|-------|---------|----|-----|
| email_provider | 19 | id | — |
| email_provider_health | 10 | id | provider_id → email_provider.id (CASCADE) |
| email_queue | 25 | id | provider_id → email_provider.id (NO ACTION) |
| email_log | 18 | id | queue_id → email_queue.id (SET NULL), provider_id → email_provider.id (NO ACTION) |
| email_token | 10 | id | — |
| email_template | 13 | id | — |
| email_statistics | 11 | id | provider_id → email_provider.id (CASCADE) |

### Jobs & Queues
| Table | Columns | PK | FKs |
|-------|---------|----|-----|
| job | 16 | id | — |
| queue | 11 | id | — |

### Notifications
| Table | Columns | PK | FKs |
|-------|---------|----|-----|
| notification_template | 15 | id | — |
| notification_template_version | 7 | id | template_id → notification_template.id (CASCADE) |
| notification_preference | 8 | id | user_id → user.id (CASCADE) |
| notification | 18 | id | user_id → user.id (CASCADE) |
| event_queue | 14 | id | — |

### Feature Flags
| Table | Columns | PK | FKs |
|-------|---------|----|-----|
| feature_flag | 12 | id | — |
| feature_flag_history | 8 | id | flag_id → feature_flag.id (CASCADE) |

### Assets
| Table | Columns | PK | FKs |
|-------|---------|----|-----|
| asset | 20 | asset_id | — |
| asset_version | 9 | id | asset_id → asset.asset_id (CASCADE) |
| asset_lineage | 7 | id | asset_id → asset.asset_id (CASCADE), parent_id → asset.asset_id (CASCADE) |
| asset_collection | 8 | id | — |
| asset_collection_item | 5 | id | collection_id → asset_collection.id (CASCADE), asset_id → asset.asset_id (CASCADE) |
| asset_tag | 5 | id | asset_id → asset.asset_id (CASCADE) |
| asset_lifecycle_event | 8 | id | asset_id → asset.asset_id (CASCADE) |

### Audit
| Table | Columns | PK | FKs |
|-------|---------|----|-----|
| audit_log | 11 | id | — |
| failed_login_attempt | 7 | id | — |

### Support
| Table | Columns | PK | FKs |
|-------|---------|----|-----|
| support_ticket | 14 | id | user_id → user.id (CASCADE), assigned_to → user.id (SET NULL) |
| support_ticket_comment | 8 | id | ticket_id → support_ticket.id (CASCADE), user_id → user.id (CASCADE) |
| support_knowledge_category | 6 | id | parent_id → support_knowledge_category.id (CASCADE) |
| support_knowledge_article | 12 | id | category_id → support_knowledge_category.id (CASCADE) |
| support_feedback | 8 | id | user_id → user.id (CASCADE), ticket_id → support_ticket.id (SET NULL) |
| support_customer_timeline | 7 | id | user_id → user.id (CASCADE) |
| support_sla_policy | 9 | id | — |
| support_sla_violation | 6 | id | ticket_id → support_ticket.id (CASCADE), policy_id → support_sla_policy.id (CASCADE) |
| support_attachment | 9 | id | ticket_id → support_ticket.id (CASCADE), uploaded_by → user.id (CASCADE) |
| support_internal_note | 7 | id | ticket_id → support_ticket.id (CASCADE), created_by → user.id (CASCADE) |

### Workflows
| Table | Columns | PK | FKs |
|-------|---------|----|-----|
| workflow | 13 | id | — |
| workflow_execution | 11 | id | workflow_id → workflow.id (CASCADE) |

### Legacy
| Table | Columns | PK | FKs |
|-------|---------|----|-----|
| api_key_usage | 7 | id | api_key_id → api_key.id (CASCADE) |
| system_settings | 8 | id | — |
| webhook_log | 13 | id | — |
| user_media | 10 | id | — |

### Sequences
| Sequence | Used By |
|----------|---------|
| production_metrics_id_seq | production_metrics.id |
| user_activity_metrics_id_seq | user_activity_metrics.id |
| workspace_metrics_id_seq | workspace_metrics.id |
