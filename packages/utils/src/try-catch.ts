export async function tryCatch<T, E = Error>(
  promise: Promise<T>,
): Promise<[null, T] | [E, null]> {
  try {
    return [null, await promise];
  } catch (err) {
    return [err as E, null];
  }
}
