import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "backend/**",
      "oldCode/**",
    ],
  },
  {
    // More lenient rules for production builds
    rules: {
      // Allow any types for now (can be gradually fixed)
      "@typescript-eslint/no-explicit-any": "warn",
      
      // Allow unused variables (common during development)
      "@typescript-eslint/no-unused-vars": "warn",
      
      // Allow unescaped entities in JSX
      "react/no-unescaped-entities": "warn",
      
      // Allow missing dependencies in hooks (can be complex to fix)
      "react-hooks/exhaustive-deps": "warn",
      
      // Allow img elements (Next.js Image can be migrated later)
      "@next/next/no-img-element": "warn",
      
      // Allow HTML links (can be migrated to Next.js Link later)
      "@next/next/no-html-link-for-pages": "warn",
    },
  },
];

export default eslintConfig;
