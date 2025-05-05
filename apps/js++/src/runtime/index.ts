import type { instr_t, stack_value_t } from "@/runtime/instructions";
import type * as React from "react";
import { OP } from "@/runtime/instructions";
import { createElement } from "react";

const todo = () => new Error("not implemented");

export class FuctionRuntime {
    locals: Record<string, stack_value_t> = {};

    acc: React.ReactNode[] = [];

    r1: stack_value_t = 0;
    r2: stack_value_t = 0;
    r3: stack_value_t = 0;
    r4: stack_value_t = 0;

    sp: number = 0;
    ip: number = 0;
    fp: number = 0;
    constructor(public name: string, public program: readonly instr_t[]) {}

    run() {
        for (this.ip = 0; this.ip < this.program.length; this.ip++) {
            const instruction = this.program[this.ip]!;
            this.execute(instruction);
        }

        return this.acc[this.acc.length - 1];
    }

    execute(instruction: instr_t) {
        const [inst, ...args] = instruction;

        switch (inst) {
            case OP.LOCAL: {
                const name = String(args[0]);
                const value = args[1];
                this.locals[name] = value;
                break;
            }

            case OP.TXT: {
                const str = String(args[0]);
                this.acc.push(this.resolveValue(str) as string[]);
                break;
            }

            case OP.ELM: {
                const name = String(args[0]);
                const props = (typeof this.r3 !== "object")
                    ? {}
                    : this.r3;

                const children = [...this.acc];
                this.acc = [];

                this.acc.push(createElement(name, props, children));
                break;
            }

            case OP.CALL:
                throw todo();

            case OP.NATC:
                this.nativeCallFunc(String(args[0]));
                break;

            case OP.RET:{
                return;
            }

            default:
                throw new Error(`Unknown opcode: ${OP[inst]}`);
        }
    }

    resolveValue(value: unknown) {
        if (typeof value !== "string") {
            throw new TypeError(`Expect a string, found ${typeof value}`);
        }

        if (value.startsWith("$")) {
            return value.substring(1);
        }

        else {
            if (!(value in this.locals)) {
                throw new Error(`${value} not found in scope`);
            }

            return this.locals[value];
        }
    }

    nativeCallFunc(functionName: string) {
        switch (functionName) {
            case "log": {
                throw todo();
            }
            case "useState": {
                throw todo();
            }

            default:
                throw new Error(`${functionName} not found`);
        }
    }
}
