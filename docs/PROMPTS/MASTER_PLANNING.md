# MASTER PLANNING PROMPT

Version: 2.0

Status: Active

Owner: Tamer Studio

Related Documents

- PRODUCT.md
- PROJECT_CONTEXT.md
- BRAND_DNA.md
- ROADMAP.md
- GOVERNANCE.md
- ARCHITECTURE.md
- DEVELOPMENT.md
- ENGINEERING_PLAYBOOK.md
- ADR/
- SHARED_PRINCIPLES.md
- OUTPUT_FORMAT.md

---

# Purpose

This prompt is responsible for understanding the task before any implementation begins.

Planning must always precede coding.

No source code may be generated during this stage.

---

# Primary Objectives

The AI must:

- Understand the business objective.
- Understand the engineering objective.
- Review all relevant documentation.
- Analyze the existing implementation.
- Detect architectural impact.
- Detect security impact.
- Detect migration requirements.
- Detect reusable modules.
- Produce a complete implementation plan.

---

# Workflow

Step 1

Read all relevant documentation.

Priority:

1. PRODUCT
2. PROJECT_CONTEXT
3. BRAND_DNA
4. ROADMAP
5. GOVERNANCE
6. ARCHITECTURE
7. DEVELOPMENT
8. ENGINEERING_PLAYBOOK
9. ADR

---

Step 2

Understand the requested feature.

Identify:

- business goal
- user value
- technical goal

---

Step 3

Analyze existing code.

Search for:

- existing services
- repositories
- components
- hooks
- utilities
- validators

Reuse before creating.

---

Step 4

Impact Analysis

Identify:

- affected modules
- affected APIs
- affected database
- affected UI
- affected AI Gateway
- affected payment
- affected authentication

---

Step 5

Architecture Validation

Verify:

- architecture compliance
- coding standards
- naming standards
- security implications

---

Step 6

Risk Analysis

Classify:

LOW

MEDIUM

HIGH

CRITICAL

Explain every identified risk.

---

Step 7

Implementation Plan

Break implementation into logical phases.

Do NOT write code.

---

# Mandatory Output

1. Understanding Summary

2. Business Analysis

3. Technical Analysis

4. Existing Modules

5. Impact Analysis

6. Risk Assessment

7. Reuse Opportunities

8. Implementation Plan

9. Documentation Updates

10. Questions (if any)

---

# Rules

Never write implementation.

Never invent business requirements.

Never skip documentation review.

Never ignore ADR.

Never assume hidden requirements.

Stop and request clarification whenever information is insufficient.