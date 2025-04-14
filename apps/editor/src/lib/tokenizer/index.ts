import { Brand } from "@/lib/utils";
import { expression } from "./expression";
import type { seperatorType } from "./seperator";
import { binaryOperatorParser } from "./operators/arithmatic";

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

//const funcProgram = "myFunc(1,main())";
//const floatingNumber = `8.09`;
const binaryOperation = `8 +   9.0 + 1`;
const res = binaryOperatorParser.run(binaryOperation);

if (res.isError) {
  console.error(res.error);
} else {
  console.log(JSON.stringify(res.result, null, 2));
}

/*
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 */

function* tokenize() {
  const RegexPattern: [RegExp, string][] = [
    [/\s+/, "Whitespace"],
    [/^\d+/, "NumberLiteral"],
    [/(["'])(?:\\.|(?!\1).)*\1/, "StringLiteral"],
    [/^[a-zA-Z_][a-zA-Z0-9_]*/, "Keyword"],
    [/\(|\)/, "Paranthesis"],
  ];

  let i = 0;
  outer: while (i < floatingNumber.length) {
    const str = floatingNumber.slice(i);

    for (const [regex, name] of RegexPattern) {
      const match = regex.exec(str);
      if (match != null) {
        yield [match[0], name];

        i += match[0].length;
        continue outer;
      }
    }

    throw SyntaxError(
      "JJUnexpected token `" + floatingNumber[i] + "` at pos: " + i,
    );
  }
}
