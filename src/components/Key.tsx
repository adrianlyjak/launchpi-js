import React, { useContext, useEffect, useMemo } from "react";
import { RGB } from "../functions/colors";
import { MIDIPress } from "../services/GridController";
import { SynthAndGridContext } from "./WithSynthAndGrid";

export interface KeyProps {
  position: number;
  color: RGB;
  onKeydown?: () => void;
  onKeyup?: () => void;
}

export const Key: React.FC<KeyProps> = ({
  position,
  color,
  onKeydown,
  onKeyup,
}) => {
  const { gridController } = useContext(SynthAndGridContext);
  useEffect(() => {
    const onEvent = (evt: MIDIPress) => {
      if (evt.type === "KeyDown") {
        onKeydown && onKeydown();
      } else {
        onKeyup && onKeyup();
      }
    };
    gridController.addEventListener([position], onEvent);
    return () => gridController.removeEventListener([position], onEvent);
  }, [position, onKeydown, onKeyup]);

  // prevent unnecessary re-renders due to array inequality to prevent
  // unnecessary mutations to grid dom / midi events
  const cachedColor = useMemo(() => color, [JSON.stringify(color)]) || [
    1, 1, 1,
  ];

  // @ts-ignore
  return <grid-key position={position} color={cachedColor} />;
};
