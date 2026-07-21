import type { WorkflowPlugin } from "../types";
import type { PluginManifest } from "./plugin-manifest";

export interface PluginLoader {
  load(manifest: PluginManifest, module: unknown): Promise<WorkflowPlugin>;
  unload(pluginId: string): Promise<void>;
}

export class DefaultPluginLoader implements PluginLoader {
  async load(manifest: PluginManifest, _module: unknown): Promise<WorkflowPlugin> {
    throw new Error("Plugin loading from module not yet implemented");
  }

  async unload(_pluginId: string): Promise<void> {
    throw new Error("Plugin unloading not yet implemented");
  }
}
