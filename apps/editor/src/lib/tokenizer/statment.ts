import { Tokenizer } from ".";
import { createLiteralFactory } from "./literal";

type AssignmentStmt = {
  family: "Stmt";
  name: "AssignmentStmt";
  identifier: string;
  value: unknown;
};

const tokenizer = new Tokenizer();

export const { NumberLiteral, StringLiteral } =
  createLiteralFactory(tokenizer);

export const assignmentStmt = {
  run(source: string) {
    try {
      tokenizer.init(source);

      const result = [tokenizer.lookahead()];

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
