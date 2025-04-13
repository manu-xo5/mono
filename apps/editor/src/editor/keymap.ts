import {
  insertAtCol,
  insertLineAtRow,
  moveCursor,
  removeAtCol,
  removeLineAtRow,
  updateLineAtRow,
  useEditorStore,
} from "./editor.store";
import { Modifiers } from "./types";

export function handleBackspace(modifiers: Modifiers) {
  const { cursor, lines } = useEditorStore.getState();
  const cursorLine = lines.at(cursor.row);

  if (cursorLine == null) {
    throw new Error(
      "EditorError: line doesnot exists ae cursor.row. impossible state",
    );
  }

  if (cursor.col === 0 && cursor.row === 0) return;

  // cursor at the begining of line
  if (cursor.col === 0) {
    moveCursor(Infinity, cursor.row - 1);
    const cursorLineSubstring = cursorLine.text.substring(cursor.col);
    insertAtCol(Infinity, cursor.row - 1, cursorLineSubstring);
    removeLineAtRow(cursor.row);

    return;
  }

  // ctrl + backspace
  if (modifiers.ctrl) {
    let i;
    for (i = cursor.col - 2; i >= 0; i--) {
      const char = cursorLine.text.charAt(i);
      const prevChar = cursorLine.text.charAt(i + 1);

      if (
        (char === " " && prevChar !== " ") ||
        (char !== " " && prevChar === " ")
      ) {
        break;
      }
    }

    updateLineAtRow(cursor.row, cursorLine.text.substring(0, i + 1));
    moveCursor(i + 1);

    return;
  }

  // backspace
  removeAtCol(cursor.col, cursor.row);
  moveCursor(cursor.col - 1);
}

export function handleEnter(modifiers: Modifiers) {
  const { cursor, lines } = useEditorStore.getState();
  const cursorLine = lines.at(cursor.row);

  if (cursorLine == null) {
    throw new Error(
      "EditorError: line doesnot exists ae cursor.row. impossible state",
    );
  }

  // ctrl + shift + enter
  if (modifiers.ctrl && modifiers.shift) {
    insertLineAtRow(cursor.row, "");
    moveCursor(0, cursor.row);

    return;
  }

  // ctrl + enter
  if (modifiers.ctrl) {
    insertLineAtRow(cursor.row + 1, "");
    moveCursor(0, cursor.row + 1);

    return;
  }

  // cursor at the end of the line
  if (cursor.col === cursorLine.text.length) {
    insertLineAtRow(cursor.row + 1, "");
    moveCursor(0, cursor.row + 1);

    return;
  }

  // enter
  const startSubstring = cursorLine.text.substring(0, cursor.col);
  const endSubstring = cursorLine.text.substring(cursor.col);

  removeLineAtRow(cursor.row);

  insertLineAtRow(cursor.row, startSubstring);
  insertLineAtRow(cursor.row + 1, endSubstring);
  moveCursor(0, cursor.row + 1);
}

export function handleDelete(modifiers: Modifiers) {
  const { cursor, lines } = useEditorStore.getState();
  const cursorLine = lines.at(cursor.row);

  if (cursorLine == null) {
    throw new Error(
      "EditorError: line doesnot exists ae cursor.row. impossible state",
    );
  }

  if (cursor.col === cursorLine.text.length && cursor.row === lines.length - 1)
    return;

  // cursor at the end of the line
  if (cursor.col === cursorLine.text.length) {
    removeLineAtRow(cursor.row);
    insertAtCol(0, cursor.row, cursorLine.text);
    return;
  }

  // ctrl + del
  if (modifiers.ctrl) {
    let i;
    for (i = cursor.col + 1; i < cursorLine.text.length; i++) {
      const prevChar = cursorLine.text.charAt(i - 1);
      const char = cursorLine.text.charAt(i);

      if (
        (prevChar !== " " && char === " ") ||
        (prevChar === " " && char !== " ")
      ) {
        break;
      }
    }

    const newText =
      cursorLine.text.substring(0, cursor.col) + cursorLine.text.substring(i);

    updateLineAtRow(cursor.row, newText);
    return;
  }

  removeAtCol(cursor.col + 1, cursor.row);
}
