import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: [
      '**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,mjsx,tsx}',
    ],
    exclude: ['node_modules', 'dist', '.next', '.kilo', 'src/test/e2e'],
    setupFiles: ['src/test/setup.ts'],
    env: {
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/test',
      BETTER_AUTH_SECRET: 'secret123',
      ADMIN_MASTER_KEY: 'master123',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: ['src/**/*.d.ts', 'src/test/**', '**/*.config.ts'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
