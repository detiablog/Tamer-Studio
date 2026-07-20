import type { GatewayConfiguration, GatewayDefinition, GatewayPolicy } from "./types";

export interface GatewayConfigurationLoader {
  loadConfiguration(): Promise<GatewayConfiguration>;
  loadGateways(): Promise<GatewayDefinition[]>;
  loadPolicies(): Promise<GatewayPolicy[]>;
  saveConfiguration(configuration: GatewayConfiguration): Promise<void>;
}

export class InMemoryGatewayConfiguration implements GatewayConfigurationLoader {
  private configuration: GatewayConfiguration;

  constructor(initialConfiguration: GatewayConfiguration) {
    this.configuration = initialConfiguration;
  }

  async loadConfiguration(): Promise<GatewayConfiguration> {
    return this.configuration;
  }

  async loadGateways(): Promise<GatewayDefinition[]> {
    return this.configuration.gateways;
  }

  async loadPolicies(): Promise<GatewayPolicy[]> {
    return this.configuration.policies;
  }

  async saveConfiguration(configuration: GatewayConfiguration): Promise<void> {
    this.configuration = configuration;
  }
}
