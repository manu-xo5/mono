export enum OP {
    // stack operations
    PSH,
    LOCAL,
    LOAD,
    RET, // RETurn

    JNZ,
    JMP,

    CALL, // CALl
    NATC, // NATive Code

    ELM,
    TXT,
    LOC, // LOad Children
}

export type ptr_t = { ptr: number };

export type stack_value_t =
    | string
    | number
    | object
    | ptr_t
    | (string | number)[];

export type instr_t = [OP, ...any[]];
