import * as A from "arcsecond";
import { primaryExpression } from "./expression";

const emptyArgumentList = A.sequenceOf([A.char("("), A.char(")")]);

const nArgumentList = A.sequenceOf([
  primaryExpression,
  A.many(A.sequenceOf([A.char(","), primaryExpression])),
]);

const argumentList = A.choice([emptyArgumentList, nArgumentList]);

export const functionCall = A.sequenceOf([A.letters, argumentList]);
