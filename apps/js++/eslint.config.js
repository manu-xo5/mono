import antfu from "@antfu/eslint-config";

export default antfu({
    typescript: true,
    stylistic: {
        indent: 4,
        quotes: "double",
        semi: true,
        overrides: {
            "no-console": ["error", { allow: ["debug"] }],
            "antfu/consistent-chaining": "error",
            "import/no-default-export": "error",
        },
    },
});
