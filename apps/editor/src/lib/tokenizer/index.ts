import { Brand } from "@/lib/utils";
import type { seperatorType } from "./seperator";

const TokenName = Brand.For<
  | "newline"
  | "whitespace"
  | "punctuation"
  | "paranthesis"
  | "keyword"
  | "identifier"
  | "literal"
  | "unknown"
>();

export type DispatchTokenArg = {
  name: Brand.infer<typeof TokenName>;
  text: string;
  idx: number;
  x: number;
  y: number;
};

export type Token = {
  name: typeof TokenName;
  text: string;
  idx: number;
  x: number;
  y: number;
};

export function* tokenizer(words: seperatorType): Generator<Token> {
  const ctx = {
    x: 0,
    y: 0,
  };
  void ctx;

  for (const word of words) {
    if ("\n" === word.word) {
      yield {
        ...word,
        y: ctx.y,
        x: ctx.x,
        name: TokenName.from("newline"),
        text: word.word,
      };
      ctx.x = 0;
      ctx.y++;
    } else {
      yield {
        ...word,
        y: ctx.y,
        x: ctx.x,
        name: TokenName.from("unknown"),
        text: word.word,
      };
      ctx.x++;
    }
  }
}

export type TokenType =
  | "Whitespace"
  | "NumberLiteral"
  | "StringLiteral"
  | "BooleanLiteral"
  | "OptionNoneLiteral"
  | "Semicolon"
  | "Keyword";

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
    [/^\d+/, "NumberLiteral"],
    [/^\bfalse\b|\btrue\b/, "BooleanLiteral"],
    [/^[_$a-zA-Z][_$a-zA-Z0-9]*/, "Keyword"],
    [/^"[^"]*"/, "StringLiteral"],
    [/^'[^']*'/, "StringLiteral"],
  ];

  init(source: string) {
    this.cursor = 0;
    this.source = source;
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
      throw Error(`Tokenizer: unexpected end of input, expected '${name}'`);
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

      throw Error(
        `Tokenizer: unexpected token ${temp.name} '${temp.value}', expected '${name}'`,
      );
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

//const funcProgram = "myFunc(1,main())";
//const floatingNumber = `8.09`;
