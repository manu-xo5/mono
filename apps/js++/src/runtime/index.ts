import "@/runtime/test";

const todo = () => new Error("not implemented");

export class FunctionRuntime {
    locals: Record<string, any> = {};

    dump() {
        console.debug(JSON.stringify(this.locals, null, 3));
    }
}
