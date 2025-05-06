import type { Bytecode } from "@/parser/ast/bytecode.ts";
import type { instr_t, stack_value_t } from "@/runtime/instructions.ts";
import { OP } from "@/runtime/instructions.ts";

export class VarDeclarationStmt implements Bytecode {
    constructor(public name: string, public value: stack_value_t) { }

    generate_bytecode(): instr_t[] {
        return [
            [OP.LOCAL, this.name, this.value],
        ];
    }
}
