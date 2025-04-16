export function assert(cond: boolean, errorMessage: string): asserts cond {
  if (!cond) {
    throw new Error(errorMessage);
  }
}
