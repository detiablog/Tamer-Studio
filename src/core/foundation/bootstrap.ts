import { lifecycle } from "./lifecycle";
import { initializeServices } from "./registry";

export async function bootstrap(): Promise<void> {
  await lifecycle.transition("bootstrap");

  initializeServices();

  await lifecycle.transition("configure");
  await lifecycle.transition("initialize");
  await lifecycle.transition("ready");
}

export function shutdown(): void {
  lifecycle.transition("shutdown");
}
