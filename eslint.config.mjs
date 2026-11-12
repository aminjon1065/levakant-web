import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Technical plans, shadow frames and lightbox originals stay plain <img> on purpose: plans are zoomed
    // up to 220 % and must keep full resolution (lazy + intrinsic size instead). Photos use next/image (Pic).
    files: ['src/components/sections/**/*.tsx'],
    rules: { '@next/next/no-img-element': 'off' },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
