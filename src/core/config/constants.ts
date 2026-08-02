import { getOptionalEnv } from "./env";
import { config } from "./config";

export const URLS = {
  get base() {
    return config.app.url;
  },
  get seoBase() {
    return getOptionalEnv("NEXT_PUBLIC_SEO_URL", config.app.url);
  },
  get ogImage() {
    return `${config.app.url}/og-image.svg`;
  },
} as const;

export const EMAILS = {
  get support() {
    return getOptionalEnv("SUPPORT_EMAIL", "support@tamerstudio.com");
  },
  get from() {
    return config.notifications.defaultFromEmail ?? "noreply@tamerstudio.com";
  },
  get fromName() {
    return config.notifications.defaultFromName ?? "Tamer Studio";
  },
} as const;

export const SOCIAL = {
  get twitter() {
    return getOptionalEnv("TWITTER_HANDLE", "@tamerstudio");
  },
  get twitterCreator() {
    return getOptionalEnv("TWITTER_CREATOR", getOptionalEnv("TWITTER_HANDLE", "@tamerstudio"));
  },
  get discord() {
    return getOptionalEnv("DISCORD_URL", "https://discord.gg/tamerstudio");
  },
  get github() {
    return getOptionalEnv("GITHUB_URL", "https://github.com/tamerstudio");
  },
} as const;
