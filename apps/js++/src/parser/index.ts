import type { lexer_t } from "@/tokenizer/index.js";
import type { t_expr } from "./expr/index.js";
import { Lexer } from "@/tokenizer/index.js";
import { parse_expr } from "./expr/index.js";

type stmt = var_stmt_t;

type var_stmt_t = {
    kind: "var";
    symbol: string;
    value: t_expr;
};

function var_stmt(lexer: lexer_t): var_stmt_t {
    lexer.eat("Identifier");
    const varName = lexer.eat("Identifier").value;

    lexer.eat("Equal");

    const value = parse_expr(lexer);

    return {
        kind: "var",
        symbol: varName,
        value,
    };
}

function parse(code: string) {
    const lexer = Lexer.new();
    lexer.init(code);

    const program: stmt[] = [];

    try {
        while (lexer.has_token()) {
            const current = lexer.current_token();

            if (current.name === "Identifier" && current.value === "let") {
                program.push(var_stmt(lexer));
            }
            else {
                throw lexer.ERR_SYNTAX("Identifier");
            }
        }

        return program;
    }
    finally {
        try {
            if (lexer.has_token()) {
                console.debug("debug");
                console.debug(`source: "${lexer.source.substring(lexer.cursor)}"`);

                while (lexer.has_token()) {
                    console.debug(lexer.eat(lexer.current_token().name));
                }
            }
        }
        catch {
            console.debug("errrr");
        }
    }
}

export const Parser = {
    parse,
};

export type { stmt };
