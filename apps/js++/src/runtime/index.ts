import { createElement } from "react";
import * as React from "react";

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
    LOD,
    MOV, // MOVe

    RET, // RETurn
    HALT, // HALT

    CAL, // CALl
    NATC, // NATive Code

    FUNC,

    STP,
    ELM,
}

const nativeCode = {
  "log": (...arg: any[]) => console.log(...arg)
}

export class Runtime {
    stack: object[] = [];
    registers: Record<string, object> = {};
    propsAcc: Record<string, any> = {};
    children: React.ReactElement[] = [];
    labels: Record<string, [number, ...any[]][]> = {};
    sp: number = 0;

    constructor(public name: string, public instruction: [number, ...any[]][]) {}

    // Execute opcode
    execute() {
        for (let ip = 0; ip < this.instruction.length; ip++) {
            const [opcode, ...args] = this.instruction[ip]!;

            console.log(opcode);
            switch (opcode) {
                case OP.PSH:
                    this.stack.push(args[0]);
                    break;
                case OP.POP:
                    this.stack.pop();
                    break;
                case OP.LOD: {
                    const [name] = args;
                    const value = this.stack.pop()!;
                    this.registers[name] = value;
                    break;
                }
                case OP.STP: {
                    const name = args[0];
                    const value = this.stack.pop()!;
                    this.propsAcc[name] = value;
                    break;
                }
                case OP.ELM: {
                    const name = args[0];
                    const props = {...this.propsAcc};
                    this.propsAcc = {};

                    this.children.push(createElement(
                      name,
                      { ...props }
                    ))
                    break;
                }

                case OP.FUNC: {
                  break
                }
                case OP.CAL: {
                    this.sp = ip;
                    ip = 7;
                    console.log(ip, this.sp);
                    break;
                }
                case OP.NATC: {
                    const name = args[0];
                    const argN = Number(this.stack.pop()!);
                    const acc:object[] = [];
                    let i = 0;
                    while(i++ < argN) {
                      acc.push(this.stack.pop()!);
                    }
                    if (!(name in nativeCode)) {
                        throw new Error(`${name} function not found`);
                    }

                    const fn = nativeCode[name as keyof typeof nativeCode]
                    if (!fn) {
                        throw new Error(`${name} function not found`);
                    }

                    const value = fn()!;
                    this.stack.push(value);
                    break;
                }

                case OP.MOV: {
                    const [name, value] = args;
                    this.registers[name] = value;
                    break;
                }

                case OP.RET: {
                    ip = this.sp - 1;
                    break;
                }
                
                case OP.HALT: {
                    const elm = createElement(this.name, { children: this.children });
                    console.log('returning', elm);
                    return elm;
                }
                default:
                    throw new Error(`Unknown opcode: ${opcode}`);
            }
        }
    }

    // Start a render block for an element
    // renderStart(tagOrComponent) {
    //     this.elementStack.push({
    //         tag: tagOrComponent,
    //         props: {},
    //         children: [],
    //     });
    // }

    // End the render block and add to the final element
    // renderEnd() {
    //     const ctx = this.elementStack.pop();
    //     const el = this.createElementOrComponent(ctx);
    //     if (this.elementStack.length > 0) {
    //         this.elementStack[this.elementStack.length - 1].children.push(el);
    //     }
    //     else {
    //         this.rootElement = el;
    //     }
    // }

    // Call a function (subroutine) and handle arguments from the stack
    // or built-in JavaScript functions (like `console.log`)
    callFunc(funcName: string) {
        
    }
}
