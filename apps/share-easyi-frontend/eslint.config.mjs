// import globals from "globals";
// import tseslint from "typescript-eslint";
// import pluginReact from "eslint-plugin-react";
// import { defineConfig } from "eslint/config";
// import stylistic from "@stylistic/eslint-plugin";
import antfu from '@antfu/eslint-config'

export default antfu({
  stylistic: {
    indent: 2,
    quotes: 'single',
  },
  typescript: {
    overrides: {
      'ts/consistent-type-definitions': ['error', 'type'],
    },
  },
  react: true,
})
