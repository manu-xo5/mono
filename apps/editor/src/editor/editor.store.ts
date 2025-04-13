import { produce } from "immer";
import { create } from "zustand";
import { clamp } from "../lib/utils";

type CursorStore = {
  row: number;
  col: number;
};

type EditorStore = {
  cursor: CursorStore;
  lines: { id: string; text: string }[];
};

export const useEditorStore = create<EditorStore>()(() => ({
  cursor: {
    row: 0,
    col: 0,
  },
  lines: [
    { id: "1", text: "const num = 0;" },
    { id: "1", text: 'const str = "hello";' },
    { id: "1", text: "const Hello = () => {" },
    { id: "2", text: "  console.log('hello');" },
    { id: "3", text: "}" },
  ],
}));

export const moveCursor = (col?: number, row?: number) => {
  const { cursor: prevCursor, lines } = useEditorStore.getState();

  const newRow = clamp(0, lines.length - 1, row ?? prevCursor.row);

  const newRowLen = lines[newRow].text.length;
  const newCol = clamp(0, newRowLen, col ?? prevCursor.col);

  useEditorStore.setState({
    cursor: {
      col: newCol,
      row: newRow,
    },
  });
};

export const cursorLineSnapshot = () => {
  const { cursor, lines } = useEditorStore.getState();

  return lines[cursor.row];
};
export const lineSnapshot = (idx: number) => {
  const { lines } = useEditorStore.getState();

  return lines[idx];
};

export const insertAtCol = (col: number, row: number, char: string) =>
  useEditorStore.setState(
    produce<EditorStore>((draft) => {
      const left = draft.lines[row].text.substring(0, col);
      const right = draft.lines[row].text.substring(col);

      draft.lines[row].text = left + char + right;
    }),
  );

export const removeAtCol = (col: number, row: number) =>
  useEditorStore.setState(
    produce<EditorStore>((draft) => {
      const left = draft.lines[row].text.substring(0, col - 1);
      const right = draft.lines[row].text.substring(col);

      draft.lines[row].text = left + right;
    }),
  );

export const insertLineAtRow = (idx: number, text: string) =>
  useEditorStore.setState(
    produce<EditorStore>((draft) => {
      draft.lines.splice(idx, 0, {
        id: crypto.randomUUID(),
        text,
      });
    }),
  );

export const updateLineAtRow = (idx: number, text: string) =>
  useEditorStore.setState(
    produce<EditorStore>((draft) => {
      draft.lines[idx].text = text;
    }),
  );

export const removeLineAtRow = (idx: number) =>
  useEditorStore.setState(
    produce<EditorStore>((draft) => {
      draft.lines.splice(idx, 1);
    }),
  );

// selection store
type SelectionStore = {
  selectionStart: [col: number, row: number] | null;
};

export const useSelectionStore = create<SelectionStore>()(() => ({
  selectionStart: null,
}));
