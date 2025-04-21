import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";
import stylistic from "@stylistic/eslint-plugin";

export default defineConfig([
  { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"], languageOptions: { globals: globals.browser } },
  tseslint.configs.recommended,
  //pluginReact.configs.flat.recommended,
  {
    plugins: {
      "@stylistic": stylistic
    },
    rules: {
      "newline-per-chained-call": "error"
    }
  }
]);
