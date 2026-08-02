# Documentation Policy

Generated: 2026-08-02
Status: Permanent project rules
Enforcement: All documentation changes must comply

---

## Core Principles

### 1. Source Code is the Single Source of Truth

- Source code is always authoritative
- Documentation exists only to explain the implementation
- Never modify source code to match outdated documentation
- If documentation conflicts with source code, documentation is wrong

### 2. Read Before Modify

Never move, merge, archive, or delete documentation before reading:
- Source code
- Folder structure
- Related module
- Related database schema
- Related API
- Related services

### 3. Update Before Create

- Always update existing documentation before creating new documentation
- Never duplicate documentation
- If coverage is insufficient, expand existing docs

### 4. Preserve Project History

- Never permanently delete documentation
- Archive obsolete documentation to `docs/archive/`
- Archived docs retain historical value

---

## Location Rules

### Rule 1: Documentation Only Lives in /docs

- All documentation files must reside within `docs/`
- Never create Markdown files in the project root
- Never create Markdown files in `src/`
- The only exception is `README.md` at project root (project overview)

### Rule 2: No Markdown in Root

- Root-level Markdown files are forbidden
- All existing root `.md` files must be moved into `docs/`
- New documentation must be created in the appropriate `docs/` subdirectory

### Rule 3: Module Documentation Stays Together

- Each module has exactly ONE documentation home: `docs/modules/{module-name}/`
- All reports, guides, and specs for a module live in that directory
- Never scatter module documentation across multiple directories

### Rule 4: Sprint Documentation is Temporary

- Sprint docs live in `docs/sprint/{sprint-id}/`
- After sprint completion, move to `docs/archive/sprint-reports/`
- Never keep active sprint docs beyond 2 sprints

---

## Naming Rules

### File Naming

- Use `lowercase-kebab-case` for all filenames
- Examples: `architecture.md`, `api-report.md`, `live-verification.md`
- Never use spaces, underscores, or CamelCase

### Directory Naming

- Use `lowercase-kebab-case` for all directory names
- Exception: `adr/` (standard abbreviation)
- Module directories match source code module names

### File Extensions

- Use `.md` for all documentation files
- Never use `.txt` for documentation
- Never use `.doc` or `.docx`

---

## Structure Rules

### One Module = One Documentation Home

```
docs/modules/{module-name}/
├── README.md              # Module overview (required)
├── architecture.md        # Architecture (if complex)
├── api-report.md          # API documentation
├── database.md            # Database schema documentation
├── live-report.md         # Live verification report
└── ...                    # Additional docs as needed
```

### Sprint Documentation Format

```
docs/sprint/{sprint-id}/
├── README.md              # Sprint overview
├── testing.md             # Test results
├── final-report.md        # Completion report
└── ...                    # Additional sprint docs
```

### Architecture Decision Records

```
docs/adr/
├── ADR-{number}-{title}.md
└── README.md              # ADR index
```

---

## Ownership Rules

| Area | Owner | Responsibility |
|------|-------|---------------|
| Module docs | Module Owner | Accuracy and completeness |
| Architecture | Lead Architect | Architecture accuracy |
| Standards | Engineering Lead | Coding standard accuracy |
| ADRs | Architecture Team | Decision documentation |
| Sprint docs | Sprint Lead | Sprint planning/reporting |
| Audit reports | Documentation Team | Audit execution |
| Archive | Documentation Team | Obsolete doc management |
| Policy | Documentation Team | Policy maintenance |

---

## Maintenance Rules

### On Module Change
1. Update module documentation within 1 sprint
2. Update `docs/modules/{module}/README.md`
3. Update cross-references if module interface changed

### On Architecture Change
1. Update architecture documentation
2. Create ADR for significant decisions
3. Update affected module documentation

### On Release
1. Update release notes in `docs/release/`
2. Update changelog
3. Archive completed sprint docs

### On Sprint Close
1. Move sprint docs to `docs/archive/sprint-reports/`
2. Update `docs/REPORTS/` with final results
3. Update module docs with any new findings

---

## Quality Rules

### Documentation Must Be:
- **Accurate**: Reflects current implementation
- **Complete**: Covers all significant aspects
- **Current**: Updated within 1 sprint of code changes
- **Consistent**: Follows naming and structure conventions
- **Connected**: Cross-references where relevant

### Documentation Must Not Be:
- **Duplicated**: Same content in multiple places
- **Scattered**: Module docs spread across directories
- **Orphaned**: No cross-references or index entries
- **Stale**: Outdated by more than 2 sprints

---

## Review Rules

### All documentation changes require:
1. Code review (same as code changes)
2. Accuracy check against source code
3. Naming convention compliance check
4. Cross-reference update verification

### Review Checklist:
- [ ] File is in correct directory
- [ ] Filename follows kebab-case convention
- [ ] Content matches current source code
- [ ] Cross-references are updated
- [ ] Index entries are updated
- [ ] No duplication with existing docs

---

## Enforcement

### Automated Checks (recommended)
- Lint all `.md` files for naming conventions
- Check for orphaned documentation (no cross-references)
- Verify module documentation completeness
- Detect duplicate content

### Manual Checks
- Quarterly documentation audit
- Sprint close documentation review
- Release documentation verification
- Architecture change documentation review

---

## Exceptions

### Project Root README.md
- The only Markdown file allowed in project root
- Must contain project overview, setup instructions, and links to `docs/`

### Configuration Files
- `.env.example` is not documentation (it's configuration)
- `package.json` is not documentation (it's configuration)
- These files are exempt from documentation rules

### Auto-generated Files
- `next-env.d.ts` is auto-generated (not documentation)
- `tsconfig.tsbuildinfo` is auto-generated (not documentation)
- These files are exempt from documentation rules
