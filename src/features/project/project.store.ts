import { logger } from "@/core/logger";

export type ProjectStatus = "Draft" | "Planning" | "In Production" | "Review" | "Published" | "Archived";

export type Project = {
  id: string;
  workspaceId?: string;
  name: string;
  slug: string;
  description?: string;
  thumbnail?: string;
  status: ProjectStatus;
  visibility?: "private" | "workspace" | "public";
  tags?: string[];
  owner?: string;
  members?: { id: string; name: string; role: string }[];
  favorite?: boolean;
  pinned?: boolean;
  archived?: boolean;
  createdAt: string;
  updatedAt: string;
  lastActivity?: string;
};

const KEY = "tamer:projects";

function readStore(): Project[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Project[];
  } catch (err) {
    logger.error("Failed to read projects", err as Error);
    return [];
  }
}

function writeStore(list: Project[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch (err) {
    logger.error("Failed to write projects", err as Error);
  }
}

export const projectStore = {
  getAll(): Project[] {
    return readStore();
  },

  get(id: string) {
    return readStore().find((p) => p.id === id) ?? null;
  },

  create(payload: Omit<Project, "id" | "createdAt" | "updatedAt">) {
    if (typeof window === "undefined") {
      throw new Error("projectStore.create cannot be called on the server");
    }
    const list = readStore();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const project: Project = {
      id,
      name: payload.name,
      slug: payload.slug,
      description: payload.description,
      thumbnail: payload.thumbnail,
      status: payload.status ?? "Draft",
      visibility: payload.visibility ?? "workspace",
      tags: payload.tags ?? [],
      owner: payload.owner,
      members: payload.members ?? [],
      favorite: payload.favorite ?? false,
      pinned: payload.pinned ?? false,
      archived: payload.archived ?? false,
      createdAt: now,
      updatedAt: now,
      lastActivity: payload.lastActivity,
      workspaceId: payload.workspaceId,
    };
    list.unshift(project);
    writeStore(list);
    return project;
  },

  update(id: string, patch: Partial<Project>) {
    if (typeof window === "undefined") {
      throw new Error("projectStore.update cannot be called on the server");
    }
    const list = readStore();
    const i = list.findIndex((p) => p.id === id);
    if (i === -1) return null;
    list[i] = { ...list[i], ...patch, updatedAt: new Date().toISOString() };
    writeStore(list);
    return list[i];
  },

  delete(id: string) {
    if (typeof window === "undefined") {
      throw new Error("projectStore.delete cannot be called on the server");
    }
    let list = readStore();
    list = list.filter((p) => p.id !== id);
    writeStore(list);
    return true;
  },

  duplicate(id: string) {
    const p = this.get(id);
    if (!p) return null;
    const copy = { ...p, id: crypto.randomUUID(), name: `${p.name} (Copy)`, slug: `${p.slug}-copy`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as Project;
    const list = readStore();
    list.unshift(copy);
    writeStore(list);
    return copy;
  },

  toggleFavorite(id: string) {
    const p = this.get(id);
    if (!p) return null;
    return this.update(id, { favorite: !p.favorite });
  },

  archive(id: string) {
    return this.update(id, { archived: true });
  },
};
