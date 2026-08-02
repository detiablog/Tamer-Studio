const REQUIRED_VARS = [
  "DATABASE_URL",
  "BETTER_AUTH_SECRET",
  "SESSION_SECRET",
];

const RECOMMENDED_VARS = [
  "REDIS_URL",
  "STORAGE_PROVIDER",
  "SMTP_HOST",
  "OPENAI_API_KEY",
  "APP_URL",
  "JWT_SECRET",
  "ADMIN_SECRET",
];

export function validateEnvironment(): { valid: boolean; missing: string[]; warnings: string[] } {
  const missing: string[] = [];
  const warnings: string[] = [];

  for (const varName of REQUIRED_VARS) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  for (const varName of RECOMMENDED_VARS) {
    if (!process.env[varName]) {
      warnings.push(varName);
    }
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  };
}

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getEnv(name: string, defaultValue: string = ""): string {
  return process.env[name] || defaultValue;
}
