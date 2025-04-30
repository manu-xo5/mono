import type { lexer_t } from "@/tokenizer/index.js";

export type t_expr<name extends string = string> = {
    name: name;
};

type primary_expr_t = t_expr<"NumberLiteral" | "StringLiteral" | "Identifier"> & { value: string };

// helper type for defining and return type of binary parser
type binary_expr_t = t_expr<"BinaryExpr"> & {
    left: t_expr;
    operator: string;
    right: t_expr;
};

/* Orders Of Prescedence
 * AssignmentExpr
 * MemberExpr
 * FunctionCall
 * LogicalExpr
 * ComparisonExpr
 * AdditiveExpr
 * MultiplicitaveExpr
 * PrimaryExpr
 */

function parse_primary_expr(lexer: lexer_t): primary_expr_t | t_expr {
    const token = lexer.current_token();

    switch (token.name) {
        case "NumberLiteral": {
            void lexer.eat(token.name);

            return {
                name: token.name,
                value: token.value,
            };
        }
        case "StringLiteral": {
            void lexer.eat(token.name);
            return {
                name: token.name,
                value: token.value.substring(1, token.value.length - 1),
            };
        }
        case "Identifier": {
            if (lexer.lookahead().value === "(") {
                void lexer.eat(token.name);
                void lexer.eat("Paran");
                void lexer.eat("Paran");

                return {
                    name: "FuncCall",
                    value: token.value,
                } as unknown as primary_expr_t;
                // todo: ^^^
            }
            else {
                void lexer.eat(token.name);
                return {
                    name: "Reference",
                    value: token.value,
                } as unknown as primary_expr_t;
            }
        }
        case "Paran": {
            lexer.eat("Paran");
            const expr = parse_expr(lexer);
            lexer.eat("Paran");
            return expr;
        }
        default: {
            throw lexer.ERR_SYNTAX(["Literal", "Identifier"]);
        }
    }
}

export function parse_multiplicative_expr(tokenizer: lexer_t): binary_expr_t {
    let left = parse_primary_expr(tokenizer) as unknown as binary_expr_t;

    while (["Times", "Slash"].includes(tokenizer.current_token().name)) {
        const operator = tokenizer.eat(tokenizer.current_token().name).name;
        const right = parse_primary_expr(tokenizer);

        left = {
            name: "BinaryExpr",
            left,
            operator,
            right,
        };
    }

    return left;
}

export function parse_additive_expr(lexer: lexer_t): binary_expr_t {
    let left = parse_multiplicative_expr(lexer) as unknown as binary_expr_t;

    while (["Plus", "Dash"].includes(lexer.current_token().name)) {
        const operator = lexer.eat(lexer.current_token().name).name;
        const right = parse_multiplicative_expr(lexer);

        left = {
            name: "BinaryExpr",
            left,
            operator,
            right,
        };
    }

    return left;
}

export function parse_expr(tokenizer: lexer_t): t_expr {
    return parse_additive_expr(tokenizer);
}
