import { Tokenizer } from "@/lib/tokenizer";
import { parse_expr } from "@/lib/parser/expr";

const expr_stmt = (tokenizer: Tokenizer) => {
  const expr = parse_expr(tokenizer, 0);
  tokenizer.eat("Semicolon");

  return expr;
};

export const parse_stmt = (tokenizer: Tokenizer) => {
  return expr_stmt(tokenizer);
};
