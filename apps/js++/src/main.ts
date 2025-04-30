import { Parser } from "@/parser/index.js";
import { Eval } from "./interpreter/index.js";

void (function main() {
    const program = `
    let x = (1 + 21 + 3 + (111))
    let y = "hello"
    let z = x
    `;

    const ast = Parser.parse(program);
    console.debug(ast);
    console.debug("----------");
    console.debug(Eval.runMachine("main", ast));
}());
