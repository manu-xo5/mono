import type { Branch } from "@/parser/ast/branch.ts";
import type { Bytecode } from "@/parser/ast/bytecode.ts";
import type { Constant } from "@/parser/ast/def_const.ts";
import { Scope } from "@/parser/scope.ts";
import { OP } from "@/runtime/instructions.ts";

export class Program extends Scope implements Bytecode {
    statements: (Constant | Branch)[] = [];

    constructor() {
        super(0);
    }

    append_stmt(stmt: typeof this.statements) {
        this.statements.push(...stmt);
    };

    generate_bytecode() {
        return this.statements
            .map(x => x.generate_bytecode())
            .concat([[[OP.RET]]])
            .flat();
    }
}
