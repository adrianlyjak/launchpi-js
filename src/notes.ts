import { RGB } from "./colors";

export enum Notes {
  C = 0,
  CSharp = 1,
  D = 2,
  DSharp = 3,
  E = 4,
  F = 5,
  FSharp = 6,
  G = 7,
  GSharp = 8,
  A = 9,
  ASharp = 10,
  B = 11,
}

export const noteColorsMap: Record<Notes, RGB> = {
  [Notes.C]: [1, 0, 0] as RGB,
  [Notes.CSharp]: [0.6, 4 / 127, 0] as RGB,
  [Notes.D]: [1, 0.25, 0] as RGB,
  [Notes.DSharp]: [1, 0.55, 0] as RGB,
  [Notes.E]: [1, 1, 0] as RGB,
  [Notes.F]: [0, 1, 0] as RGB,
  [Notes.FSharp]: [0, 0.9, 0.6] as RGB,
  [Notes.G]: [0, 0.5, 1] as RGB,
  [Notes.GSharp]: [0, 0, 1] as RGB,
  [Notes.A]: [0.3, 0, 1] as RGB,
  [Notes.ASharp]: [0.6, 0, 0.8] as RGB,
  [Notes.B]: [1, 0, 0.5] as RGB,
};

const allNotes: Notes[] = Array(12)
  .fill(null)
  .map((x, i) => i);

export const noteColorArray: RGB[] = allNotes.map((i) => noteColorsMap[i]);

export function getColor(note: Notes): RGB {
  return noteColorsMap[note];
}
