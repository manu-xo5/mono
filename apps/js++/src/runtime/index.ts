import type * as React from "react";
import { createElement } from "react";

/**
 * component:
 *   RENDER_START
 *   PSH "hello"
 *   APC
 *   RENDER_END
 */

/**
 * <button onClick={handleClick}>Hello</button>
 * <button>World</button>
 *
 * button:
 *    onClick: handleClick
 *    children: [ Hello ]
 * button:
 *    children: [ World ]
 *
 * PSH Hello
 * STP children
 * LOD handleClick
 * STP onClick
 * ELM button
 *
 * PUSH World
 * SETP children
 * ELEM button
 *
 * RETU
 */

export enum OP {
    // stack operations
    PSH,
    POP,

    // regs operations
    LOAD,
    MOVE, // MOVe

    RETURN, // RETurn
    HALT, // HALT

    SUB,  // SUBroutine
    CALL, // CALl
    NATC, // NATive Code

    STP,
    ELM,
    LOC, // LOad Children
}

type stack_value_t =
    | string
    | number
    | object
    | (string | number)[];

export class VM {
    stack: stack_value_t[] = [];
    registers: Record<string, stack_value_t> = {};
    propsAcc: Record<string, any> = {};
    children: React.ReactElement[] = [];
    labels: Record<string, [number, ...any[]][]> = {};

    sp: number = 0;
    ip: number = 0;
    fp: number = 0;
    constructor(public name: string, public instruction: [number, ...any[]][]) {}

    // Execute opcode
    execute() {
        console.log(this.ip);
        for (; this.ip < this.instruction.length; this.ip++) {
            const [opcode, ...args] = this.instruction[this.ip]!;

            switch (opcode) {
                case OP.PSH:
                    this.push(args[0]);
                    break;
                case OP.POP:
                    this.pop();
                    break;

                case OP.MOVE: {
                    const [name, value] = args;
                    this.registers[name] = value;
                    break;
                }

                case OP.LOAD: {
                    const [name] = args;
                    const value = this.registers[name]!;
                    this.push(value);
                    break;
                }

                case OP.STP: {
                    const name = args[0];
                    const value = this.pop()!;
                    if (typeof value === "object" && "jump" in value && typeof value.jump === "number") {
                      const jump = value.jump;
                      this.propsAcc[name] = () => {
                        console.log("click");
                        this.ip = jump;
                        this.execute()
                      }
                    } else {
                      this.propsAcc[name] = value;
                    }
                    break;
                }

                case OP.ELM: {
                    const name = args[0];
                    const {children,...props} =  this.propsAcc;
                    this.propsAcc = {};

                    this.children.push(createElement(
                        name,
                        props,
                        children,
                    ));
                    break;
                }

                case OP.LOC: {
                    this.push([...this.children]);
                    this.children = [];
                    break;
                }

                case OP.CALL:
                    this.callFunc(Number(args[0]), Number(args[1]));
                    break;
                case OP.NATC:
                    this.nativeCallFunc(String(args[0]));
                    break;

                case OP.RETURN:{
                    if (this.fp === 0) {
                        return;
                    } else {
                        this.returnFunc();
                    }
                    break;
                }

                case OP.HALT: {
                    const elm = createElement(this.name, { }, ...this.children);
                    return elm;
                }
                default:
                    throw new Error(`Unknown opcode: ${opcode}`);
            }
        }
    }

    push(value: stack_value_t) {
        this.pushN(1, [value]);
    }

    pushN(n: number, values: stack_value_t[]) {
        for (let i = 0; i < n; i++) {
            this.stack[this.sp] = values[i]!;
            this.sp += 1;
        }
    }

    pop() {
        return this.popN(1)[0]!;
    }

    popN(n: number): stack_value_t[] {
        const values: stack_value_t[] = [];

        for (let i = 0; i < n; i++) {
            this.sp -= 1;
            values.push(this.stack[this.sp]!);
            delete this.stack[this.sp];
        }

        return values;
    }

    callFunc(jumpIp: number, nArgs: number) {
        // collect args
        const captureArgs = this.popN(nArgs);

        // push ip first and then arguments
        this.push(this.ip);
        this.push(this.fp);
        this.fp = this.sp;

        this.pushN(nArgs, captureArgs);
        this.push(nArgs);

        // jump
        this.ip = jumpIp - 1;
    }

    returnFunc() {
        const returnValue = this.pop()!;

        this.sp = this.fp;
        this.fp = Number(this.pop());
        this.ip = Number(this.pop());
        this.push(returnValue);
    }

    nativeCallFunc(functionName: string) {
        switch (functionName) {
            case "log": {
                const nArgs = Number(this.pop());
                const args = [];
                for (let i = 0; i < nArgs; i++) {
                    args.push(this.pop());
                }

                console.debug(...args);
                this.push(0);
                break;
            }

            default:
                throw new Error(`${functionName} not found`);
        }
    }
}
