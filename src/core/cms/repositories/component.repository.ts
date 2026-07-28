import type { CMSComponent } from "../cms.types";

export interface CMSComponentRepository {
  createComponent(component: CMSComponent): Promise<CMSComponent>;
  getComponent(id: string): Promise<CMSComponent | undefined>;
  getComponentByType(type: string): Promise<CMSComponent | undefined>;
  listComponents(): Promise<CMSComponent[]>;
  updateComponent(id: string, updates: Partial<CMSComponent>): Promise<CMSComponent | undefined>;
  deleteComponent(id: string): Promise<void>;
}
