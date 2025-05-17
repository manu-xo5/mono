export function sleep(ms: number) {
  const sleepP = new Promise((res) => setTimeout(res, ms));
  return sleepP;
}

export function safeJsonParse<T>(input: string): T | null {
  try {
    return JSON.parse(input) as T;
  } catch {
    return null;
  }
}

export function todo(): never {
  throw new Error("Not Implemented");
}

export async function tryCatch<V, E = Error>(promise: Promise<V>) {
  try {
    const value = await promise;
    return [null, value] as const;
  } catch (error) {
    console.error(error)
    return [error as E, null] as const;
  }
}
