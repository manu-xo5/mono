import * as JsInterpreter from "@/interpreter/index.js";
import * as Parser from "@/parser/index.js";

void (function main() {
    const program = `
    let x = (1 + 21 + 3 + (111))
    let y = x

    let z = y - x + 19
    `;

    // const lexer = Tokenizer.new();
    // lexer.init(program);
    // lexer.dump();

    const body = Parser.parse(program);
    const validate = body.every(value => typeof value === "object" && value != null);
    if (!validate) {
        throw new Error("invalid stmts");
    }
    JsInterpreter.run(body);
}());
