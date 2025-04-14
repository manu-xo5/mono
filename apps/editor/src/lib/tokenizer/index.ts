import { Brand } from "@/lib/utils";
import { expression } from "./expression";
import type { seperatorType } from "./seperator";
import { binaryExpr } from "./operators/arithmatic";

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
const binaryOperation = `8 + 9.0 + 899`;
const res = binaryExpr.run(binaryOperation);

if (res.isError) {
  console.error(res.error);
} else {
  console.log(JSON.stringify(res.result, null, 2));
}
