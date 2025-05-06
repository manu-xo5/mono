import type { instr_t, ptr_t } from "@/runtime/instructions.ts";
import { OP } from "@/runtime/instructions.ts";

export function is_ptr(x: unknown): x is ptr_t {
    return Boolean(x && typeof x === "object" && "ptr" in x && typeof x.ptr === "number");
}

export function to_string(program: instr_t[]): string {
    const builder: string[] = [];

    builder.push("[");

    for (let i = 0; i < program.length; i++) {
        const [opCode, ...args] = program[i]!;
        const op_code_str = String(OP[opCode]).padEnd(5, " ");
        const args_str = args.map(x => is_ptr(x) ? `ptr->${x.ptr}` : String(x)).join(" ");
        builder.push(`  (${i}) ${op_code_str} ${args_str}`);
    }

    builder.push("]");

    return builder.join("\n");
}
