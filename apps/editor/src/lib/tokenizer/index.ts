import { EofError, TokenizerSyntaxError } from "./helpers";

export type TokenType =
  | "Whitespace"
  | "Paran"
  | "NumberLiteral"
  | "StringLiteral"
  | "BooleanLiteral"
  | "OptionNoneLiteral"
  | "Semicolon"
  | "Dot"
  | "Symbol";

export type TokenNode = {
  name: TokenType;
  value: string;
};

export class Tokenizer {
  private cursor = 0;
  public source = "";
  private callDepth = 0;

  private regexMatcher: [RegExp, TokenType][] = [
    [/^\s+/, "Whitespace"],
    [/^;/, "Semicolon"],
    [/^\./, "Dot"],
    [/^[()]/, "Paran"],
    [/^\d+/, "NumberLiteral"],
    [/^\bfalse\b|\btrue\b/, "BooleanLiteral"],
    [/^[_$a-zA-Z][_$a-zA-Z0-9]*/, "Symbol"],
    [/^"[^"]*"/, "StringLiteral"],
    [/^'[^']*'/, "StringLiteral"],
  ];

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

    // assert EOF
    if (temp == null) {
      console.info(
        [Tokenizer.name, this.eat.name].join(".").concat(`(${name})`),
      );
      throw new EofError(name);
    }

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
    if (temp.name !== name) {
      console.info(
        [Tokenizer.name, this.eat.name].join(".").concat(`(${name})`),
      );

      throw new TokenizerSyntaxError({
        expectedName: name,
        gotName: temp.name,
        gotValue: temp.value,
      });
    }

    this.cursor += temp.value.length;
    this.callDepth = 0;
    return temp;
  }

  lookahead() {
    if (this.cursor > this.source.length) return null;

    const slice = this.source.slice(this.cursor);

    for (const [regex, name] of this.regexMatcher) {
      const match = slice.match(regex);
      if (match != null) {
        return {
          name: name,
          value: match[0],
        };
      }
    }

    return null;
  }
}
