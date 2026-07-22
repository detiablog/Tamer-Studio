import type { WorkflowPlugin, PluginSystem, WorkflowNodeRegistry } from "../types";
import type { PluginManifest } from "./plugin-manifest";

export class DefaultPluginSystem implements PluginSystem {
  private plugins: Map<string, WorkflowPlugin> = new Map();
  private nodeRegistry: WorkflowNodeRegistry;

  constructor(nodeRegistry: WorkflowNodeRegistry) {
    this.nodeRegistry = nodeRegistry;
  }

  register(plugin: WorkflowPlugin): void {
    if (this.plugins.has(plugin.manifest.id)) {
      throw new Error(`Plugin ${plugin.manifest.id} is already registered`);
    }
    plugin.initialize(this);
    plugin.registerNodes(this.nodeRegistry);
    this.plugins.set(plugin.manifest.id, plugin);
  }

  unregister(pluginId: string): void {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return;
    plugin.teardown();
    this.plugins.delete(pluginId);
  }

  async loadPlugin(_manifest: PluginManifest, _module: unknown): Promise<WorkflowPlugin> {
    throw new Error("Plugin loading from module not yet implemented");
  }

  getPlugins(): WorkflowPlugin[] {
    return Array.from(this.plugins.values());
  }

  getNodeRegistry(): WorkflowNodeRegistry {
    return this.nodeRegistry;
  }
}
