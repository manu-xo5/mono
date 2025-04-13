import { FONT_SIZE as FONT_SIZE, LINE_HEIGHT } from "./editor.config";

export const mouseToColRow = (
  editorRect: DOMRect,
  mouseX: number,
  mouseY: number,
) => {
  void editorRect;
  const relativeX = mouseX;
  const relativeY = mouseY;

  const col = (() => {
    const x = Math.trunc((relativeX * 2) / FONT_SIZE);
    if (x % 2 !== 0) {
      return (x + 1) / 2;
    }
    return x / 2;
  })();

  const row = Math.trunc(relativeY / LINE_HEIGHT);

  return [col, row] as [number, number];
};

export const VALID_CHARS = ` ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!"#$%&'()*+,-./:;<=>?@[\\]^_\`{|}~`;
