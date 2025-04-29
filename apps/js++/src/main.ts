import * as Parser from "@/parser/index.js";
import * as Tokenizer from "@/tokenizer/index.js";

void (function main() {
    const program = `(1 + 21 + 3)`;
    const tokenizer = Tokenizer.new()
    tokenizer.init(program);
    while(tokenizer.has_token()) {
      console.dir(tokenizer.eat(tokenizer.current_token().name))
    }

    return;
    const body = Parser.parse(program);
    console.dir(body, {
        depth: null,
    });
}());
