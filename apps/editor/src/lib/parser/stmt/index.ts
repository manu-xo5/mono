import { Tokenizer } from "@/lib/tokenizer";
import { parse_additive_expr, parse_expr } from "@/lib/parser/expr";

const expr_stmt = (tokenizer: Tokenizer) => {
  const expr = parse_additive_expr(tokenizer);
  //tokenizer.eat("Semicolon");

  return expr;
};

export const parse_stmt = (tokenizer: Tokenizer) => {
  return expr_stmt(tokenizer);
};
