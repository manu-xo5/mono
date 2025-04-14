import * as A from "arcsecond";
import {
  booleanLiteral,
  nullLiteral,
  numberLiteral,
  stringLiteral,
} from "./literal";
import { betweenParan, commaSep } from "./helpers";

export const primaryExpression = A.choice([
  numberLiteral,
  nullLiteral,
  booleanLiteral,
  stringLiteral,
]);

export const expression = A.recursiveParser(() =>
  A.choice([primaryExpression, callExpression]),
);

const argumentsParser = betweenParan(commaSep(expression));

export const callExpression = A.sequenceOf([A.letters, argumentsParser]).map(
  ([indentifier, args]) => ({
    name: "FunctionCall",
    indentifier,
    arguments: args,
  }),
);
