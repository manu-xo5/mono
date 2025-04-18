import { use, useDeferredValue, useEffect, useRef } from "react";
import { seperator } from "@/lib/seperator";
import { Cursor } from "./Cursor";
import { FONT_FAMILY, FONT_SIZE, LINE_HEIGHT, THEME } from "./editor.config";
import { insertAtCol, moveCursor, useEditorStore } from "./editor.store";
import { handleBackspace, handleDelete, handleEnter } from "./keymap";
import { Modifiers } from "./types";
import { mouseToColRow, VALID_CHARS } from "./utils";
import { Tokenizer } from "@/lib/tokenizer";
import { parser } from "@/lib/parser";

function renderText(
  tokens: { word: string; idx: number }[],
  ctx: CanvasRenderingContext2D,
) {
  let x = 0;
  let y = 0;

  for (const token of tokens) {
    if ((token.word as unknown as string) === "newline") {
      y++;
      x = 0;
      continue;
    }

    const word = token.word;

    ctx.fillStyle =
      THEME[token.word as unknown as keyof typeof THEME] ?? THEME.__fallback;
    ctx.fillText(word, x * FONT_SIZE, y * LINE_HEIGHT + LINE_HEIGHT / 2);
    x += word.length;

    ctx.fillStyle = "white";
  }
}

export function Editor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    async function run() {
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx) throw Error("ctx is undefined");

      ctx.clearRect(0, 0, innerWidth, innerHeight);
      ctx.font = "16px monospace";
      ctx.textBaseline = "middle";

      const lines = useEditorStore
        .getState()
        .lines.map(({ text }) => text)
        .join("\n");

      void (function () {
        try {
          console.clear();
          console.log("ast ---------");
          const ast = parser.parse(lines);
          console.log(JSON.stringify(ast, null, 4));
          console.log("-------------");
        } catch (err) {
          console.error(err);
        }
      })();

      const seperatorIter = seperator(lines);
      const words = Array.from(seperatorIter);
      renderText(words, ctx);

      //renderMenu(canvasRef.current);
    }
    run();
    const unsub = useEditorStore.subscribe(() => {
      run();
    });

    return () => unsub();
  }, []);

  return (
    <>
      <div
        tabIndex={-1}
        style={{
          fontFamily: FONT_FAMILY,
        }}
        className="bg-zinc-500 min-h-96 text-white"
        onMouseDown={(ev) => {
          const [col, row] = mouseToColRow(
            ev.currentTarget.getBoundingClientRect(),
            ev.clientX,
            ev.clientY,
          );

          moveCursor(col, row);
        }}
        onKeyDown={(ev) => {
          if (["Shift", "Ctrl", "Alt"].includes(ev.key)) return;
          const modifiers = {
            ctrl: ev.ctrlKey,
            shift: ev.shiftKey,
            meta: ev.metaKey,
          };
          handleKeyDown(ev.key, modifiers);
        }}
      >
        <canvas
          ref={canvasRef}
          width={innerWidth}
          height={innerHeight}
          className="bg-zinc-600"
        ></canvas>

        <Cursor />
      </div>
    </>
  );
}

function handleKeyDown(key: string, modifiers: Modifiers) {
  const { cursor } = useEditorStore.getState();

  if (VALID_CHARS.includes(key)) {
    insertAtCol(cursor.col, cursor.row, key.charAt(0));
    moveCursor(cursor.col + 1);
    return;
  }

  switch (key) {
    case "ArrowLeft": {
      moveCursor(cursor.col - 1);
      break;
    }
    case "ArrowRight": {
      moveCursor(cursor.col + 1);
      break;
    }
    case "ArrowUp": {
      moveCursor(undefined, cursor.row - 1);
      break;
    }
    case "ArrowDown": {
      moveCursor(undefined, cursor.row + 1);

      break;
    }

    case "Enter": {
      handleEnter(modifiers);
      break;
    }

    case "Backspace": {
      handleBackspace(modifiers);
      break;
    }
    case "Delete": {
      handleDelete(modifiers);
      break;
    }

    default: {
      break;
    }
  }
}
