// 0 + 0
// 0 + 9 + 1
// (x + y)
// (x + y) + z ;|\n
import * as A from "arcsecond";
import { numberLiteral } from "../literal";
import { whiteSpaceSurrounded } from "../whitespace";

const operatorsParser = A.choice([A.char("+"), A.char("-")]);

export const binaryOperatorParser = A.sequenceOf([
  whiteSpaceSurrounded(numberLiteral),
  operatorsParser,
  whiteSpaceSurrounded(numberLiteral),
  whiteSpaceSurrounded(A.lookAhead(A.possibly(operatorsParser))),
]).chain(([x, op, y, next]) => {
  if (next == null) {
    return A.succeedWith({
      name: "BinaryOperator",
      left: x,
      right: y,
      operator: op,
    });
  } else {
    return binaryOperatorParser;
  }
});

//.map(([x, op, y]) => ({
//  name: "BinaryOperator",
//  left: x,
//  right: y,
//  operator: op,
//}));
