import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  addColors,
  brighten,
  muteColor,
  sampleRainbow,
} from "../functions/colors";
import { Cancel } from "../functions/messaging";
import { Instrument } from "../music/Instrument";
import {
  arpegiatedActivation0,
  arpegiatedChordActivationHighLow,
  chordActivation0,
  continuousChordActivation,
  continuousSingleNoteActivation,
  InstrumentActivation,
} from "../music/InstrumentActivation";
import { noteColorArray } from "../music/notes";
import { Scale, scaleFamilies } from "../music/Scale";
import { LockedKeys } from "./LockedKeys";
import { NoteButtonActor } from "./NoteButtonActor";
import { DoubleButtonSelect } from "./select/DoubleButtonSelect";
import { SingleButtonSelect } from "./select/SingleButtonSelect";
import { SharedLockedKeys } from "./SharedLock";
import { SynthProgramSelector } from "./SynthProgramSelector";
import { useObserver } from "./useObserver";
import { SynthAndGridContext } from "./WithSynthAndGrid";

export const ChordsInstrument: React.FC<{
  chords: Instrument;
  notes: Instrument;
  bottomLeftPosition?: number;
  activationState: ChordsInstrumentState;
}> = ({
  chords,
  notes,
  bottomLeftPosition = 0,
  activationState: { activationIndex, setActivationIndex, activations },
}) => {
  const { scale } = useContext(SynthAndGridContext);
  const chordButtonPlacements = [0, 2, 4, 6, 18, 20, 22, 24].map((i) => [
    i + bottomLeftPosition,
  ]);

  const octaveIndex = useObserver(() => chords.noteOffset / 7);
  const scaleFamily = useObserver(() => scale.scaleFamilyIndex);
  const setOctaveIndex = useCallback((i: number) => {
    const desiredOffset = i * 7;
    chords.setNoteOffset(desiredOffset);
  }, []);

  const cancelActive = useRef<Cancel | undefined>();

  const onTrigger = useMemo(() => {
    return chordButtonPlacements.map((place, i) => {
      return (stuff: Cancel) => {
        notes.setNoteOffset(i);
        cancelActive.current = stuff;
      };
    });
  }, [JSON.stringify(chordButtonPlacements)]);

  // clear the current note out when settings change
  useEffect(
    () => () => cancelActive.current && cancelActive.current(),
    [activationIndex, octaveIndex, scaleFamily]
  );
  // also stop playing when this component unmounts
  useEffect(() => () => cancelActive.current && cancelActive.current(), []);

  const lockDelay =
    (scale.timeSignature.props.microbeatsPerMeasure *
      scale.timeSignature.props.millisPerMicrobeat) /
    2;

  const chordButtons = chordButtonPlacements.map((position, index) => {
    return (
      <NoteButtonActor
        sustain
        activeOnOctave
        key={`chord-${index}`}
        notePositions={position}
        noteIndex={index}
        instrument={chords}
        activation={activations[activationIndex]}
        onTrigger={onTrigger[index]}
      />
    );
  });

  return (
    <>
      <SharedLockedKeys
        positions={[35 + bottomLeftPosition]}
        delayMillis={lockDelay}
      >
        <SingleButtonSelect
          selected={activationIndex}
          setSelected={setActivationIndex}
          position={35 + bottomLeftPosition}
          colors={every3rdNoteColor}
          options={activations.length}
        />
      </SharedLockedKeys>
      <SharedLockedKeys
        positions={[17 + bottomLeftPosition, 26 + bottomLeftPosition]}
        delayMillis={lockDelay}
      >
        <SynthProgramSelector
          instrument={chords}
          positions={[17 + bottomLeftPosition, 26 + bottomLeftPosition]}
        />
      </SharedLockedKeys>
      <SharedLockedKeys positions={[72, 73]} delayMillis={lockDelay}>
        <DoubleButtonSelect
          selected={octaveIndex}
          setSelected={setOctaveIndex}
          position={[73, 72]}
          colors={purpleToCyan}
          options={octaveCount}
        />
      </SharedLockedKeys>
      <SharedLockedKeys positions={[74, 75]} delayMillis={lockDelay}>
        <DoubleButtonSelect
          selected={scaleFamily}
          setSelected={(index) => {
            scale.setScaleFamilyIndex(index);
          }}
          position={[74, 75]}
          colors={every3rdNoteColor}
          options={scaleFamilies.length}
        />
      </SharedLockedKeys>

      {chordButtons}
    </>
  );
};

const octaveCount = 6;
const purpleToCyan = sampleRainbow(7, octaveCount, 16).reverse();
const every3rdNoteColor = noteColorArray.filter((x, i) => i % 3 === 0);
export interface ChordsInstrumentState {
  activations: InstrumentActivation[];
  activationIndex: number;
  setActivationIndex(index: number): void;
}

/** state of chords. Hook to externally control a chords */
export function useChordsState(): ChordsInstrumentState {
  const activations = useMemo(
    () => [
      arpegiatedActivation0,
      arpegiatedChordActivationHighLow(),
      chordActivation0,
      continuousChordActivation(),
      continuousSingleNoteActivation(),
    ],
    []
  );
  const [activationIndex, setActivationIndex] = useState(0);

  return {
    activations,
    activationIndex: activationIndex,
    setActivationIndex: setActivationIndex,
  };
}
