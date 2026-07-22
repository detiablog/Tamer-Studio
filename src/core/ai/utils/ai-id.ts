export function generateExecutionId(): string {
  return `exec_${crypto.randomUUID()}`;
}

export function generateRequestId(): string {
  return `req_${crypto.randomUUID()}`;
}

export function generateProviderId(): string {
  return `prov_${crypto.randomUUID()}`;
}
