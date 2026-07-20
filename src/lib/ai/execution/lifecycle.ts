export type ExecutionLifecycleEvent =
  | "validate_request"
  | "resolve_capability"
  | "resolve_workflow"
  | "resolve_gateway"
  | "build_payload"
  | "execute"
  | "normalize_result"
  | "store_asset"
  | "save_history"
  | "track_usage"
  | "return_response";

export interface ExecutionLifecycleListener {
  onEvent(event: ExecutionLifecycleEvent, data: Record<string, unknown>): void | Promise<void>;
}
