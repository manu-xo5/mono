import { assert } from "@/lib/utils";
import {
  ERROR_SYNTAX,
  ERROR_UNEXPECTED_END,
  humanizeListJoin,
} from "./helpers";

export type TokenType =
  | "Whitespace"
  | "Semicolon"
  | "Dot"
  | "Plus"
  | "Dash"
  | "Times"
  | "Slash"
  | "Equal"
  | "Paran"
  | "NumberLiteral"
  | "StringLiteral"
  | "BooleanLiteral"
  | "OptionNoneLiteral"
  | "Identifier";

export type TokenNode = {
  name: TokenType;
  value: string;
};

const SPEC: [RegExp, TokenType][] = [
  [/^\s+/, "Whitespace"],
  [/^;/, "Semicolon"],
  [/^\./, "Dot"],
  [/^\+/, "Plus"],
  [/^\*/, "Times"],
  [/^[()]/, "Paran"],
  [/^\d+/, "NumberLiteral"],
  [/^\bfalse\b|\btrue\b/, "BooleanLiteral"],
  [/^[_$a-zA-Z][_$a-zA-Z0-9]*/, "Identifier"],
  [/^"[^"]*"/, "StringLiteral"],
  [/^'[^']*'/, "StringLiteral"],
];

export class Tokenizer {
  private cursor = 0;
  public source = "";
  private callDepth = 0;

  init(source: string) {
    this.cursor = 0;
    this.source = source;
  }

  _eatDebug(): TokenNode | null {
    const temp = this.lookahead();
    this.cursor += temp?.value.length ?? 0;

    return temp;
  }

  eat(name: TokenType | (string & {})): TokenNode {
    this.callDepth++;
    if (this.callDepth > 1000) {
      throw Error("Tokenizer: max calls stack exceeded");
    }

    const temp = this.lookahead();

    // ignore whitespaces
    if (temp.name == "Whitespace") {
      console.info(
        [Tokenizer.name, this.eat.name]
          .join(".")
          .concat(`(${name}): skipping whitespace, calling self`),
      );

      this.cursor += temp.value.length;
      return this.eat(name);
    }

    // assert required type with obtained
    assert(temp.name === name, this.ERR_SYNTAX().message);

    this.cursor += temp.value.length;
    this.callDepth = 0;
    return temp;
  }

  lookahead() {
    if (this.cursor >= this.source.length)
      throw new Error(ERROR_UNEXPECTED_END());

    const slice = this.source.slice(this.cursor);

    for (const [regex, name] of SPEC) {
      const match = slice.match(regex);
      if (match != null) {
        return {
          name: name,
          value: match[0],
        };
      }
    }

    throw ERROR_SYNTAX(slice);
  }

  ERR_SYNTAX(expected?: string[] | string) {
    const left_slice = this.source.substring(
      Math.max(0, this.cursor - 30),
      this.cursor - 1,
    );
    const right_slice = this.source.substring(
      this.cursor - 1,
      Math.min(this.source.length, this.cursor + 30),
    );
    const marker = " ".repeat(left_slice.length + 1).concat("^");

    const expectedTypeMsg = Array.isArray(expected)
      ? humanizeListJoin(expected)
      : expected
        ? expected
        : undefined;

    const title =
      `Unexpected token '${this.lookahead().value}'` +
      (expected ? `, Expected '${expectedTypeMsg}'` : "");

    const msg = [title, "", left_slice + right_slice, marker].join("\n");

    return new Error(msg);
  }
}
