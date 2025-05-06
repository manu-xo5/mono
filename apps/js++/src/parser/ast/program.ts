import type { Branch } from "@/parser/ast/branch.ts";
import type { Bytecode } from "@/parser/ast/bytecode.ts";
import type { VarDeclarationStmt } from "@/parser/ast/def_const.ts";
import { Scope } from "@/parser/scope.ts";
import { OP } from "@/runtime/instructions.ts";

export class Program extends Scope implements Bytecode {
    statements: (VarDeclarationStmt | Branch)[] = [];

    constructor() {
        super(0);
    }

    append_stmt(stmt: typeof this.statements[number]) {
        this.statements.push(stmt);
        return this;
    };

    generate_bytecode() {
        return this.statements
            .map(x => x.generate_bytecode())
            .concat([[[OP.RET]]])
            .flat();
    }
}
