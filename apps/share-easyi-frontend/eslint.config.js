import antfu from "@antfu/eslint-config"

export default antfu(
    {
        stylistic: {
            indent: 4,
            quotes: "double",
        },
        typescript: {
            overrides: {
                "ts/consistent-type-definitions": ["error", "type"],
            },
        },

        react: true,
    },
    {
        rules: {
            "no-console": ["error", { allow: ["warn", "error", "debug"] }],
        },
    },
)
