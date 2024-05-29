import { RGB } from "../functions/colors";
import { GridUtil } from "../functions/GridUtil";

export interface GridController {
  readonly gridDimensions: GridUtil;

  addEventListener(
    keys: "*" | number[],
    callback: (evt: MIDIPress) => void
  ): void;

  removeEventListener(
    keys: "*" | number[],
    callback: (evt: MIDIPress) => void
  ): void;

  setColors(grid: SetGridColor[]): void;
}

export type SetGridColor = { i: number; c: RGB };

export interface MIDIPress {
  keyIndex: number;
  type: "KeyDown" | "KeyUp";
}
