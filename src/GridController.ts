import { RGB } from "./colors";
import { GridUtil } from "./GridUtil";

export interface GridController {
  addEventListener(
    keys: "*" | number[],
    callback: (evt: MIDIPress) => void
  ): void;

  removeEventListener(
    keys: "*" | number[],
    callback: (evt: MIDIPress) => void
  ): void;

  setGrid(grid: (RGB | undefined)[], gridConfig: GridUtil): void;
}

export interface MIDIPress {
  keyIndex: number;
  type: "KeyDown" | "KeyUp";
}
