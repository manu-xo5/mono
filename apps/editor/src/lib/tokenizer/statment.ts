import { Tokenizer } from ".";
import { createExpr } from "./expression";
import { createLiteralFactory } from "./literal";

const tokenizer = new Tokenizer();

export const { NumberLiteral, StringLiteral } = createLiteralFactory(tokenizer);
export const { PrimaryExpression, Expression } = createExpr(tokenizer);

export const expressionStmt = {
  run(source: string) {
    try {
      // const fun_source = `hello()`;
      // const source = `(hello.run)`;
      console.log("source", "^" + source + "$");
      tokenizer.init(source);

      const result = [Expression()];

      if (tokenizer.lookahead() != null) {
        console.log("-----Flush Tokenizer------");
        while (tokenizer.lookahead()) {
          console.log(tokenizer._eatDebug());
        }
        throw Error("Unexpected End of Input");
      }

      return {
        isError: false,
        result: result,
      };
    } catch (err) {
      return {
        isError: true,
        error: (err as Error).message,
        result: null,
      };
    }
  },
};
