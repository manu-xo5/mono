import type { instr_t, ptr_t, stack_value_t } from "@/runtime/instructions.ts";
import { OP } from "@/runtime/instructions.ts";

export class Scope {
    constructor(public sp: number) { }

    locals: Record<string, stack_value_t> = {};

    alloc(name: string, value: stack_value_t): instr_t[] {
        this.locals[name] = this.sp++;
        return [
            [OP.PSH, value],
        ];
    }

    read(name: string): ptr_t {
        if (!(name in this.locals)) {
            throw new Error(`ReferenceError: ${name} not found!`);
        }
        return { ptr: Number(this.locals[name]) };
    }

    size() {
        return this.sp;
    }
}
