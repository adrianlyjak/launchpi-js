import { RGB } from "./colors";
import { GridUtil } from "./GridUtil";

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

  setGrid(grid: (RGB | undefined)[]): void;
}

export interface MIDIPress {
  keyIndex: number;
  type: "KeyDown" | "KeyUp";
}
