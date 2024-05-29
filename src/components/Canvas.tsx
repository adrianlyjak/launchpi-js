import React, { useContext } from "react";
import { Key } from "./Key";
import { SynthAndGridContext } from "./WithSynthAndGrid";

export const Canvas: React.FC<{}> = ({}) => {
  const { gridController } = useContext(SynthAndGridContext);
  return (
    <>
      {gridController.gridDimensions.indexArray().map((i) => {
        return <Key key={i} color={[0, 0, 0]} position={i} />;
      })}
    </>
  );
};
