import { readFileSync, writeFileSync, existsSync, unlinkSync } from "fs";
import { join } from "path";
import type { InstallationState } from "./installation.types";
import { createInitialState } from "./installation.state";

const STATE_FILE = ".installer-state.json";

function getStatePath(): string {
  return join(process.cwd(), STATE_FILE);
}

export function loadFileState(): InstallationState {
  const path = getStatePath();
  if (!existsSync(path)) {
    return createInitialState();
  }
  try {
    const raw = readFileSync(path, "utf-8");
    return JSON.parse(raw) as InstallationState;
  } catch {
    return createInitialState();
  }
}

export function saveFileState(state: InstallationState): void {
  const path = getStatePath();
  const payload = { ...state, updatedAt: new Date().toISOString() };
  writeFileSync(path, JSON.stringify(payload, null, 2), "utf-8");
}

export function clearFileState(): void {
  const path = getStatePath();
  if (existsSync(path)) {
    unlinkSync(path);
  }
}

export function loadDbState(): InstallationState | null {
  try {
    const { db } = require("@/lib/db");
    const { secSettings } = require("@/lib/db/schema/security");
    const { eq } = require("drizzle-orm");

    const rows = db.select().from(secSettings).where(eq(secSettings.id, "installation")).limit(1);
    const row = rows[0];
    if (!row?.metadata) return null;

    const meta = row.metadata as Record<string, unknown>;
    if (!meta.installation) return null;

    return meta.installation as InstallationState;
  } catch {
    return null;
  }
}

export function saveDbState(state: InstallationState): void {
  try {
    const { db } = require("@/lib/db");
    const { secSettings } = require("@/lib/db/schema/security");
    const { eq } = require("drizzle-orm");

    const existing = db.select().from(secSettings).where(eq(secSettings.id, "installation")).limit(1);

    if (existing.length > 0) {
      const currentMeta = (existing[0].metadata ?? {}) as Record<string, unknown>;
      db.update(secSettings)
        .set({
          metadata: { ...currentMeta, installation: state },
          updatedAt: new Date(),
        })
        .where(eq(secSettings.id, "installation"));
    } else {
      db.insert(secSettings).values({
        id: "installation",
        metadata: { installation: state },
      });
    }
  } catch {
    // Database not yet available during early installation stages
  }
}

export function loadState(): InstallationState {
  const dbState = loadDbState();
  if (dbState) return dbState;
  return loadFileState();
}

export function saveState(state: InstallationState): void {
  saveFileState(state);
  saveDbState(state);
}

export function clearState(): void {
  clearFileState();
  try {
    const { db } = require("@/lib/db");
    const { secSettings } = require("@/lib/db/schema/security");
    const { eq } = require("drizzle-orm");
    db.delete(secSettings).where(eq(secSettings.id, "installation"));
  } catch {
    // Database may not exist
  }
}

export function isInstalled(): boolean {
  const state = loadState();
  return state.status === "completed";
}

export function migrateToFileToDb(): boolean {
  const fileState = loadFileState();
  if (fileState.status === "not_started") return false;

  const dbState = loadDbState();
  if (dbState) return false;

  saveDbState(fileState);
  clearFileState();
  return true;
}
