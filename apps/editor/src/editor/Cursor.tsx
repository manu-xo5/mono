import { LINE_HEIGHT, FONT_SIZE } from "./editor.config";
import { useEditorStore } from "./editor.store";

export function Cursor() {
  const { col, row } = useEditorStore((store) => store.cursor);

  return (
    <span
      style={{
        height: LINE_HEIGHT,
        left: FONT_SIZE * col + "px",
        top: LINE_HEIGHT * row + "px",
      }}
      className="inline-block w-0.5 bg-white animate-blink absolute z-10"
    />
  );
}

