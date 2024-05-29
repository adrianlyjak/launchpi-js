// color for selection
// detect change in options? maybe not worth it - at least detect if options length changes

import { useCallback } from "react";
import shiftArrayPointer from "../../functions/shiftArrayPointer";

type ShiftSelection = (count: number) => void;

export function useSelectionShifter({
  selected,
  setSelected,
  options,
}: {
  selected: number;
  setSelected: (selection: number) => void;
  options: number;
}): ShiftSelection {
  return useCallback(
    (count: number): void => {
      setSelected(
        shiftArrayPointer({ index: selected, delta: count, size: options })
      );
    },
    [selected, setSelected, options]
  );
}
