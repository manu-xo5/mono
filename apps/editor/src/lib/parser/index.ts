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
      console.debug("debug");
      while (tokenizer.has_token()) {
        console.debug(tokenizer.eat(tokenizer.current_token().name));
      }
    } catch {
      console.debug("errrr");
    }
  }
}

export const parser = {
  ...expr,
  ...stmt,
  parse,
};
