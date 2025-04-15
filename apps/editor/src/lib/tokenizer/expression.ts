import * as A from "arcsecond";
import {
  booleanLiteral,
  nullLiteral,
  numberLiteral,
  stringLiteral,
} from "./literal";
import { betweenParan, commaSep } from "./helpers";
import { arithmaticParser } from "./operators/arithmatic";
import { token } from "./whitespace";

export const primaryExpression = A.choice([
  stringLiteral,
  booleanLiteral,
  nullLiteral,
  numberLiteral,
]);

export const identifierToken = token(A.letters);

export const expression = A.recursiveParser(() =>
  A.choice([
    A.lookAhead(A.sequenceOf([A.digits, A.char("+")])).map(),
    //primaryExpression,
    //callExpression,
    //identifierToken,
  ]),
);

const argumentsParser = betweenParan(commaSep(expression));

export const callExpression = A.sequenceOf([A.letters, argumentsParser]).map(
  ([indentifier, args]) => ({
    name: "FunctionCall",
    indentifier,
    arguments: args,
  }),
);
