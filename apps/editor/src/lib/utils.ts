import { TokenizerSyntaxError } from "./tokenizer/helpers";

export const clamp = (min: number, max: number, value: number) => {
  return Math.max(min, Math.min(max, value));
};

export * as Brand from "./brand";

export const isSpaceChar = (value: string) => /^ +$/.test(value);
export const isNewline = (value: string) => "\n" === value;

export const isAlphabet = (value: string) =>
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".includes(value);

export const isNumber = (value: string) => "0123456789".includes(value);

export const isAlphaNumeric = (value: string) =>
  isAlphabet(value) || isNumber(value);

export const isValidIdentifier = (value: string) => {
  const initChar = value[1];
  if (isNumber(initChar)) return false;

  return value
    .slice(1)
    .split("")
    .every((char) => isAlphaNumeric(char) || " " === char || "$" === char);
};

export function assert(cond: boolean, errorMessage: string): asserts cond {
  if (!cond) {
    throw new Error(errorMessage);
  }
}

export function createLn(nesting: number) {
  return (...x: unknown[]) => {
    console.log("level:", nesting, " ".repeat(nesting * 4).concat("|"), ...x);
  };
}
