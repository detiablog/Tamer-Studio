import { validateEnv, getEnv, getOptionalEnv, REQUIRED_ENV_VARS } from "./env";

export interface AppConfig {
  database: {
    url: string;
  };
  auth: {
    secret: string;
    url: string;
  };
  admin: {
    masterKey: string;
  };
  app: {
    url: string;
    env: "development" | "production" | "test";
  };
  notifications: {
    emailProvider?: string;
    smsProvider?: string;
    pushProvider?: string;
    defaultFromEmail?: string;
    defaultFromName?: string;
  };
}

let cachedConfig: AppConfig | null = null;

export function loadConfig(): AppConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  validateEnv();

  const nodeEnv = process.env.NODE_ENV ?? "development";
  const appUrl = getOptionalEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
  const adminMasterKey = getOptionalEnv("ADMIN_MASTER_KEY", "");

  cachedConfig = {
    database: {
      url: getEnv("DATABASE_URL"),
    },
    auth: {
      secret: getEnv("BETTER_AUTH_SECRET"),
      url: appUrl,
    },
    admin: {
      masterKey: adminMasterKey,
    },
    app: {
      url: appUrl,
      env: nodeEnv as AppConfig["app"]["env"],
    },
    notifications: {
      emailProvider: getOptionalEnv("NOTIFICATION_EMAIL_PROVIDER", ""),
      smsProvider: getOptionalEnv("NOTIFICATION_SMS_PROVIDER", ""),
      pushProvider: getOptionalEnv("NOTIFICATION_PUSH_PROVIDER", ""),
      defaultFromEmail: getOptionalEnv("NOTIFICATION_DEFAULT_FROM_EMAIL", "noreply@tamerstudio.com"),
      defaultFromName: getOptionalEnv("NOTIFICATION_DEFAULT_FROM_NAME", "Tamer Studio"),
    },
  };

  return cachedConfig;
}

export const config = {
  get database() {
    return loadConfig().database;
  },
  get auth() {
    return loadConfig().auth;
  },
  get admin() {
    return loadConfig().admin;
  },
  get app() {
    return loadConfig().app;
  },
  get notifications() {
    return loadConfig().notifications;
  },
};

export { REQUIRED_ENV_VARS };
