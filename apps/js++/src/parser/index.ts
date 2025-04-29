import * as Tokenizer from "@/tokenizer/index.js";
import * as expr from "./expr/index.js";
import * as stmt from "./stmt/index.js";

function parse(code: string) {
    const tokenizer = Tokenizer.new();
    tokenizer.init(code);
    const body: unknown[] = [];

    try {
        body.push(stmt.parse_stmt(tokenizer));
        return body;
    }
    finally {
        try {
            console.debug("debug");
            while (tokenizer.has_token()) {
                console.debug(tokenizer.eat(tokenizer.current_token().name));
            }
        }
        catch {
            console.debug("errrr");
        }
    }
}

export {
    expr,
    parse,
    stmt,
};
