import type { NotificationTemplate, RenderedTemplate } from "./template.types";
import { logger } from "@/core/logger";

export class TemplateRenderer {
  async render(
    template: NotificationTemplate,
    variables: Record<string, string>,
    locale?: string
  ): Promise<RenderedTemplate> {
    const missingVariables = template.variables
      .filter((v) => v.required && !(v.name in variables))
      .map((v) => v.name);

    if (missingVariables.length > 0) {
      throw new Error(`Missing required template variables: ${missingVariables.join(", ")}`);
    }

    const mergedVariables: Record<string, string> = {};
    for (const v of template.variables) {
      if (v.name in variables) {
        mergedVariables[v.name] = variables[v.name];
      } else if (v.defaultValue !== undefined) {
        mergedVariables[v.name] = v.defaultValue;
      }
    }

    const body = this.replacePlaceholders(template.body, mergedVariables);
    const subject = template.subject ? this.replacePlaceholders(template.subject, mergedVariables) : undefined;

    logger.info("Template rendered", {
      templateId: template.id,
      locale: locale ?? template.locale,
      variableCount: Object.keys(mergedVariables).length,
    });

    return {
      subject,
      body,
      locale: locale ?? template.locale,
    };
  }

  private replacePlaceholders(text: string, variables: Record<string, string>): string {
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      if (key in variables) {
        return variables[key];
      }
      return match;
    });
  }
}
