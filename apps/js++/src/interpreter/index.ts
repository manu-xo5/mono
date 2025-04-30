import type { stmt } from "@/parser/index.js";
import type { stack_ptr, value_t } from "./eval_expr.js";
import { eval_expr } from "./eval_expr.js";

function runMachine(name: string, lines: stmt[]) {
    const stack: unknown[] = [];
    const heap: Record<string, value_t> = {};
    let ip = 0;

    while (ip < lines.length) {
        const stmt = lines[ip]!;

        switch (stmt.kind) {
            case "var_declaration": {
                const value = eval_expr(stmt.value, heap);
                heap[stmt.symbol] = value;
                break;
            }
            case "func_declaration": {
                const top = stack.length;
                const ptr: stack_ptr = {
                    name: stmt.symbol,
                    index: top,

                };
                stack.push({
                    kind: "func",
                    body: stmt.body,
                });
                heap[stmt.symbol] = ptr;
                break;
            }
        }

        ip++;
    }

    console.debug(`stack`);
    console.dir(stack, { depth: null });
    console.debug(`heap`);
    console.dir(heap, { depth: null });
    console.debug(`end of ${name}`);
}

export const Eval = {
    runMachine,
};
