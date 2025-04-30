import { Parser } from "@/parser/index.js";
import { Eval } from "./interpreter/index.js";
import { Lexer } from "./tokenizer/index.js";

void (function main() {
    const program = `
    function main() {}
    let m = main()`;

    const ast = Parser.parse(program);
    console.debug(ast);
    console.debug("----------");
    Eval.runMachine("main", ast);
}());
