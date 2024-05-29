import React, { useContext, useMemo } from "react";
import { brighten, muteColor } from "../functions/colors";
import { noteColorArray } from "../music/notes";
import { SelectGrid } from "./select/SelectGrid";
import { useObserver } from "./useObserver";
import { SynthAndGridContext } from "./WithSynthAndGrid";

export const TonicSelector: React.FC<{}> = () => {
  const { scale } = useContext(SynthAndGridContext);
  const selected = useObserver(() => scale.startMidiNote % 12);
  const selectedColor = useMemo(
    () => brighten(noteColorArray[selected], { minWhite: 0.1 }),
    [selected]
  );
  const mutedColors = useMemo(() => noteColorArray.map(muteColor), []);
  const setSelected = (idx: number) => scale.setStartMidiNote(idx);

  return (
    <SelectGrid
      width={4}
      height={3}
      offset={{ x: 0, y: 5 }}
      selected={selected}
      setSelected={setSelected}
      colors={mutedColors}
      selectedColor={selectedColor}
    ></SelectGrid>
  );
};
