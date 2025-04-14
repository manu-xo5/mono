import * as A from "arcsecond";
import { token } from "../whitespace";
import { numberLiteral } from "../literal";

const operator = A.char("+");

const operand = A.sequenceOf([token(operator), token(numberLiteral)]).map(
  ([, x]) => x.value,
);

const recurse: A.Parser<
  { left: string; right: string },
  string,
  { left: string }
> = A.sequenceOf([operand, A.possibly(A.lookAhead(operator))]).chainFromData(
  ({ result, data }) => {
    if (!result) return A.fail("failed");
    const value = {
      left: data.left,
      right: result[0],
    };

    if (result[1] == null) return A.succeedWith(value);

    return A.withData(recurse)({ left: value });
  },
);

export const binaryExpr = A.sequenceOf([
  token(numberLiteral),
  A.lookAhead(A.sequenceOf([operator, token(numberLiteral)])),
]).chain((result) => {
  if (!result) return A.fail("lool");

  return A.withData(recurse)({
    left: result[0],
    right: result[1][1],
  });
});
