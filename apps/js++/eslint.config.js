import antfu from "@antfu/eslint-config";

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
});
