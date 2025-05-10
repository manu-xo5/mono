import "@/runtime/test";

const todo = () => new Error("not implemented");

export class FuctionRuntime {
  locals: Record<string, stack_value_t> = {};
  mem_stack: stack_value_t[] = [];

  acc: stack_value_t = 0;
  children: React.ReactNode[] = [];

  r1: stack_value_t = 0;
  r2: stack_value_t = 0;
  r3: stack_value_t = 0;
  r4: stack_value_t = 0;

  sp: number = 0;
  ip: number = 0;
  fp: number = 0;
  constructor(public program: readonly instr_t[]) {}

  run() {
    for (this.ip = 0; this.ip < this.program.length; this.ip++) {
      const instruction = this.program[this.ip]!;
      this.execute(instruction);
    }

    return this.children[this.children.length - 1];
  }

  execute(instruction: instr_t) {
    const [inst, ...args] = instruction;

    switch (inst) {
      // vm
      case OP.PSH: {
        this.push(args[0]!);
        break;
      }

      case OP.POP: {
        this.pop();
        break;
      }

      case OP.LOCAL: {
        const name = String(args[0]);
        const value = args[1]!;
        this.locals[name] = value;
        break;
      }

      // loads a ptr or literal to acc
      case OP.LOAD: {
        const value = args[0]!;
        this.acc = value;
        break;
      }

      case OP.JMP: {
        const jumpAddr = Number(args[0]!);
        this.ip += jumpAddr;
        break;
      }

      // react
      case OP.TXT: {
        const str = String(args[0]);
        this.children.push(this.resolveValue(str) as string[]);
        break;
      }

      case OP.ELM: {
        const name = String(args[0]);
        const props = typeof this.r3 !== "object" ? {} : this.r3;

        const children = [...this.children];
        this.children = [];

        this.children.push(createElement(name, props, children));
        break;
      }

      case OP.CALL:
        throw todo();

      case OP.NATC:
        this.nativeCallFunc(String(args[0]));
        break;

      case OP.RET: {
        return;
      }

      default:
        throw new Error(`Unknown opcode: ${OP[inst]}`);
    }
  }

  fetch(value: stack_value_t) {
    if (typeof value === "object" && "ptr" in value) {
      return this.mem_stack[value.ptr]!;
    } else {
      return value;
    }
  }

  push(value: stack_value_t) {
    this.mem_stack[this.sp++] = value;
  }

  pop() {
    const value = this.mem_stack[--this.sp];

    return value;
  }

  resolveValue(value: unknown) {
    if (typeof value !== "string") {
      throw new TypeError(`Expect a string, found ${typeof value}`);
    }

    if (value.startsWith("$")) {
      return value.substring(1);
    } else {
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
