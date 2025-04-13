export const tag =
  <T extends string>(name: T) =>
  <X>(x: X) => ({
    name: name,
    text: x,
  });
