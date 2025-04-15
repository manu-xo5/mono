import * as A from "arcsecond";
import { TokenType } from ".";

export const tag =
  <T extends string>(name: T) =>
  <X>(x: X) => ({
    name: name,
    value: x,
  });

export const betweenParan = A.between(A.char("("))(A.char(")"));
export const commaSep = A.sepBy(
  A.sequenceOf([A.optionalWhitespace, A.char(","), A.optionalWhitespace]),
);

export const withData =
  <D>() =>
  <T, E>(parser: A.Parser<T, E, D>) =>
    A.withData<T, E, D>(parser);

export const endOfStmt = A.choice([A.char(";")]);

// errors
export class EofError extends Error {
  constructor(tokenName: string) {
    super(`Tokenizer: unexpected end of input, expected '${tokenName}'`);
  }
}

export class TokenizerSyntaxError extends Error {
  constructor(temp: {
    expectedName: string;
    gotName: string;
    gotValue: string;
  }) {
    super(
      `Tokenizer: unexpected ${temp.gotName} '${temp.gotValue}', expected '${temp.expectedName}'`,
    );
  }
}

const formatter = new Intl.ListFormat("en", {
  style: "long",
  type: "disjunction",
});

export function assertNodeToBe<T, ToBe extends TokenType | (string & {})>(
  node: T | null,
  toBe: ToBe,
): asserts node is T & { name: ToBe };
export function assertNodeToBe<T, ToBe extends TokenType | (string & {})>(
  node: T | null,
  toBe: ToBe[],
): asserts node is T & { name: ToBe[number] };
export function assertNodeToBe<T, ToBe extends TokenType | (string & {})>(
  node: T | null,
  toBe: ToBe[] | ToBe,
): asserts node is T & { name: typeof toBe } {
  const target = Array.isArray(toBe) ? toBe : [toBe];
  if (node == null) {
    throw new EofError(formatter.format(target));
  }

  if (typeof node !== "object" || !("name" in node)) {
    throw new Error(
      `Assertion: invalid 1 argument in 'assertNodeToBe' assertion, ${JSON.stringify(node, null, 2)}`,
    );
  }

  if (!toBe.includes(node.name as ToBe)) {
    throw new TokenizerSyntaxError({
      expectedName: formatter.format(target),
      gotName: node.name,
      gotValue: "value" in node ? String(node.value) : "?",
    });
  }
}

export function assertNodeValue<
  T extends { value: unknown },
  Value extends string,
>(node: T, value: Value): asserts node is T & { value: Value } {
  if (node.value !== value) {
    throw new TokenizerSyntaxError({
      gotName: "Token",
      expectedName: String(value),
      gotValue: String(node.value),
    });
  }
}

//#

export function createLn(nesting: number) {
  return (...x: unknown[]) => {
    console.log("level:", nesting, " ".repeat(nesting * 4).concat("|"), ...x);
  };
}
