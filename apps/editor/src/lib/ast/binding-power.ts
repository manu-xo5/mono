import { Tokenizer, TokenType } from "@/lib/tokenizer";
import { binary_expr, primary_expr, t_ast_expr } from "@/lib/ast/expr";

const primary_bp = 0;
const additive_bp = 1;
const multipli_bp = 2;

export const bp_table: Record<TokenType, number> = {
  NumberLiteral: primary_bp,
  StringLiteral: primary_bp,
  Identifier: primary_bp,

  Plus: additive_bp,
  Times: multipli_bp,
};

export const nud_handler: Record<
  TokenType,
  (tokenizer: Tokenizer) => t_ast_expr
> = {
  NumberLiteral: primary_expr,
  StringLiteral: primary_expr,
  Identifier: primary_expr,
};

export const led_handler: Record<
  TokenType,
  (tokenizer: Tokenizer, left: t_ast_expr, bp: number) => t_ast_expr
> = {
  Plus: binary_expr,
  Times: binary_expr,
};
