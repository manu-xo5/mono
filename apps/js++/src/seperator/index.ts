// plan to depricate
export function* seperator(codeStr: string) {
  let i = 0;
  let buffer = "";
  const SEPERATORS = " .-=<>([{}]);\n";

  const dispatch = () => {
    const _buf = buffer;
    buffer = "";

    return {
      idx: i - buffer.length,
      word: _buf,
    };
  };

  while (i < codeStr.length) {
    const char = codeStr.charAt(i);

    if (" ".includes(char)) {
      if (buffer.length) {
        yield dispatch();
      }

      while (codeStr.charAt(i) === " ") {
        buffer += " ";
        i++;
      }
      yield dispatch();
      continue;
    } else if (SEPERATORS.includes(char)) {
      if (buffer.length) {
        yield dispatch();
      }

      buffer = char;
      yield dispatch();
    } else {
      buffer += char;
    }
    i++;
  }

  if (buffer.length) yield dispatch();

  return null;
}

export type seperatorType = ReturnType<typeof seperator>;
export type YeildValueSeperatorType = IteratorYieldResult<{
  word: string;
  idx: number;
}>["value"];
