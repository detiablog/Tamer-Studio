import type {
  NavigationItem,
  NavigationMenu,
  NavigationGroup,
  RegisterNavigationInput,
} from "./navigation.types";

export class MenuManagement {
  private menus: Map<string, NavigationMenu> = new Map();
  private items: Map<string, NavigationItem> = new Map();
  private groups: Map<string, NavigationGroup> = new Map();

  createMenu(input: {
    id: string;
    name: string;
    nameKey?: string;
    position: NavigationMenu["position"];
    order?: number;
    visible?: boolean;
    permissions?: string[];
    featureFlags?: string[];
    workspaces?: string[];
    organizations?: string[];
    localization?: {
      namespace?: string;
      fallbackLocale?: string;
    };
    metadata?: Record<string, unknown>;
  }): NavigationMenu {
    const now = new Date().toISOString();
    const menu: NavigationMenu = {
      id: input.id,
      name: input.name,
      nameKey: input.nameKey,
      position: input.position,
      items: [],
      groups: [],
      order: input.order ?? 0,
      visible: input.visible ?? true,
      localization: {
        namespace: input.localization?.namespace ?? "navigation",
        fallbackLocale: input.localization?.fallbackLocale ?? "en",
      },
      permissions: input.permissions ?? [],
      featureFlags: input.featureFlags ?? [],
      workspaces: input.workspaces ?? [],
      organizations: input.organizations ?? [],
      metadata: input.metadata ?? {},
      createdAt: now,
      updatedAt: now,
    };
    this.menus.set(menu.id, menu);
    return menu;
  }

  getMenu(id: string): NavigationMenu | undefined {
    return this.menus.get(id);
  }

  getAllMenus(): NavigationMenu[] {
    return Array.from(this.menus.values()).sort((a, b) => a.order - b.order);
  }

  getMenusByPosition(position: NavigationMenu["position"]): NavigationMenu[] {
    return Array.from(this.menus.values())
      .filter((m) => m.position === position)
      .sort((a, b) => a.order - b.order);
  }

  addItemToMenu(menuId: string, item: NavigationItem): NavigationMenu | null {
    const menu = this.menus.get(menuId);
    if (!menu) return null;
    menu.items.push(item);
    menu.items.sort((a, b) => a.order - b.order);
    menu.updatedAt = new Date().toISOString();
    this.items.set(item.id, item);
    return menu;
  }

  removeItemFromMenu(menuId: string, itemId: string): boolean {
    const menu = this.menus.get(menuId);
    if (!menu) return false;
    const initialLength = menu.items.length;
    menu.items = menu.items.filter((i) => i.id !== itemId);
    if (menu.items.length === initialLength) return false;
    menu.updatedAt = new Date().toISOString();
    return true;
  }

  updateMenuItem(menuId: string, itemId: string, updates: Partial<NavigationItem>): NavigationItem | null {
    const menu = this.menus.get(menuId);
    if (!menu) return null;
    const index = menu.items.findIndex((i) => i.id === itemId);
    if (index === -1) return null;
    const updated = { ...menu.items[index], ...updates };
    menu.items[index] = updated;
    menu.updatedAt = new Date().toISOString();
    this.items.set(itemId, updated);
    return updated;
  }

  createGroup(input: {
    id: string;
    menuId: string;
    name: string;
    nameKey?: string;
    order?: number;
    visible?: boolean;
    permissions?: string[];
    featureFlags?: string[];
    metadata?: Record<string, unknown>;
  }): NavigationGroup {
    const now = new Date().toISOString();
    const group: NavigationGroup = {
      id: input.id,
      menuId: input.menuId,
      name: input.name,
      nameKey: input.nameKey,
      items: [],
      order: input.order ?? 0,
      visible: input.visible ?? true,
      permissions: input.permissions ?? [],
      featureFlags: input.featureFlags ?? [],
      metadata: input.metadata ?? {},
      createdAt: now,
      updatedAt: now,
    };
    this.groups.set(group.id, group);
    const menu = this.menus.get(input.menuId);
    if (menu) {
      menu.groups.push(group);
      menu.updatedAt = now;
    }
    return group;
  }

  getGroup(id: string): NavigationGroup | undefined {
    return this.groups.get(id);
  }

  addItemToGroup(groupId: string, item: NavigationItem): NavigationGroup | null {
    const group = this.groups.get(groupId);
    if (!group) return null;
    group.items.push(item);
    group.items.sort((a, b) => a.order - b.order);
    group.updatedAt = new Date().toISOString();
    this.items.set(item.id, item);
    return group;
  }

  getItemsByGroup(groupId: string): NavigationItem[] {
    const group = this.groups.get(groupId);
    if (!group) return [];
    return group.items.filter((i) => i.visible).sort((a, b) => a.order - b.order);
  }

  setItemOrder(menuId: string, itemId: string, order: number): boolean {
    const menu = this.menus.get(menuId);
    if (!menu) return false;
    const item = menu.items.find((i) => i.id === itemId);
    if (!item) return false;
    item.order = order;
    menu.items.sort((a, b) => a.order - b.order);
    menu.updatedAt = new Date().toISOString();
    return true;
  }

  setGroupOrder(menuId: string, groupId: string, order: number): boolean {
    const menu = this.menus.get(menuId);
    if (!menu) return false;
    const group = menu.groups.find((g) => g.id === groupId);
    if (!group) return false;
    group.order = order;
    menu.groups.sort((a, b) => a.order - b.order);
    menu.updatedAt = new Date().toISOString();
    return true;
  }

  setItemVisibility(menuId: string, itemId: string, visible: boolean): boolean {
    const menu = this.menus.get(menuId);
    if (!menu) return false;
    const item = menu.items.find((i) => i.id === itemId);
    if (!item) return false;
    item.visible = visible;
    menu.updatedAt = new Date().toISOString();
    return true;
  }

  setGroupVisibility(groupId: string, visible: boolean): boolean {
    const group = this.groups.get(groupId);
    if (!group) return false;
    group.visible = visible;
    group.updatedAt = new Date().toISOString();
    return true;
  }

  updateNavigationMenu(id: string, updates: Partial<NavigationMenu>): NavigationMenu | null {
    const menu = this.menus.get(id);
    if (!menu) return null;
    const updated = { ...menu, ...updates, updatedAt: new Date().toISOString() };
    this.menus.set(id, updated);
    return updated;
  }

  deleteMenu(id: string): boolean {
    return this.menus.delete(id);
  }

  deleteGroup(id: string): boolean {
    const group = this.groups.get(id);
    if (!group) return false;
    const menu = this.menus.get(group.menuId);
    if (menu) {
      menu.groups = menu.groups.filter((g) => g.id !== id);
      menu.updatedAt = new Date().toISOString();
    }
    return this.groups.delete(id);
  }

  getAllItems(): NavigationItem[] {
    return Array.from(this.items.values());
  }

  getAllGroups(): NavigationGroup[] {
    return Array.from(this.groups.values());
  }
}

let menuManagementInstance: MenuManagement | null = null;

export function getMenuManagement(): MenuManagement {
  if (!menuManagementInstance) {
    menuManagementInstance = new MenuManagement();
  }
  return menuManagementInstance;
}

export function resetMenuManagement(): void {
  menuManagementInstance = null;
}