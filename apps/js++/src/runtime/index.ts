import type * as React from "react";

type data_type = any;

// const insArr_literal = [
//    ["MOV_LIT_REG", "count", "value123"],
//    ["RET_REG", "count", "", ""],
//    // ["RET_LIT", "count", "", ""],
// ] as [string, string, string, data_type ][];

// example for array literal with copy,
// same applied for objects
// const insArr_arr = [
//    ["MOV_LIT_REG", "count", [12, 3, 2]],
//    ["MEM_CPY", "count3", "count"],
//    ["MOV_REG_REG", "count2", "count"],
//    ["RET_REG", "count2", "", ""],
//    // ["RET_LIT", "count", "", ""],
// ] as [string, string, string, data_type ][];

/**
 * @example for jump
 * const insArr_jump = [
 *     [OP.MOV_LIT_REG, "count", [12, 3, 2]],
 *     [OP.CPY_REG_REG, "count3", "count"],
 *     [OP.MOV_REG_REG, "count2", "count"],
 *     [OP.JMP, "5"],
 *     [OP.RET_REG, "count2", "", ""],
 *     [OP.MOV_LIT_REG, "x", 1],
 *     [OP.RET_REG, "x"],
 * ] as [number, string, string, data_type][];
 */

enum OP {
    MOV_LIT_REG,
    MOV_REG_REG,
    CPY_REG_REG,
    RET_REG,
    JMP,
}

type OPERATION = [OP, string, data_type, string][];

const insArr_jump = {
    start: [
        [OP.MOV_LIT_REG, "count", [12, 3, 2], ""],
        [OP.CPY_REG_REG, "count3", "count", ""],
        [OP.MOV_REG_REG, "count2", "count", ""],
        [OP.JMP, "other", "", ""],
        [OP.RET_REG, "count2", "", ""],
    ],
    other: [
        [OP.MOV_LIT_REG, "x", 1, ""],
        [OP.RET_REG, "x", "", ""],
    ],
} satisfies Record<string, OPERATION>;

function runMachine<Program extends Record<string, OPERATION>>(program: Program): React.ReactNode {
    let label: keyof typeof program = "start";

    const mem_stack: unknown[] = [];
    const heap: Record<
        string,
        | { type: "literal"; value: string | number }
        | { type: "pointer"; value: number }
    > = {};

    try {
        let ip = 0;
        while (ip < program[label]!.length) {
            const ins = program[label]![ip]!;
            const [opCode, ...args] = ins;

            switch (opCode) {
                case OP.JMP: {
                    const [labelTarget] = args;
                    ip = 0;
                    label = labelTarget as keyof typeof program;
                    continue;
                }
                case OP.RET_REG: {
                    const [regName] = args;
                    const pointer = heap[regName];
                    if (pointer?.type === "pointer") {
                        return mem_stack[pointer.value] as string;
                    }
                    else {
                        return pointer?.value ?? 0;
                    }
                }
                case OP.MOV_LIT_REG: {
                    const [regName, value] = args;
                    const top = mem_stack.length;

                    heap[regName] = {
                        type: "pointer",
                        value: top,
                    };
                    mem_stack.push(value);
                    break;
                }
                case OP.MOV_REG_REG: {
                    const [regTo, regFrom] = args;
                    const pointer = heap[regFrom]!.value as number;

                    heap[regTo] = {
                        type: "pointer",
                        value: pointer,
                    };

                    break;
                }
                case OP.CPY_REG_REG: {
                    const [regTo, regFrom] = args;
                    const pointer = heap[regFrom]!.value as number;
                    const copiedValue = Object.create(mem_stack[pointer]!);

                    const top = mem_stack.length;
                    mem_stack.push(copiedValue);
                    heap[regTo] = {
                        type: "pointer",
                        value: top,
                    };

                    break;
                }
            }
            ip++;
        }
    }
    finally {
        // console.dir("---------");
        // console.dir(JSON.stringify(mem_stack, null, 4));
        // console.dir(JSON.stringify(heap, null, 4));
    }
}

export const Runtime = {
    runMachine,
};

declare const Deno: boolean | undefined;

if (Deno) {
    console.debug(runMachine(insArr_jump));
}
