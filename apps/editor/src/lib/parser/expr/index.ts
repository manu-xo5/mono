import { Tokenizer, TokenType } from "@/lib/tokenizer";
import { assert } from "@/lib/utils";

export type t_expr<name extends string = string> = {
  name: name;
};

const primary_bp = 0;
const additive_bp = 1;
const multipli_bp = 2;

export const BP_TABLE: Partial<Record<TokenType, number>> = {
  NumberLiteral: primary_bp,
  StringLiteral: primary_bp,
  Identifier: primary_bp,

  Plus: additive_bp,
  Times: multipli_bp,
};

export const NUD_HANDLER: Partial<
  Record<TokenType, (tokenizer: Tokenizer) => t_expr>
> = {
  NumberLiteral: parse_primary_expr,
  StringLiteral: parse_primary_expr,
  Identifier: parse_primary_expr,
};

export const LED_HANDLER: Partial<
  Record<TokenType, (tokenizer: Tokenizer, left: t_expr, bp: number) => t_expr>
> = {
  Plus: binary_expr,
  Times: binary_expr,
};

type t_primary_expr = t_expr<
  "NumberLiteral" | "StringLiteral" | "Identifier"
> & {
  value: string;
};
function parse_primary_expr(tokenizer: Tokenizer): t_primary_expr {
  const token = tokenizer.peek();

  switch (token.name) {
    case "NumberLiteral":
    case "StringLiteral":
    case "Identifier": {
      const { value } = tokenizer.eat(token.name);
      return {
        name: token.name,
        value,
      };
    }

    default: {
      throw tokenizer.ERR_SYNTAX(["Literal", "Identifier"]);
    }
  }
}

type t_binary_expr = t_expr<"BinaryExpr"> & {
  left: t_expr;
  operator: string;
  right: t_expr;
};

function binary_expr(
  tokenizer: Tokenizer,
  left: t_expr,
  bp: number,
): t_binary_expr {
  const lookahead = tokenizer.peek();

  const operatorToken = tokenizer.eat(lookahead.name);
  const right = parse_expr(tokenizer, bp);

  return {
    name: "BinaryExpr",
    left: left,
    operator: operatorToken.name,
    right: right,
  };
}

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

export function parse_expr(tokenizer: Tokenizer, bp: number): t_expr {
  const nud_token = tokenizer.peek();

  const nud_fn = NUD_HANDLER[nud_token.name];
  assert(!!nud_fn, tokenizer.ERR_SYNTAX("expr;").message);

  let left = nud_fn(tokenizer);

  if (tokenizer.peek().name === "Semicolon") {
    return left;
  }

  let next_bp: number;
  while ((next_bp = BP_TABLE[tokenizer.peek().name] ?? 0) > bp) {
    const led_token = tokenizer.peek();

    const led_fn = LED_HANDLER[led_token.name];
    assert(!!led_fn, tokenizer.ERR_SYNTAX("operator-token").message);

    left = led_fn(tokenizer, left, next_bp);
  }

  return left;
}
