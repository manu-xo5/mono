import antfu from "@antfu/eslint-config";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default antfu({
    typescript: true,
    stylistic: {
        indent: 4,
        quotes: "double",
        semi: true,
        overrides: {
            "no-console": ["error", { allow: ["debug", "dir", "error"] }],
            "antfu/consistent-chaining": "error",
            "import/no-default-export": "error",
            "ts/consistent-type-definitions": ["error", "type"],
        },
    },
}, {
    files: ["*.config.js"],
    rules: {
        "import/no-default-export": "off",
    },
}, {
    plugins: {
        "react-hooks": reactHooks,
        "react-refresh": reactRefresh,
    },
    rules: {
        ...reactHooks.configs.recommended.rules,
        "react-refresh/only-export-components": [
            "warn",
            { allowConstantExport: true },
        ],
    },
});
