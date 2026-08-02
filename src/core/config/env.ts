export const REQUIRED_ENV_VARS = {
  DATABASE_URL: "DATABASE_URL",
  BETTER_AUTH_SECRET: "BETTER_AUTH_SECRET",
} as const;

export type RequiredEnvVar = keyof typeof REQUIRED_ENV_VARS;

export function validateEnv(): void {
  const missing: string[] = [];

  for (const [key, envVar] of Object.entries(REQUIRED_ENV_VARS)) {
    if (!process.env[envVar]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}

export function getEnv(key: RequiredEnvVar): string {
  const value = process.env[REQUIRED_ENV_VARS[key]];
  if (!value) {
    throw new Error(`Environment variable ${key} is not defined`);
  }
  return value;
}

export function getOptionalEnv(key: string, defaultValue: string): string {
  return process.env[key] ?? defaultValue;
}
