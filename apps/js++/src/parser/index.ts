import type { stack_ptr } from "@/interpreter/eval_expr.js";
import type { lexer_t } from "@/tokenizer/index.js";
import type { t_expr } from "./expr/index.js";
import { FormatList } from "@/format/array.js";
import { Lexer } from "@/tokenizer/index.js";
import { parse_expr } from "./expr/index.js";

const PARSER_MAP = {
    let: var_stmt,
    function: func_stmt,
} as const;

const FUNC_BODY_INTERPRETER = {
    let: var_stmt,
    return: return_stmt,
} as const;

type stmt = var_stmt_t | func_stmt_t;

type var_stmt_t = {
    kind: "var_declaration";
    symbol: string;
    value: t_expr;
};
export type func_stmt_t = {
    kind: "func_declaration";
    symbol: string;
    body: ReturnType<typeof FUNC_BODY_INTERPRETER[keyof typeof FUNC_BODY_INTERPRETER]>[];
};
type return_stmt_t = {
    kind: "return";
    value: number | string | stack_ptr;
};

function var_stmt(lexer: lexer_t): var_stmt_t {
    lexer.eat("Identifier");
    const varName = lexer.eat("Identifier").value;

    lexer.eat("Equal");

    const value = parse_expr(lexer);

    return {
        kind: "var_declaration",
        symbol: varName,
        value,
    };
}

function return_stmt(lexer: lexer_t): return_stmt_t {
    let token = lexer.current_token();
    if (token.name !== "Identifier" && token.value !== "return") {
        throw ParserErr("return statement", token.value);
    }

    lexer.eat("Identifier");

    token = lexer.current_token();
    if (token.name !== "NumberLiteral" && token.name !== "StringLiteral") {
        throw ParserErr("expression", token.value);
    }
    lexer.eat(token.name);

    return {
        kind: "return",
        value: token.value,
    };
}

function func_stmt(lexer: lexer_t): func_stmt_t {
    lexer.eat("Identifier");
    const func_name = lexer.eat("Identifier").value;

    lexer.eat("Paran");
    lexer.eat("Paran");
    lexer.eat("OpenBracket");

    const func_body: func_stmt_t["body"] = [];
    while (true) {
        const token = lexer.current_token();

        if (token.name === "CloseBracket") {
            break;
        }
        else if (token.name === "Identifier" && token.value in FUNC_BODY_INTERPRETER) {
            const interpreter = FUNC_BODY_INTERPRETER[token.value as keyof typeof FUNC_BODY_INTERPRETER];
            const stmt = interpreter(lexer);
            func_body.push(stmt);
            continue;
        }

        throw ParserErr("Statement", token.value);
    }

    lexer.eat("CloseBracket");

    return {
        kind: "func_declaration",
        symbol: func_name,
        body: func_body,
    };
}

function parse(code: string) {
    const lexer = Lexer.new();
    lexer.init(code);

    const program: stmt[] = [];

    try {
        while (lexer.has_token()) {
            const current = lexer.current_token();

            if (current.name === "Identifier") {
                const parser = current.value in PARSER_MAP && PARSER_MAP[current.value as keyof typeof PARSER_MAP];
                if (parser) {
                    const stmt = parser(lexer);

                    program.push(stmt);
                    continue;
                }
            }

            throw ParserErr(FormatList.humanizeListJoin(["Variable", "Function Declaration"]), current.value);
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

function ParserErr(expected: string, found: string) {
    const error = new Error(`Expected '${expected}', got '${found}'`);
    error.name = ParserErr.name;
    return error;
}

export const Parser = {
    parse,
};

export type { stmt };
