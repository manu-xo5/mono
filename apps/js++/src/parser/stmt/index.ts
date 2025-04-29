import type { tokenizer_t } from "@/tokenizer/index.js";
import { parse_expr } from "../expr/index.js";

function expr_stmt(tokenizer: tokenizer_t) {
    const expr = parse_expr(tokenizer);
    // tokenizer.eat("Semicolon");

    return expr;
}

export function parse_stmt(tokenizer: tokenizer_t) {
    return expr_stmt(tokenizer);
}
