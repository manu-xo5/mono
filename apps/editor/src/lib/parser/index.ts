import { Tokenizer } from "@/lib/tokenizer";
import * as expr from "./expr";
import * as stmt from "./stmt";

function parse(code: string) {
  const tokenizer = new Tokenizer();
  tokenizer.init(code);
  const body: unknown[] = [];

  try {
    body.push(stmt.parse_stmt(tokenizer));
    return body;
  } finally {
    try {
      console.log("debug");
      console.log(tokenizer._eatDebug());
      console.log(tokenizer._eatDebug());
      console.log(tokenizer._eatDebug());
      console.log(tokenizer._eatDebug());
      console.log(tokenizer._eatDebug());
    } catch {
      console.log("errrr");
    }
  }
}

export const parser = {
  ...expr,
  ...stmt,
  parse,
};
