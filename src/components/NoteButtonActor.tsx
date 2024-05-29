import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as colors from "../functions/colors";
import { Cancel } from "../functions/messaging";
import { Instrument } from "../music/Instrument";
import {
  InstrumentActivation,
  singleNoteActivation,
} from "../music/InstrumentActivation";
import * as notes from "../music/notes";
import { Key } from "./Key";
import { useObserver } from "./useObserver";
import { SynthAndGridContext } from "./WithSynthAndGrid";

export interface NoteButtonActorProps {
  noteIndex: number;
  notePositions: number[];
  noteSize?: number;
  instrument: Instrument;
  sustain?: boolean;
  activeOnOctave?: boolean;
  activation?: InstrumentActivation;
  onTrigger?: (cancel: Cancel) => void;
  muteInactiveFactor?: number;
}

export const NoteButtonActor: React.FC<NoteButtonActorProps> = ({
  noteIndex,
  notePositions,
  noteSize = 2,
  instrument,
  activeOnOctave = false,
  sustain = false,
  activation = singleNoteActivation,
  onTrigger,
  muteInactiveFactor = 0.2,
}) => {
  const { gridController } = useContext(SynthAndGridContext);

  const neighbors = useMemo(
    () =>
      notePositions.flatMap((notePosition) =>
        gridController.gridDimensions.withNeighborIndexes(
          notePosition,
          noteSize
        )
      ),
    [notePositions.join(","), noteSize]
  );

  const midi = useObserver(() => instrument.getMidiNoteAtIndex(noteIndex), []);
  const [noteActive, setNoteActive] = useState(false);

  useEffect(() => {
    if (activeOnOctave) {
      return instrument.onNoteActive(notes.getNote(midi), ({ active }) =>
        setNoteActive(active)
      );
    } else {
      return instrument.onMidiNoteActive(midi, ({ active }) =>
        setNoteActive(active)
      );
    }
  }, [instrument, activeOnOctave, midi]);

  const color = useMemo(() => {
    const note = notes.getNote(midi);
    const baseColor = notes.getColor(note);
    const color = noteActive
      ? colors.brighten(baseColor, { minWhite: 1 / 127, factor: 1.2 })
      : colors.muteColor(baseColor, muteInactiveFactor);
    return color;
  }, [midi, noteActive, muteInactiveFactor]);

  // set the buttons color according to whether its active

  // trigger the instrument when 1 key is pressed
  const cancel = useRef<Cancel | undefined>();

  const onActiveChange = useCallback(
    ({ active }: { active: boolean }) => {
      function trigger(): void {
        cancel.current && cancel.current();
        cancel.current = undefined;

        const deactivate = instrument.triggerNoteIndex(noteIndex, {
          activation,
          onComplete: () => {
            if (cancel.current === deactivate) {
              cancel.current = undefined;
            }
          },
          cancelImmediate: sustain,
        });
        cancel.current = deactivate;
        onTrigger &&
          onTrigger(() => {
            if (cancel.current) {
              cancel.current();
              cancel.current = undefined;
            }
          });
      }

      function untrigger(): void {
        if (cancel.current) {
          cancel.current();
          cancel.current = undefined;
        }
      }
      if (!sustain) {
        if (active) {
          trigger();
        } else {
          untrigger();
        }
      } else {
        if (active) {
          if (cancel.current) {
            untrigger();
          } else {
            trigger();
          }
        }
      }
    },
    [onTrigger, noteIndex, activation]
  );

  const { increment, decrement } = useMultibuttonTrigger(onActiveChange);

  // kill the note on unmount
  useEffect(() => {
    () => cancel.current && cancel.current();
  }, []);

  return (
    <>
      {neighbors.map((i) => {
        return (
          <Key
            key={i}
            position={i}
            color={color}
            onKeydown={increment}
            onKeyup={decrement}
          />
        );
      })}
    </>
  );
};

interface MultibuttonTrigger {
  increment: () => void;
  decrement: () => void;
}

function useMultibuttonTrigger(
  onChange: (evt: { active: boolean }) => void
): MultibuttonTrigger {
  const ref = useRef(0);
  const increment = useCallback(() => {
    ref.current += 1;
    if (ref.current === 1) onChange({ active: true });
  }, [onChange]);
  const decrement = useCallback(() => {
    ref.current = Math.max(0, ref.current - 1);
    if (ref.current === 0) onChange({ active: false });
  }, [onChange]);
  return {
    increment,
    decrement,
  };
}
