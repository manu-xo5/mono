import * as A from "arcsecond";
import { tag } from "./helpers";

export const numberLiteral = A.digits.map(tag("NumberLiteral" as const));

export const nullLiteral = A.str("null").map(tag("NullLiteral" as const));

export const booleanLiteral = A.choice([A.str("true"), A.str("false")]).map(
  tag("BooleanLiteral" as const),
);

export const stringLiteral = A.choice([
  A.between(A.char('"'))(A.char('"'))(A.letters),
  A.between(A.char("'"))(A.char("'"))(A.letters),
]).map(tag("StringLiteral"as const));
