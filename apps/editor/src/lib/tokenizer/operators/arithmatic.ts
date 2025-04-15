import * as A from "arcsecond";
import { numberLiteral } from "literals";
import { token } from "../whitespace";

const operator = A.char("+");

type BiOp = {
  name: "BinaryExpression";
  left: number | string | BiOp;
  right: number | string | BiOp;
  op: string;
};

const mapToBinaryOperation = ([left, op, right]: [
  BiOp["left"],
  string,
  BiOp["right"],
]): BiOp => ({
  name: "BinaryExpression",
  left: left,
  right: right,
  op: op,
});

// bi-op
// :  expr  |  bi-op  + expr
// ; (bi-op)

const numberToken = token(numberLiteral).map((x) => +x.value);
const identifierToken = token(A.letters).map((x) => "Identifier(" + x + ")");
const callExpr = A.sequenceOf([token(A.letters), A.str("()")]).map(
  ([x]) => "FunctionCall(" + x + ")",
);

const exprToken = A.choice([callExpr, identifierToken, numberToken]);

const arithmaticParser = A.coroutine((run) => {
  //

  function parseRightLeaf(left: BiOp["left"], l: number) {
    const mayBeEndOfNest = run(A.possibly(A.lookAhead(A.char(")"))));
    if (mayBeEndOfNest != null) {
      run(A.char(")")); // eat `)`
      return left;
    }

    const mayBeOp = run(A.possibly(A.lookAhead(operator)));
    if (mayBeOp == null) return left;

    const op = run(operator);
    const right = parseExpression(l);
    return mapToBinaryOperation([left, op, right]);
  }

  // 1 + 2 + 3
  function parseExpression(l: number): BiOp["left"] {
    let left: BiOp["left"];

    const mayBeNested = run(A.possibly(A.lookAhead(A.char("("))));
    if (mayBeNested == null) {
      left = run(exprToken);
    } else {
      run(A.char("(")); // eat `(`
      left = parseExpression(l + 1);
    }

    while (true) {
      const node = parseRightLeaf(left, l);
      if (node == left) break;

      left = node;
    }

    return left;
  }

  return parseExpression(0);
});

export { arithmaticParser  };
