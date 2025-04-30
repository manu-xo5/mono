import type { stmt } from "@/parser/index.js";
import { eval_expr } from "./eval_expr.js";

function runMachine(name: string, lines: stmt[]) {
    // const stack: string[] = [];
    const heap: Record<string, ReturnType<typeof eval_expr>> = {};
    let ip = 0;

    while (ip < lines.length) {
        const ins = lines[ip]!;

        switch (ins.kind) {
            case "var": {
                const value = eval_expr(ins.value, heap);
                heap[ins.symbol] = value;
            }
        }

        ip++;
    }

    console.debug(`heap`);
    console.dir(heap, { depth: null });
    console.debug(`end of ${name}`);

    return undefined;
}

export const Eval = {
    runMachine,
};
