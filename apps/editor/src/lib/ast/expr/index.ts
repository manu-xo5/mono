import { bp_table, led_handler, nud_handler } from "@/lib/ast/binding-power";
import { Tokenizer } from "@/lib/tokenizer";
import {
  EofError,
  TokenizerSyntaxError,
  humanizeListJoin,
} from "@/lib/tokenizer/helpers";
import { assert } from "@/lib/utils";

export type t_ast_expr = {
  name: string;
  value: number | string;
};

export function parse_expr(tokenizer: Tokenizer, bp: number): t_ast_expr {
  const nud_token = tokenizer.lookahead();

  const nud_fn = nud_handler[nud_token.name];
  assert(!!nud_fn, "expected a 'expr;'");

  let left = nud_fn(tokenizer);

  if (tokenizer.lookahead().name === "Semicolon") {
    return left;
  }

  let next_bp: number;
  while ((next_bp = bp_table[tokenizer.lookahead().name]) > bp) {
    const led_token = tokenizer.lookahead();

    const led_fn = led_handler[led_token.name];
    assert(!!led_fn, "expected a 'operator-token'");

    left = led_fn(tokenizer, left, next_bp);
  }

  return left;
}

const number_expr = (value: number) => {
  return {
    name: "number_expr",
    value,
  };
};

const string_expr = (value: string) => {
  return {
    name: "string_expr",
    value,
  };
};

const symbol_expr = (value: string) => {
  return {
    name: "symbol_expr",
    value,
  };
};

export function primary_expr(tokenizer: Tokenizer): t_ast_expr {
  const token = tokenizer.lookahead();
  if (!token) throw new EofError("PrimaryExpression");

  switch (token.name) {
    case "NumberLiteral": {
      const { value } = tokenizer.eat("NumberLiteral");
      return number_expr(+value);
    }
    case "StringLiteral": {
      const { value } = tokenizer.eat("StringLiteral");
      return string_expr(value);
    }
    case "Identifier": {
      const { value } = tokenizer.eat("Symbol");
      return symbol_expr(value);
    }

    default: {
      throw new TokenizerSyntaxError({
        gotName: token.name,
        gotValue: token.value,
        expectedName: humanizeListJoin(["Literal", "Identifier"]),
      });
    }
  }
}

export function binary_expr(
  tokenizer: Tokenizer,
  left: t_ast_expr,
  bp: number,
) {
  const lookahead = tokenizer.lookahead();
  assert(!!lookahead, "unexpected end of input, expected operator");

  assert(
    lookahead.name in led_handler,
    new TokenizerSyntaxError({
      expectedName: "BinaryOperator",
      gotName: lookahead.name,
      gotValue: lookahead.value,
    }).message,
  );

  const operatorToken = tokenizer.eat(lookahead.name);
  const right = parse_expr(tokenizer, bp);

  return {
    left: left,
    operator: operatorToken,
    right: right,
  } as unknown as t_ast_expr;
}
