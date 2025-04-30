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

export function parse_additive_expr(tokenizer: lexer_t): binary_expr_t {
    let left = parse_multiplicative_expr(tokenizer) as unknown as binary_expr_t;

    while (["Plus", "Dash"].includes(tokenizer.current_token().name)) {
        const operator = tokenizer.eat(tokenizer.current_token().name).name;
        const right = parse_multiplicative_expr(tokenizer);

        left = {
            name: "BinaryExpr",
            left,
            operator,
            right,
        };
    }

    return left;
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

function parse_primary_expr(tokenizer: lexer_t): primary_expr_t | t_expr {
    const token = tokenizer.current_token();

    switch (token.name) {
        case "NumberLiteral":
        case "Identifier": {
            const { value } = tokenizer.eat(token.name);
            return {
                name: token.name,
                value,
            };
        }
        case "StringLiteral": {
            const { value } = tokenizer.eat(token.name);
            return {
                name: token.name,
                value: value.substring(1, value.length - 1),
            };
        }
        case "Paran": {
            tokenizer.eat("Paran");
            const expr = parse_expr(tokenizer);
            tokenizer.eat("Paran");
            return expr;
        }

        default: {
            throw tokenizer.ERR_SYNTAX(["Literal", "Identifier"]);
        }
    }
}

export function parse_expr(tokenizer: lexer_t): t_expr {
    return parse_additive_expr(tokenizer);
}
