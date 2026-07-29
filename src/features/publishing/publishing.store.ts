import { logger } from "@/core/logger";

export type PublicationStatus = "Draft" | "Scheduled" | "Published";

export type Publication = {
  id: string;
  title: string;
  platform: string;
  status: PublicationStatus;
  date: string;
  views: string;
  createdAt: string;
  updatedAt: string;
};

const KEY = "tamer:publications";

function readStore(): Publication[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Publication[];
  } catch (err) {
    logger.error("Failed to read publications", err as Error);
    return [];
  }
}

function writeStore(list: Publication[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch (err) {
    logger.error("Failed to write publications", err as Error);
  }
}

export const publicationStore = {
  getAll(): Publication[] {
    return readStore();
  },

  get(id: string) {
    return readStore().find((p) => p.id === id) ?? null;
  },

  create(payload: Omit<Publication, "id" | "createdAt" | "updatedAt">) {
    if (typeof window === "undefined") {
      throw new Error("publicationStore.create cannot be called on the server");
    }
    const list = readStore();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const pub: Publication = {
      id,
      title: payload.title,
      platform: payload.platform,
      status: payload.status,
      date: payload.date,
      views: payload.views,
      createdAt: now,
      updatedAt: now,
    };
    list.unshift(pub);
    writeStore(list);
    return pub;
  },

  update(id: string, patch: Partial<Publication>) {
    if (typeof window === "undefined") {
      throw new Error("publicationStore.update cannot be called on the server");
    }
    const list = readStore();
    const index = list.findIndex((p) => p.id === id);
    if (index === -1) return null;
    list[index] = { ...list[index], ...patch, updatedAt: new Date().toISOString() };
    writeStore(list);
    return list[index];
  },

  delete(id: string) {
    if (typeof window === "undefined") {
      throw new Error("publicationStore.delete cannot be called on the server");
    }
    const list = readStore().filter((p) => p.id !== id);
    writeStore(list);
    return true;
  },
};
