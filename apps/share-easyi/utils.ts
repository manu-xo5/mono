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
