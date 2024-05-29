import React from "react";
import { Instrument } from "../music/Instrument";
import { upDownScaleTriggerHigh } from "../music/InstrumentActivation";
import { LockedKeys } from "./LockedKeys";
import { LongPress } from "./LongPress";
import { NoteButtonActor } from "./NoteButtonActor";
import { SharedLockedKeys } from "./SharedLock";
import { SynthProgramSelector } from "./SynthProgramSelector";

export const NotesInstrument: React.FC<{
  bottomLeftPosition?: number;
  notes: Instrument;
}> = ({ bottomLeftPosition = 0, notes }) => {
  const time = notes.scale.timeSignature.props;
  const lockDelay = (time.microbeatsPerMeasure * time.millisPerMicrobeat) / 2;

  const noteButtons = Array(8)
    .fill(null)
    .map((_, i) =>
      i === 7
        ? [bottomLeftPosition + 0 + i, bottomLeftPosition + 0 + i + 2]
        : [bottomLeftPosition + 0 + i]
    )
    .concat(
      Array(7)
        .fill(null)
        .map((_, i) =>
          i === 6
            ? [bottomLeftPosition + 10 + i, bottomLeftPosition + 10 + i + 2]
            : [bottomLeftPosition + 10 + i]
        )
    )
    .concat(
      Array(7)
        .fill(null)
        .map((_, i) =>
          i === 6
            ? [bottomLeftPosition + 19 + i, bottomLeftPosition + 19 + i + 2]
            : [bottomLeftPosition + 19 + i]
        )
    )
    .concat(
      Array(7)
        .fill(null)
        .map((_, i) => [bottomLeftPosition + 28 + i])
    )
    .flatMap((position, index) => {
      const note = (
        <NoteButtonActor
          key={`note-${index}`}
          notePositions={position}
          noteIndex={index}
          noteSize={1}
          instrument={notes}
        />
      );
      let scale =
        index !== 0 && index % 7 === 0
          ? [
              <LongPress
                key={`scale-${index}`}
                position={position[0]}
                idleColor={[0, 0, 0]}
                activeColor={[0, 0, 0.25]}
                onKeypress={() =>
                  notes.triggerNoteIndex(index, {
                    activation: upDownScaleTriggerHigh,
                  })
                }
                delayMillis={
                  notes.timeSignature.props.millisPerMicrobeat *
                  notes.timeSignature.props.microbeatsPerMeasure
                }
              />,
            ]
          : [];
      return [note, ...scale];
    });
  return (
    <>
      {
        <SharedLockedKeys
          positions={[17 + bottomLeftPosition, 26 + bottomLeftPosition]}
          delayMillis={lockDelay}
        >
          <SynthProgramSelector
            instrument={notes}
            positions={[17 + bottomLeftPosition, 26 + bottomLeftPosition]}
          />
        </SharedLockedKeys>
      }

      {noteButtons}
    </>
  );
};

export interface ScaleDegreeState {
  degree: number;
  setDegree(start: number): void;
}
