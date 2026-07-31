export { createSmtpTransport, testSmtpConnection, sendEmail } from "./smtp";
export type { SmtpTransportConfig, SmtpTestResult } from "./smtp";

export { getTransportForProvider, getActiveSmtpTransport, loadSmtpConfigFromDb } from "./transport";

export {
  getTemplates,
  getTemplateByKey,
  getTemplatesByType,
  renderTemplate,
  previewTemplate,
  getSampleVariables,
} from "./templates";
export type { EmailTemplateDef, TemplateType } from "./templates";

export { createQueueItem, processQueueItem, retryFailedItem, getQueueStats } from "./queue";
export type { QueueItemInput } from "./queue";

export { createEmailLog, updateEmailLog, getEmailLogs } from "./logs";
export type { LogEntryInput, LogFilters } from "./logs";
