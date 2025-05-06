import type { Bytecode } from "@/parser/ast/bytecode.ts";
import type { Constant } from "@/parser/ast/def_const.ts";
import type { stack_value_t } from "@/runtime/instructions.ts";
import { Scope } from "@/parser/scope.ts";
import { OP } from "@/runtime/instructions.ts";

export class Branch extends Scope implements Bytecode {
    true_branch: Constant[] = [];
    cond_value: stack_value_t = 0;

    constructor(parent: Scope, public has_else: boolean) {
        super(parent.size());
    }

    cond(cond_value: stack_value_t) {
        this.cond_value = cond_value;
        return this;
    }

    then(stmts: (scope: Scope) => Constant[]) {
        this.true_branch = stmts(this);
        return this;
    }

    generate_bytecode(): instr_t[] {
        const true_branch_bytecode = this.true_branch.map(x => x.generate_bytecode()).flat();
        const skip_true_branch_addr = 2 + true_branch_bytecode.length;

        return [
            [OP.LOAD, "acc", this.cond_value],
            [OP.JNZ, "acc", skip_true_branch_addr],
            ...true_branch_bytecode,
        ];
    }
}
