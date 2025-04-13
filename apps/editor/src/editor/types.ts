import { Point } from "web-tree-sitter";

export type Modifiers = {
  ctrl: boolean;
  shift: boolean;
  meta: boolean;
};

export type Color = {
  name: string;
  start: Point;
  end: Point;
  color: string;
};

