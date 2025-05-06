import type { instr_t, stack_value_t } from "@/runtime/instructions.ts";

function todo() {
    throw new Error("not implemented");
}

export class Scope {
    constructor(public sp: number) { }

    locals: Record<string, stack_value_t> = {};
    functions: Record<string, (...args: any[]) => any> = {};

    set_local(name: string, value: stack_value_t) {
        if (name in this.locals) {
            throw new Error(`constant ${name} is already defined`);
        }
        this.locals[name] = value;
    }

    get_local(name: string) {
        if (!(name in this.locals)) {
            throw new Error(`ReferenceError: ${name} not found!`);
        }

        return this.locals[name];
    }

    set_function(name: string, body: instr_t[]) {
        if (name in this.functions) {
            throw new Error(`function ${name}() is already defined`);
        }
        void body;
        this.functions[name] = () => todo();
    }

    get_functions(name: string) {
        if (!(name in this.functions)) {
            throw new Error(`ReferenceError: ${name}() not found!`);
        }

        return this.functions[name];
    }

    size() {
        return this.sp;
    }

    dump() {
        console.debug(JSON.stringify(this.locals, null, 3));
    }
}
