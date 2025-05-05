export enum OP {
    // stack operations
    LOCAL,

    RET, // RETurn

    CALL, // CALl
    NATC, // NATive Code

    ELM,
    TXT,
    LOC, // LOad Children
}

export type stack_value_t =
    | string
    | number
    | object
    | (string | number)[];

export type instr_t = [OP, ...any[]];
export type ptr_t = { ptr: number };
export type lit_t = stack_value_t;
