import type { instr_t, ptr_t } from "@/runtime/instructions";
import { OP } from "@/runtime/instructions";

function is_ptr(value: unknown): value is ptr_t {
    if (value && typeof value === "object" && "ptr" in value && typeof value.ptr === "number")
        return true;

    return false;
}

export function to_string(program: instr_t[]) {
    const stringify: string[] = [];

    stringify.push("[");

    for (let i = 0; i < program.length; i++) {
        const instr = program[i]!;
        const [opCode, ...args] = instr;
        const str = args.map(x => is_ptr(x) ? `ptr:${String(x.ptr)}` : String(x)).join(", ");

        stringify.push(`${i}\t${OP[opCode]}, ${str}`);
    }

    stringify.push("]");

    return stringify.join("\n");
}
