import React, { useCallback, useEffect, useState } from "react";
import { createRainbow } from "../functions/colors";
import { Instrument, SynthProgram } from "../music/Instrument";
import { generalUserPrograms } from "../services/instruments";
import { DoubleButtonSelect } from "./select/DoubleButtonSelect";
import { useObserver } from "./useObserver";

const generalUser = generalUserPrograms.map((x) => ({
  bank: x[0],
  program: x[1],
  name: x[2],
}));

const manyRainbows = Array(Math.ceil(generalUser.length / 7))
  .fill(null)
  .flatMap((x) => createRainbow(7));

export const SynthProgramSelector: React.FC<{
  positions: [number, number];
  instrument: Instrument;
  availableInstruments?: SynthProgram[];
}> = ({ positions, instrument, availableInstruments = generalUser }) => {
  const [selectedProgram, setSelectedProgram] = useState(
    () => instrument.channels[0].program
  );
  useEffect(() => instrument.onSetInstrument(setSelectedProgram), [instrument]);
  const programIndex =
    (selectedProgram &&
      availableInstruments.findIndex(
        (x) =>
          x.bank === selectedProgram.bank &&
          x.program === selectedProgram.program
      )) ||
    0;
  const setProgramIndex = useCallback(
    (index: number) => instrument.setInstrument(availableInstruments[index]),
    []
  );

  return (
    <DoubleButtonSelect
      position={positions}
      selected={programIndex}
      setSelected={setProgramIndex}
      options={availableInstruments.length}
      colors={manyRainbows}
    />
  );
};
