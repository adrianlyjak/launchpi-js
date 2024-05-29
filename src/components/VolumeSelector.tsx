import React, { useContext } from "react";
import { SelectGrid } from "./select/SelectGrid";
import { useObserver } from "./useObserver";
import { SynthAndGridContext } from "./WithSynthAndGrid";

const mappings = [0.05, 0.08, 0.1, 0.2, 0.4, 0.8, 1.1, 1.5];

export const VolumeSelector: React.FC<{}> = ({}) => {
  const { audio } = useContext(SynthAndGridContext);
  const volume = useObserver(() => audio.volume);
  const nearestValue = mappings
    .slice()
    .sort((a, b) => Math.abs(volume - a) - Math.abs(volume - b))[0];
  const index = mappings.indexOf(nearestValue);
  return (
    <SelectGrid
      offset={{ x: 0, y: 0 }}
      width={8}
      height={1}
      color={[0, 0.5, 0.5]}
      selectedColor={[0, 1, 0]}
      selected={index}
      setSelected={(idx) => audio.setVolume(mappings[idx])}
    />
  );
};
