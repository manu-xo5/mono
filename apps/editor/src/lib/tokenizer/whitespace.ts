import * as A from "arcsecond";
import { tag } from "./helpers";

export const spaceSeperator = A.many(A.char(" "))
  .map((data) => data.join(""))
  .map(tag("SpaceChar"));
export const whitespaceSeperator = A.choice([spaceSeperator]);

export const whiteSpaceSurrounded = A.between(spaceSeperator)(spaceSeperator);
