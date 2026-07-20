export type GatewayId = string;

export interface GatewayDefinition {
  id: GatewayId;
  name: string;
  description: string;
  supportedCapabilities: string[];
  status: "active" | "inactive" | "error";
}
