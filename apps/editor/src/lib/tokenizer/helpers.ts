import * as A from "arcsecond";

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
