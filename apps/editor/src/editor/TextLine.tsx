import { use, useEffect } from "react";
import { THEME } from "./editor.config";
import { useEditorStore } from "./editor.store";
import { parser } from "./tree-sitter";
import { Color } from "./types";
import { Query } from "web-tree-sitter";

type Props = {
  lineIdx: number;
  colorInfo: Color[];
};

export function TextLine({ lineIdx, colorInfo: colorsInfo }: Props) {
  const line = useEditorStore((store) => store.lines[lineIdx]);

  const colorInfo = colorsInfo.filter((color) => color.start.row == lineIdx);

  const wordSeparator = seperateBy(" .-=<>([{}]);");
  const { parser: ts, JavaScript } = use(parser);
  useEffect(() => {
    async function run() {
      try {
        const code = line.text;
        const tree = ts.parse(code);
        if (!tree) return;

        const HIGH_LIGHTS = await fetch("/highlights.scm").then((res) =>
          res.text(),
        );
        const query = new Query(JavaScript, HIGH_LIGHTS);
        const matches = query.matches(tree.rootNode);
        console.log(`line:${lineIdx}`, matches);
      } catch (err) {
        console.error(err);
      }
    }

    run();
  }, [JavaScript, line.text, lineIdx, ts]);

  return (
    <div className="select-none animate-fadein cursor-text">
      {wordSeparator(line.text).map(({ substring: word, idx }) => {
        const color =
          colorInfo.find((ci) => ci.start.column === idx)?.color ??
          THEME.__fallback;

        return (
          <span style={{ color: color }} key={idx}>
            {word === " " ? <>&nbsp;</> : word}
          </span>
        );
      })}
      <span>&nbsp;</span>
    </div>
  );
}

const seperateBy = (seperators: string) => (str: string) => {
  const ret: { substring: string; idx: number }[] = [];
  let buffer = "";
  for (let i = 0; i < str.length; i++) {
    const char = str.charAt(i);

    if (seperators.includes(char)) {
      if (buffer.length > 0) {
        ret.push({
          substring: buffer,
          idx: i - buffer.length,
        });
        buffer = "";
      }

      ret.push({
        substring: char,
        idx: i,
      });
    } else {
      buffer += char;
    }
  }

  if (buffer.length > 0) {
    ret.push({
      idx: str.length - buffer.length,
      substring: buffer,
    });
    buffer = "";
  }

  return ret;
};
