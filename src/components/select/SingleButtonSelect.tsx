import React, { useCallback } from "react";
import { RGB } from "../../functions/colors";
import { Key } from "../Key";
import { BaseSelectProps } from "./BaseSelectProps";
import { useSelectionShifter } from "./useSelector";

export interface ReactSingleButtonSelectProps extends BaseSelectProps {
  position: number;
}
export function SingleButtonSelect<T>({
  options,
  selected,
  setSelected,
  color,
  colors,
  position,
}: ReactSingleButtonSelectProps) {
  const shiftSelection = useSelectionShifter({
    selected,
    options,
    setSelected,
  });
  const incr = useCallback(() => shiftSelection(1), [shiftSelection]);
  const resolvedIdleColor: RGB = colors ? colors[selected] : color || [0, 0, 0];
  return <Key position={position} onKeydown={incr} color={resolvedIdleColor} />;
}
