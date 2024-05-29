import React, { useCallback } from "react";
import { RGB } from "../../functions/colors";
import shiftArrayPointer from "../../functions/shiftArrayPointer";
import { Key } from "../Key";
import { BaseSelectProps } from "./BaseSelectProps";

export interface DoubleButtonSelectProps extends BaseSelectProps {
  position: [number, number];
}
export const DoubleButtonSelect: React.FC<DoubleButtonSelectProps> = ({
  options,
  selected,
  setSelected,
  color = [0.5, 0.5, 0.5],
  colors,
  position,
}: DoubleButtonSelectProps) => {
  const disabledColor = [0.3, 0.3, 0.3] as RGB;
  const prevIndex: number | undefined =
    selected === 0 ? undefined : selected - 1;
  const nextIndex = selected === options - 1 ? undefined : selected + 1;
  const incr = useCallback(() => {
    if (nextIndex !== undefined) setSelected(nextIndex);
  }, [setSelected, nextIndex]);
  const decr = useCallback(() => {
    if (prevIndex !== undefined) setSelected(prevIndex);
  }, [setSelected, prevIndex]);

  const currColor: RGB = colors ? colors[selected] : color;
  const nextColor: RGB =
    nextIndex === undefined ? currColor : colors ? colors[nextIndex] : color;

  return (
    <>
      <Key position={position[0]} onKeydown={decr} color={currColor} />
      <Key position={position[1]} onKeydown={incr} color={nextColor} />
    </>
  );
};
