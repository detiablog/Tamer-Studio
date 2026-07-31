import type { PlatformAdapter } from "./platform-adapter.interface";
import { TikTokAdapter } from "./platforms/tiktok.adapter";
import { InstagramAdapter } from "./platforms/instagram.adapter";

class PlatformRegistry {
  private adapters = new Map<string, PlatformAdapter>();

  constructor() {
    this.register(new TikTokAdapter());
    this.register(new InstagramAdapter());
  }

  register(adapter: PlatformAdapter) {
    this.adapters.set(adapter.code, adapter);
  }

  getAdapter(code: string): PlatformAdapter | undefined {
    return this.adapters.get(code);
  }

  getAdapters(): PlatformAdapter[] {
    return Array.from(this.adapters.values());
  }

  getSupportedPlatforms(): string[] {
    return Array.from(this.adapters.keys());
  }
}

export const platformRegistry = new PlatformRegistry();
