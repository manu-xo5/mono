/** @deprecated file */
import { Tokenizer, TokenNode } from ".";
import {
  assertNodeToBe,
  assertNodeValue,
  EofError,
  TokenizerSyntaxError,
} from "./helpers";

type FunctionCallNode = {
  name: "FunctionCallExpr";
  symbol: string;
  args: TokenNode[];
};

type DotOpNode = {
  name: "DotOperationExpr";
  operand: ExpressionNode;
  access: string; // todo: should be symbol | identifierA
  accessType: "method" | "property";
};

type ExpressionNode = TokenNode | FunctionCallNode | DotOpNode;

export const createExpr = (tokenizer: Tokenizer) => {
  /*
    
    
    
    
  */

  const PrimaryExpression = (): ExpressionNode => {
    const token = tokenizer.lookahead();

    if (token == null) throw new EofError("Expression");

    if ("Paran" === token.name && token.value === ")") {
      throw new TokenizerSyntaxError({
        expectedName: "Primary Expression",
        gotName: token.name,
        gotValue: token.value,
      });
    }

    if ("NumberLiteral" === token.name) {
      return tokenizer.eat(token.name);
    }

    if ("Symbol" === token.name) {
      const symbol = tokenizer.eat("Symbol");

      const lookahead = tokenizer.lookahead();

      if (!lookahead) {
        // eof as symbol | variable
        return symbol;
      }

      if ("Paran" === lookahead.name && "(" === lookahead.value) {
        // as function call
        return CallExpr(symbol);
      } else {
        // as symbol | variable
        return symbol;
      }
    }

    if ("Paran" === token.name && "(" === token.value) {
      tokenizer.eat("Paran");

      const expr = Expression();
      const closingParan = tokenizer.eat("Paran");
      assertNodeValue(closingParan, ")");

      return expr;
    }

    throw new TokenizerSyntaxError({
      expectedName: "Primary Expression",
      gotName: token.name,
      gotValue: token.value,
    });
  };

  function CallExpr(symbol: TokenNode): FunctionCallNode {
    assertNodeToBe(symbol, "Symbol");

    const openParan = tokenizer.lookahead();

    assertNodeToBe(openParan, "Paran");
    assertNodeValue(openParan, "(");
    tokenizer.eat("Paran");

    const args: TokenNode[] = [];

    const closeParan = tokenizer.lookahead();

    assertNodeToBe(closeParan, "Paran");
    assertNodeValue(closeParan, ")");
    tokenizer.eat("Paran");

    return {
      name: "FunctionCallExpr",
      symbol: symbol.value,
      args,
    };
  }

  function DotOpExpr(operand: ExpressionNode | DotOpNode): DotOpNode {
    console.log(operand);
    assertNodeToBe(operand, [
      "NumberLiteral",
      "StringLiteral",
      "Symbol",
      "FunctionCallExpr",
      "DotOperationExpr",
    ]);

    tokenizer.eat("Dot");
    const access = tokenizer.eat("Symbol");
    const maybePropertyOrMethod = tokenizer.lookahead();

    const expr: DotOpNode = {
      name: "DotOperationExpr",
      operand,
      access: access.value,
      accessType: "property",
    };

    if (
      maybePropertyOrMethod &&
      "Paran" === maybePropertyOrMethod.name &&
      "(" === maybePropertyOrMethod.value
    ) {
      const openParan = tokenizer.eat("Paran");
      assertNodeValue(openParan, "(");
      const closeParan = tokenizer.eat("Paran");
      assertNodeValue(closeParan, ")");

      expr.accessType = "method";
    }

    const lookahead = tokenizer.lookahead();
    if (lookahead && lookahead.name === "Dot") {
      return DotOpExpr(expr);
    }

    return expr;
  }

  const OPERATORS = {
    ".": DotOpExpr,
  };

  function Expression(): ExpressionNode {
    const left = PrimaryExpression();

    const maybeOperator = tokenizer.lookahead();
    if (maybeOperator == null) {
      return left;
    }

    if (maybeOperator.value in OPERATORS) {
      const operator = OPERATORS[maybeOperator.value as keyof typeof OPERATORS];

      return operator(left);
    }

    return left;
  }

  return {
    Expression,
    PrimaryExpression,
  };
};
