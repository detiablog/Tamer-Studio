import { logger } from "@/core/logger";

export type Template = {
  id: string;
  name: string;
  category: string;
  uses: number;
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
};

const KEY = "tamer:templates";

const sampleTemplates: Template[] = [
  {
    id: crypto.randomUUID(),
    name: "YouTube Script Template",
    category: "Script",
    uses: 24,
    favorite: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: crypto.randomUUID(),
    name: "Product Image Prompt",
    category: "Prompt",
    uses: 18,
    favorite: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
  {
    id: crypto.randomUUID(),
    name: "Social Media Batch",
    category: "Production",
    uses: 12,
    favorite: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
  },
  {
    id: crypto.randomUUID(),
    name: "Voiceover Style Guide",
    category: "Prompt",
    uses: 8,
    favorite: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
  },
  {
    id: crypto.randomUUID(),
    name: "Affiliate Review Framework",
    category: "Script",
    uses: 15,
    favorite: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
];

function readStore(): Template[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return seedTemplates();
    return JSON.parse(raw) as Template[];
  } catch (err) {
    logger.error("Failed to read templates", err as Error);
    return seedTemplates();
  }
}

function writeStore(list: Template[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch (err) {
    logger.error("Failed to write templates", err as Error);
  }
}

function seedTemplates() {
  const list = readStore();
  if (list.length) return list;
  writeStore(sampleTemplates);
  return sampleTemplates;
}

export const templateStore = {
  getAll(): Template[] {
    return readStore();
  },

  get(id: string) {
    return readStore().find((t) => t.id === id) ?? null;
  },

  create(payload: Omit<Template, "id" | "uses" | "createdAt" | "updatedAt">) {
    if (typeof window === "undefined") {
      throw new Error("templateStore.create cannot be called on the server");
    }
    const list = readStore();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const template: Template = {
      id,
      name: payload.name,
      category: payload.category,
      uses: 0,
      favorite: payload.favorite,
      createdAt: now,
      updatedAt: now,
    };
    list.unshift(template);
    writeStore(list);
    return template;
  },

  update(id: string, patch: Partial<Template>) {
    if (typeof window === "undefined") {
      throw new Error("templateStore.update cannot be called on the server");
    }
    const list = readStore();
    const index = list.findIndex((t) => t.id === id);
    if (index === -1) return null;
    list[index] = { ...list[index], ...patch, updatedAt: new Date().toISOString() };
    writeStore(list);
    return list[index];
  },

  delete(id: string) {
    if (typeof window === "undefined") {
      throw new Error("templateStore.delete cannot be called on the server");
    }
    const list = readStore().filter((t) => t.id !== id);
    writeStore(list);
    return true;
  },

  incrementUse(id: string) {
    if (typeof window === "undefined") return null;
    const list = readStore();
    const index = list.findIndex((t) => t.id === id);
    if (index === -1) return null;
    list[index] = { ...list[index], uses: list[index].uses + 1, updatedAt: new Date().toISOString() };
    writeStore(list);
    return list[index];
  },
};
