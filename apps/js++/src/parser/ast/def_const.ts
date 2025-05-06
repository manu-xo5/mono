import type { Bytecode } from "@/parser/ast/bytecode.ts";
import type { Scope } from "@/parser/scope.ts";
import type { instr_t, stack_value_t } from "@/runtime/instructions.ts";
import { OP } from "@/runtime/instructions.ts";

export class Constant implements Bytecode {
    constructor(parent: Scope, name: string, public value: stack_value_t) {
        parent.alloc(name, value);
    }

    generate_bytecode(): instr_t[] {
        return [
            [OP.PSH, this.value],
        ];
    }
}
