import type { NotificationTemplate, TemplateCategory, TemplateChannel } from '@/core/templates/template.types';

export function createTemplateFixture(overrides?: Partial<NotificationTemplate>): NotificationTemplate {
  return {
    id: 'template_001',
    name: 'Test Template',
    category: 'system' as TemplateCategory,
    channel: 'email' as TemplateChannel,
    body: 'Hello {{name}}',
    variables: [],
    locale: 'en',
    version: 1,
    isActive: true,
    createdAt: new Date('2025-01-01T00:00:00.000Z'),
    updatedAt: new Date('2025-01-01T00:00:00.000Z'),
    ...overrides,
  };
}
