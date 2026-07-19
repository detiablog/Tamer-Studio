import js from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import tseslint from "typescript-eslint";
import globals from "globals";

export default [
  js.configs.recommended,

  ...tseslint.configs.recommended,

  {
    files: ["**/*.{js,mjs,cjs,ts,tsx}"],

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },

    plugins: {
      "@next/next": nextPlugin
    },

    rules: {
      // Next.js
      "@next/next/no-img-element": "warn",

      // General
      "no-console": [
        "warn",
        {
          allow: ["warn", "error"]
        }
      ],

      "prefer-const": "error",

      "no-var": "error",

      "object-shorthand": "error",

      // TypeScript
      "@typescript-eslint/no-explicit-any": "warn",

      "@typescript-eslint/consistent-type-imports": "error",

      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          "argsIgnorePattern": "^_",
          "varsIgnorePattern": "^_"
        }
      ]
    }
  },

  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "coverage/**",
      "dist/**"
    ]
  }
];
