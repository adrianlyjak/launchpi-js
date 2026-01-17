import { Scale } from "./Scale";
import {
  Activation,
  ActivationChannel,
  chordActivation,
  restActivation,
  SequencedActivation,
  SimpleActivation,
} from "./NoteActivation";
import { TimeSignature } from "./TimeSignature";

export type InstrumentActivation = (props: {
  scale: Scale;
  timeSignature: TimeSignature;
  channel: ActivationChannel;
  note: number;
}) => Activation;

export const singleNoteActivation: InstrumentActivation = ({
  channel,
  note,
}) => {
  return SimpleActivation({ channel, note });
};

export function doodledoo(): InstrumentActivation {
  return ({ scale, timeSignature, channel, note }) => {
    const start = scale.midiScale.indexOf(note);
    const notes = [0, 2, 4].map((i) => scale.midiScale[start + i]);
    const nextNotesA = [2].map((i) => scale.midiScale[start + i]);
    const nextNotesB = [4].map((i) => scale.midiScale[start + i]);
    const nextNotesC = [0].map((i) => scale.midiScale[start + i]);
    const whole = timeSignature.props.defaultMicrobeats * 2;
    const half = Math.trunc(timeSignature.props.defaultMicrobeats);

    return SequencedActivation({
      channel,
      sequence: chordActivation(notes, whole)
        .concat(chordActivation(notes, whole))
        .concat(chordActivation(nextNotesA, half))
        .concat(chordActivation(nextNotesB, half))
        .concat(chordActivation(nextNotesC, half))
        .concat(restActivation(half)),
    });
  };
}

export function chordActivationN(): InstrumentActivation {
  return ({ scale, timeSignature, channel, note }) => {
    const start = scale.midiScale.indexOf(note);
    const notes = [0, 2, 4].map((i) => scale.midiScale[start + i]);
    const whole = timeSignature.props.defaultMicrobeats;

    return SequencedActivation({
      channel,
      sequence: chordActivation(notes, whole).concat(restActivation(whole)),
    });
  };
}

/** Velocity for arpeggio notes, quieter than main keyboard */
const ARPEGGIO_VELOCITY = 0.5;

/**
 * Arpeggio - plays chord tones sequentially (low to high).
 * Plays at reduced velocity to sit behind main keyboard notes.
 */
export function arpegiatedChordActivationN(
  offset: number
): InstrumentActivation {
  return ({ scale, timeSignature, channel, note }) => {
    const start = scale.midiScale.indexOf(note);
    const notes = [0, 2, 4].map((i) => scale.midiScale[start + i + offset]);

    return SequencedActivation({
      channel,
      sequence: notes.flatMap((note) =>
        chordActivation(
          [note],
          Math.max(1, timeSignature.props.defaultMicrobeats),
          ARPEGGIO_VELOCITY
        )
      ),
    });
  };
}

/**
 * Descending arpeggio - plays chord tones high to low.
 * Plays at reduced velocity to sit behind main keyboard notes.
 */
export function arpegiatedChordActivationHighLow(): InstrumentActivation {
  return ({ scale, timeSignature, channel, note }) => {
    const start = scale.midiScale.indexOf(note);
    const notes = [4, 2, 0].map((i) => scale.midiScale[start + i]);

    return SequencedActivation({
      channel,
      sequence: notes.flatMap((note) =>
        chordActivation(
          [note],
          Math.max(1, timeSignature.props.defaultMicrobeats),
          ARPEGGIO_VELOCITY
        )
      ),
    });
  };
}

export function continuousChordActivation(): InstrumentActivation {
  return ({ scale, timeSignature, channel, note }) => {
    const start = scale.midiScale.indexOf(note);
    const notes = [0, 2, 4].map((i) => scale.midiScale[start + i]);

    return SequencedActivation({
      channel,
      sequence: chordActivation(
        notes,
        timeSignature.props.microbeatsPerMeasure * 12
      ),
    });
  };
}

export function continuousSingleNoteActivation(): InstrumentActivation {
  return ({ scale, timeSignature, channel, note }) => {
    const start = scale.midiScale.indexOf(note);
    const notes = [0].map((i) => scale.midiScale[start + i]);

    return SequencedActivation({
      channel,
      sequence: notes.flatMap((note) =>
        chordActivation([note], timeSignature.props.microbeatsPerMeasure * 12)
      ),
    });
  };
}

/**
 * Glissando - rapid scale run up and back down.
 * Plays at full velocity (same as main keyboard notes).
 */
export const upDownScaleTriggerHigh: InstrumentActivation = ({
  scale,
  channel,
  note,
}) => {
  const start = scale.midiScale.indexOf(note) - 7;
  const notes = Array(8)
    .fill(null)
    .map((_, i) => i)
    .concat(
      Array(7)
        .fill(null)
        .map((_, i) => i)
        .reverse()
    )
    .map((i) => scale.midiScale[start + i]);
  const sequence = notes.flatMap((note, i) => {
    const duration =
      i == notes.length - 1
        ? scale.timeSignature.props.defaultMicrobeats * 2
        : 1;
    return chordActivation([note], duration);
  });

  return SequencedActivation({
    channel,
    sequence,
    repetitions: 1,
  });
};

export const chordActivation0 = chordActivationN();

export const arpegiatedActivation0 = arpegiatedChordActivationN(0);
