# EMAIL-02: Template System Architecture

## Overview

The template system provides a flexible email template management system with visual building, HTML editing, variable validation, and preview capabilities.

## Template System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Template System                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   Visual    │  │    HTML     │  │   Preview   │     │
│  │   Builder   │  │   Editor    │  │   Engine    │     │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘     │
│         │                │                │             │
│         ▼                ▼                ▼             │
│  ┌─────────────────────────────────────────────────┐   │
│  │              Template Renderer                   │   │
│  │  - Variable substitution                         │   │
│  │  - Conditional blocks                            │   │
│  │  - Responsive CSS injection                      │   │
│  └─────────────────────────────────────────────────┘   │
│         │                                               │
│         ▼                                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │              Variable Validator                  │   │
│  │  - Schema validation                             │   │
│  │  - Unknown variable detection                    │   │
│  │  - Type checking                                 │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## System Templates

| Template | Type | Variables | Description |
|----------|------|-----------|-------------|
| Welcome Email | `welcome` | `name`, `email`, `dashboardUrl` | Sent after account creation |
| Email Verification | `verification` | `name`, `verificationUrl`, `tokenExpiry` | Email verification link |
| Password Reset | `reset_password` | `name`, `resetUrl`, `tokenExpiry` | Password reset link |
| Payment Success | `payment_success` | `name`, `amount`, `invoiceUrl`, `dashboardUrl` | Payment confirmation |
| Subscription Activated | `subscription_activated` | `name`, `plan`, `startDate`, `endDate` | Subscription start |
| Subscription Expired | `subscription_expired` | `name`, `endDate` | Subscription expiry notice |
| Affiliate Rejected | `affiliate_rejected` | `name`, `reason` | Affiliate application rejection |
| Contact Form Reply | `support_reply` | `name`, `message`, `ticketId` | Support ticket response |
| Announcement | `announcement` | `name`, `title`, `content` | Platform announcements |

## Variable Validation

### Variable Syntax
Variables use double curly brace syntax: `{{variable_name}}`

### Validation Rules
1. **Syntax Check**: Must match `{{[a-zA-Z_][a-zA-Z0-9_]*}}` pattern
2. **Schema Validation**: Variables must be defined in template schema
3. **Type Checking**: Variable values must match expected types
4. **Required Check**: Required variables must not be empty

### Variable Types
- `string` - Plain text (auto-escaped)
- `html` - Raw HTML content
- `url` - URL-encoded values
- `date` - Date formatting
- `number` - Numeric formatting
- `boolean` - Conditional rendering

### Example Schema
```json
{
  "variables": [
    { "name": "name", "type": "string", "required": true, "description": "User's full name" },
    { "name": "email", "type": "string", "required": true, "description": "User's email address" },
    { "name": "dashboardUrl", "type": "url", "required": true, "description": "Link to dashboard" },
    { "name": "unsubscribeUrl", "type": "url", "required": false, "description": "Unsubscribe link" }
  ]
}
```

## Builder Blocks

### Block Types

| Block | Description | Properties |
|-------|-------------|------------|
| `header` | Header block with logo and navigation | Logo URL, nav links, background color |
| `banner` | Hero banner with image and CTA | Image URL, headline, button text/url |
| `text` | Rich text content block | HTML content, font size, alignment |
| `image` | Image block with alt text | Image URL, alt text, width, link |
| `button` | Call-to-action button | Text, URL, color, border radius |
| `divider` | Horizontal separator | Color, thickness, padding |
| `columns` | Multi-column layout | Column count, content per column |
| `footer` | Footer with links and unsubscribe | Links, copyright, social icons |
| `social` | Social media links | Platform URLs, icon style |

### Block Properties

```typescript
interface Block {
  id: string;
  type: 'header' | 'banner' | 'text' | 'image' | 'button' | 'divider' | 'columns' | 'footer' | 'social';
  properties: {
    backgroundColor?: string;
    padding?: string;
    alignment?: 'left' | 'center' | 'right';
    fontSize?: string;
    borderRadius?: string;
    // Type-specific properties...
  };
  content?: string;
  children?: Block[];
}
```

## HTML Editor Features

### Syntax Highlighting
- HTML tag highlighting
- Attribute highlighting
- Variable highlighting ({{...}})
- Comment highlighting

### Auto-Completion
- HTML tag completion
- Attribute completion
- Variable name completion
- CSS property completion

### Validation
- Real-time HTML validation
- Variable validation overlay
- Responsive preview
- Email client compatibility check

### Editor Modes
1. **Code View**: Raw HTML editing with syntax highlighting
2. **Preview Mode**: Live preview with responsive breakpoints
3. **Split View**: Side-by-side code and preview
4. **Visual Editor**: Drag-and-drop block builder

## Template Versioning

### Version Control
- Automatic version increment on save
- Version history with diff view
- Rollback to any previous version
- Version metadata (author, timestamp, changes)

### Version Schema
```typescript
interface TemplateVersion {
  id: string;
  templateId: string;
  version: number;
  htmlBody: string;
  variables: Variable[];
  createdBy: string;
  createdAt: Date;
  changeDescription?: string;
}
```

## Responsive Preview

### Breakpoints
- **Desktop**: 1200px+
- **Tablet**: 768px - 1199px
- **Mobile**: 320px - 767px

### Preview Features
- Real-time responsive preview
- Dark mode toggle
- Email client simulation
- Text-only preview
- Attachment preview

## Template Import/Export

### Export Format
```json
{
  "template": {
    "name": "Welcome Email",
    "type": "welcome",
    "htmlBody": "<html>...</html>",
    "variables": [...],
    "version": 1
  }
}
```

### Import Validation
1. Schema validation
2. Variable compatibility check
3. HTML sanitization
4. Version conflict detection

## Localization Keys

All template UI strings use the `email.*` namespace:

### Builder Keys
- `email.builder` - "Email Builder"
- `email.builderDescription` - "Visual drag-and-drop email builder"
- `email.visualEditor` - "Visual Editor"
- `email.htmlEditor` - "HTML Editor"
- `email.codeView` - "Code View"
- `email.previewMode` - "Preview Mode"
- `email.splitView` - "Split View"

### Block Keys
- `email.blockHeader` - "Header Block"
- `email.blockBanner` - "Banner Block"
- `email.blockText` - "Text Block"
- `email.blockImage` - "Image Block"
- `email.blockButton` - "Button Block"
- `email.blockDivider` - "Divider Block"
- `email.blockColumns` - "Columns Block"
- `email.blockFooter` - "Footer Block"
- `email.blockSocial` - "Social Links"

### Template Management Keys
- `email.duplicateTemplate` - "Duplicate Template"
- `email.deleteTemplate` - "Delete Template"
- `email.systemTemplate` - "System Template"
- `email.customTemplate` - "Custom Template"
- `email.templateVersion` - "Version"
- `email.templateLanguage` - "Language"
- `email.templateDescription` - "Description"

### Variable Keys
- `email.insertVariable` - "Insert Variable"
- `email.variables` - "Variables"
- `email.unknownVariable` - "Unknown variable detected"
- `email.validVariables` - "Valid Variables"
- `email.invalidVariables` - "Invalid Variables"
- `email.templateValidation` - "Template Validation"
