import { logger } from "@/core/logger";

export type Workspace = {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  owner?: string;
  members?: { id: string; name: string; role: string; email?: string }[];
  createdAt: string;
  updatedAt: string;
  status?: "active" | "archived";
};

const KEY = "tamer:workspaces";
const KEY_CURRENT = "tamer:workspaceId";

function readStore(): Workspace[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Workspace[];
  } catch (err) {
    logger.error("Failed to read workspaces", err as Error);
    return [];
  }
}

function writeStore(list: Workspace[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch (err) {
    logger.error("Failed to write workspaces", err as Error);
  }
}

export const workspaceStore = {
  getAll(): Workspace[] {
    return readStore();
  },

  get(id: string) {
    return readStore().find((w) => w.id === id) ?? null;
  },

  create(payload: Omit<Workspace, "id" | "createdAt" | "updatedAt">) {
    const list = readStore();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const ws: Workspace = {
      id,
      name: payload.name,
      description: payload.description,
      avatar: payload.avatar,
      owner: payload.owner,
      members: payload.members ?? [],
      createdAt: now,
      updatedAt: now,
      status: payload.status ?? "active",
    };
    list.unshift(ws);
    writeStore(list);
    // set current workspace to newly created
    try { localStorage.setItem(KEY_CURRENT, id); } catch (e) { void e; }
    return ws;
  },

  update(id: string, patch: Partial<Workspace>) {
    const list = readStore();
    const i = list.findIndex((w) => w.id === id);
    if (i === -1) return null;
    list[i] = { ...list[i], ...patch, updatedAt: new Date().toISOString() };
    writeStore(list);
    return list[i];
  },

  delete(id: string) {
    let list = readStore();
    list = list.filter((w) => w.id !== id);
    writeStore(list);
    try {
      const current = localStorage.getItem(KEY_CURRENT);
      if (current === id) {
        if (list.length) localStorage.setItem(KEY_CURRENT, list[0].id);
        else localStorage.removeItem(KEY_CURRENT);
      }
    } catch (e) { void e; }
    return true;
  },

  getCurrentId() {
    try { return localStorage.getItem(KEY_CURRENT); } catch (e) { void e; return null; }
  },

  setCurrentId(id: string) {
    try { localStorage.setItem(KEY_CURRENT, id); } catch (e) { void e; }
  }
};
