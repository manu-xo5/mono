import * as A from "arcsecond";
import { tag } from "./helpers";
import { Tokenizer } from ".";

const floatNumber = A.sequenceOf([A.digits, A.char("."), A.digits]).map((x) =>
  x.join(""),
);

export const numberLiteral = A.choice([floatNumber, A.digits]).map(
  tag("NumberLiteral" as const),
);

export const nullLiteral = A.str("null").map(tag("NullLiteral" as const));

export const booleanLiteral = A.choice([A.str("true"), A.str("false")]).map(
  tag("BooleanLiteral" as const),
);

// string literal
const betweenSingleQuotes = A.between(A.char("'"))(A.char("'"));
const betweenDoubleQuotes = A.between(A.char('"'))(A.char('"'));

export const stringLiteral = A.choice([
  betweenSingleQuotes(A.letters),
  betweenDoubleQuotes(A.letters),
]).map(tag("StringLiteral" as const));

/////////////////////

export const createLiteralFactory = (tokenizer: Tokenizer) => ({
  NumberLiteral() {
    const token = tokenizer.eat("NumberLiteral");
    return {
      name: token.name,
      value: Number(token.value),
    };
  },

  StringLiteral() {
    const token = tokenizer.eat("StringLiteral");
    return {
      name: token.name,
      value: token.value.slice(1, -1),
    };
  },
});
