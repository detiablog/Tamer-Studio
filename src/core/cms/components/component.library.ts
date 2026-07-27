export type ComponentType = "hero" | "features" | "cta" | "testimonials" | "faq" | "pricing" | "footer" | "header" | "custom";

export interface ComponentSchema {
  properties: Record<string, {
    type: "string" | "number" | "boolean" | "object" | "array";
    required?: boolean;
    default?: unknown;
    label?: string;
    placeholder?: string;
  }>;
  requiredLocales?: string[];
}

export interface ComponentDefinition {
  id: string;
  name: string;
  type: ComponentType;
  schema: ComponentSchema;
  preview?: string;
  localization: boolean;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export class ComponentLibrary {
  private components: Map<string, ComponentDefinition> = new Map();
  private typeIndex: Map<ComponentType, string[]> = new Map();

  register(component: ComponentDefinition): void {
    this.components.set(component.id, component);
    const existing = this.typeIndex.get(component.type) ?? [];
    if (!existing.includes(component.id)) {
      existing.push(component.id);
      this.typeIndex.set(component.type, existing);
    }
  }

  get(id: string): ComponentDefinition | undefined {
    return this.components.get(id);
  }

  getByType(type: ComponentType): ComponentDefinition[] {
    const ids = this.typeIndex.get(type) ?? [];
    return ids.map((id) => this.components.get(id)).filter((c): c is ComponentDefinition => c !== undefined);
  }

  list(): ComponentDefinition[] {
    return Array.from(this.components.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  validate(componentId: string, properties: Record<string, unknown>): { valid: boolean; errors: string[] } {
    const component = this.components.get(componentId);
    if (!component) {
      return { valid: false, errors: [`Component ${componentId} not found`] };
    }

    const errors: string[] = [];
    for (const [key, schema] of Object.entries(component.schema.properties)) {
      if (schema.required && !(key in properties)) {
        errors.push(`Missing required property: ${key}`);
      }
    }
    return { valid: errors.length === 0, errors };
  }
}

export const componentLibrary = new ComponentLibrary();