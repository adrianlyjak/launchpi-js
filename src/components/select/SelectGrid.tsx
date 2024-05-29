import { off } from "process";
import React, { useContext, useMemo } from "react";
import { RGB } from "../../functions/colors";
import { GridUtil } from "../../functions/GridUtil";
import { Key } from "../Key";
import { SynthAndGridContext } from "../WithSynthAndGrid";
import { BaseSelectProps } from "./BaseSelectProps";

export interface SelectGridProps extends Omit<BaseSelectProps, "options"> {
  offset: { x: number; y: number };
  width: number;
  height: number;
  selectedColor: RGB;
}
export const SelectGrid: React.FC<SelectGridProps> = ({
  offset,
  width,
  height,
  selectedColor,
  selected,
  setSelected,
  color,
  colors,
}) => {
  const { gridController } = useContext(SynthAndGridContext);
  // const keys = dims.
  const gridIndexes = useMemo(() => {
    const dims = gridController.gridDimensions;

    const miniGrid = GridUtil.rect({ x: width, y: height });

    return miniGrid.indexArray().map((i) =>
      miniGrid.indexInResizedGrid(i, dims, {
        offsetX: offset.x,
        offsetY: offset.y,
      })
    );
  }, [offset.x, offset.y, width, height]);
  return (
    <>
      {gridIndexes.map((gridIndex, i) => (
        <Key
          key={i}
          position={gridIndex}
          color={
            selected === i
              ? selectedColor
              : (colors && colors[i]) || color || [0.5, 0.5, 0.5]
          }
          onKeydown={() => {
            setSelected(i);
          }}
        ></Key>
      ))}
    </>
  );
};
