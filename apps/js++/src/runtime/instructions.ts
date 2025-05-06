export enum OP {
  // stack operations

  PSH,
  POP,
  LOCAL,
  LOAD,

  JMP, // JUMP
  JNZ, // Jump If Not Zero

  RET, // RETurn

  JNZ,
  JMP,

  CALL, // CALl
  NATC, // NATive Code

  ELM,
  TXT,
}

export type ptr_t = { ptr: number };
export type stack_value_t =
  | string
  | number
  | object
  | ptr_t
  | (string | number)[];

export type instr_t = [OP, ...stack_value_t[]];

/**
 *
 * if (count < 10) {
 *  return 0;
 * }
 * else {
 *  return <div />
 * }
 */

let i = 0;
export function create_scope() {
  const locals: Record<string, stack_value_t> = {};

  function def(name: string, value: stack_value_t): instr_t[] {
    locals[name] = i++;
    return [[OP.PSH, value]];
  }

  function addr(name: string): ptr_t {
    return { ptr: Number(locals[name]) };
  }

  function load(name: string): instr_t[] {
    return [[OP.LOAD, addr(name)]];
  }

  function size() {
    return Object.keys(locals).length;
  }

  function destory() {
    i -= size();
  }

  return {
    def,
    addr,
    load,
    destory,
    size,
  };
}

// export function instr_local(program: instr_t[], name: string, value: stack_value_t, pc: number) {
//    const instructions: instr_t[] = [
//        [OP.LOCAL, name, value],
//    ];
//    program.push(...instructions);
//
//    return pc + instructions.length;
// }

export function instr_conditional(
  program: instr_t[],
  value: stack_value_t,
  if_true: (scope: ReturnType<typeof create_scope>) => instr_t[],
  if_false: (scope: ReturnType<typeof create_scope>) => instr_t[],
) {
  const pc = program.length;
  const true_scope = create_scope();
  const true_instr = if_true(true_scope);
  const true_cleanup = Array.from(
    { length: true_scope.size() },
    (): instr_t => [OP.POP],
  );

  const false_scope = create_scope();
  const false_instr = if_false(false_scope);
  const false_cleanup = Array.from(
    { length: false_scope.size() },
    (): instr_t => [OP.POP],
  );

  const addr_for_false = pc + 2 + true_instr.length + true_cleanup.length + 1;

  const instructions: instr_t[] = [
    [OP.LOAD, value],
    [OP.JNZ, addr_for_false], // jump over true block - condition failed skip to false/else

    ...true_instr,
    ...true_cleanup,
    [OP.JMP, addr_for_false + if_false.length + false_cleanup.length], // jump over false block - condition met executed true/if block

    ...false_instr,
    ...false_cleanup,
  ];

  return instructions;
}
