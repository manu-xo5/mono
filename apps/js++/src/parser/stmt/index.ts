import type { tokenizer_t } from "@/tokenizer/index.js";
import { parse_expr } from "../expr/index.js";

export function parse_stmt(tokenizer: tokenizer_t) {
    const current = tokenizer.current_token();

    if (current.name === "Identifier" && current.value === "let") {
        return var_stmt(tokenizer);
    }

    throw tokenizer.ERR_SYNTAX("Identifier");
}

function var_stmt(tokenizer: tokenizer_t) {
    tokenizer.eat("Identifier");
    const varName = tokenizer.eat("Identifier").value;

    tokenizer.eat("Equal");

    const value = parse_expr(tokenizer);

    return {
        name: "var",
        symbol: varName,
        value,
    };
}
