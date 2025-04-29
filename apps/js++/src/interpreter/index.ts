import { eval_expr } from "./eval_expr.js";

interface dec_stmt_t {
    name: "var";
    symbol: string;
    value: unknown;
}

function is_dec_stmt(stmt: object): stmt is dec_stmt_t {
    if ("name" in stmt && stmt.name === "var") {
        return true;
    }

    return false;
}

type value_t = 
    | number
    | string

export function run(stmtList: object[]) {
    const stack: [string, value_t][] = [];

    for (const stmt of stmtList) {
        if (is_dec_stmt(stmt)) {
            const expr = eval_expr(stmt.value, stack);

            stack.push([stmt.symbol, expr]);
        }
    }

    console.debug("--------stack");
    console.debug(stack);
}
