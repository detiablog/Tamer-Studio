# Database Migration Standard

## Before Implementation
- Audit existing schema
- Audit Drizzle models
- Audit API
- Audit validation
- Audit UI

## Migration Rules
- Never rewrite executed migrations
- Never drop production tables
- Never delete data automatically
- Create reversible migrations
- Update ORM, DTO, Types, API after migration

## Suggested Table

user_preferences
- id
- userId
- language
- currency
- timezone
- dateFormat
- numberFormat
- theme
- createdAt
- updatedAt
