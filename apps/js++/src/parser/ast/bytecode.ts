import type { instr_t } from "@/runtime/instructions.ts";

export type Bytecode = {
    generate_bytecode: () => instr_t[];
};
