import { Tokenizer } from "@/lib/tokenizer";

export type t_expr<name extends string = string> = {
  name: name;
};

type t_primary_expr = t_expr<
  "NumberLiteral" | "StringLiteral" | "Identifier"
> & {
  value: string;
};
function parse_primary_expr(tokenizer: Tokenizer): t_primary_expr {
  const token = tokenizer.current_token();

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

// helper type for defining and return type of binary parser
type t_binary_expr = t_expr<"BinaryExpr"> & {
  left: t_expr;
  operator: string;
  right: t_expr;
};
/** @ts-expect-error not being used rn */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function is_binary_expr(value: t_expr): value is t_binary_expr {
  const binary_expr_name: t_binary_expr["name"] = "BinaryExpr";
  return value.name === binary_expr_name;
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

export function parse_additive_expr(tokenizer: Tokenizer): t_binary_expr {
  let left = parse_multiplicative_expr(tokenizer) as unknown as t_binary_expr;

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

export function parse_multiplicative_expr(tokenizer: Tokenizer): t_binary_expr {
  let left = parse_primary_expr(tokenizer) as unknown as t_binary_expr;

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

export function parse_expr(tokenizer: Tokenizer): t_expr {
  return parse_additive_expr(tokenizer);
}
