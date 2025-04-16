import { assert } from "@/lib/utils";
import { ERROR_UNEXPECTED_END, humanizeListJoin } from "./helpers";

export type TokenType =
  | "EOF"
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
  | "Identifier"
  | "UnknownToken";

export type TokenNode = {
  name: TokenType;
  value: string;
};

const SPEC: [RegExp, TokenType][] = [
  [/^\s+/, "Whitespace"],
  [/^;/, "Semicolon"],
  [/^\./, "Dot"],
  [/^\+/, "Plus"],
  [/^-/, "Dash"],
  [/^\*/, "Times"],
  [/^[()]/, "Paran"],
  [/^\d+/, "NumberLiteral"],
  [/^[_$a-zA-Z][_$a-zA-Z0-9]*/, "Identifier"],
  [/^"[^"]*"/, "StringLiteral"],
  [/^'[^']*'/, "StringLiteral"],
];

export class Tokenizer {
  private cursor = 0;
  public source = "";
  private _current_token!: TokenNode;

  init(source: string) {
    this.cursor = 0;
    this.source = source;
    this._current_token = this.parse_token();
  }

  eat(name: TokenType | (string & {})): TokenNode {
    const temp = this.current_token();

    assert(temp.name === name, this.ERR_SYNTAX(name).message);

    if (temp.name === "EOF") return temp;

    do {
      this.cursor += temp.value.length;
      this._current_token = this.parse_token();
    } while (this.current_token().name === "Whitespace");

    return temp;
  }

  has_token() {
    return this.cursor < this.source.length;
  }

  current_token() {
    return this._current_token;
  }

  lookahead() {
    const temp_cursor = this.cursor;
    this.cursor += this.current_token().value.length;

    const next_token = this.parse_token();
    this.cursor = temp_cursor;
    return next_token;
  }

  private parse_token(): TokenNode {
    if (!this.has_token())
      return {
        name: "EOF",
        value: "--EOF--",
      };

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

    return {
      name: "UnknownToken",
      value: slice[0],
    } as TokenNode;
  }

  ERR_SYNTAX(expected?: string[] | string, relativeIdx: number = 0) {
    const index = this.cursor - relativeIdx;
    const left_slice = this.source.substring(
      Math.max(0, index - 30),
      index - 1,
    );
    const right_slice = this.source.substring(
      index - 1,
      Math.min(this.source.length, index + 30),
    );
    const marker = " ".repeat(left_slice.length + 1).concat("^");

    const expectedTypeMsg = Array.isArray(expected)
      ? humanizeListJoin(expected)
      : expected != null
        ? expected
        : undefined;

    const title =
      `Unexpected token '${this.current_token().value}'` +
      (expected ? `, Expected '${expectedTypeMsg}'` : "");

    const msg = [title, "", left_slice + right_slice, marker].join("\n");

    return new Error(msg);
  }
}
