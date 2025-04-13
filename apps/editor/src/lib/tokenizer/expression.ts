import * as A from "arcsecond";
import {
  booleanLiteral,
  nullLiteral,
  numberLiteral,
  stringLiteral,
} from "./literal";

export const primaryExpression = A.choice([
  numberLiteral,
  nullLiteral,
  booleanLiteral,
  stringLiteral,
]);
