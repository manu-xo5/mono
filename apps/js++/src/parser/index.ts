import * as Tokenizer from "@/tokenizer/index.js";
import * as expr from "./expr/index.js";
import * as stmt from "./stmt/index.js";

function parse(code: string) {
    const tokenizer = Tokenizer.new();
    tokenizer.init(code);
    const program: unknown[] = [];

    try {
        while (tokenizer.has_token()) {
            const x = stmt.parse_stmt(tokenizer);
            program.push(x);
        }

        return program;
    }
    finally {
        try {
            if (tokenizer.has_token()) {
                console.debug("debug");
                console.debug(`source: "${tokenizer.source.substring(tokenizer.cursor)}"`);

                while (tokenizer.has_token()) {
                    console.debug(tokenizer.eat(tokenizer.current_token().name));
                }
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
