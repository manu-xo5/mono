import { Tokenizer } from "@/lib/tokenizer";
import { primary_expr } from "@/lib/ast/expr";

export const expr_stmt = (tokenizer: Tokenizer) => {
  const expr parse_expr(tokenizer);
  tokenizer.eat("Semicolon");
};
