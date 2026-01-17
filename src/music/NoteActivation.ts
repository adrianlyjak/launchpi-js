import { createLogger } from "../logger";

export interface ActivationChannel {
  start: (note: number, velocity?: number) => void;
  stop: (note: number) => void;
}

export interface NoteActivation {
  /** the absolute midi note */
  note: number;
  /** micro beats */
  beats?: number;
  /** velocity 0-1, defaults to channel volume */
  velocity?: number;
}

export interface Activation {
  /** continue to play next note, and interrupt any notes that should be complete
   * @returns true if complete and this activation should be discarded */
  step(): boolean;
  cancelImmediate(): void;
  cancelLoop(): void;
}

export function chordActivation(
  notes: number[],
  microbeats: number,
  velocity?: number
): NoteActivation[][] {
  return [
    notes.map((note) => {
      return {
        note: note,
        beats: microbeats,
        velocity,
      };
    }),
  ].concat(Array(microbeats - 1).fill([]));
}

export function restActivation(microbeats: number): NoteActivation[][] {
  return Array(microbeats).fill([]);
}

export function chordSustainedActivation(notes: number[]): NoteActivation[][] {
  return [notes.map((n) => ({ note: n }))];
}

export function intersperseActivation(
  a: NoteActivation[][],
  b: NoteActivation[][]
): NoteActivation[][] {
  return Array(Math.max(a.length, b.length))
    .fill(undefined)
    .map((_, i) => {
      return (a[i] || []).concat(b[i] || []);
    });
}

export interface SimpleActivationProps {
  note: number;
  channel: ActivationChannel;
}

export function SimpleActivation({
  channel,
  note,
}: SimpleActivationProps): Activation {
  channel.start(note);
  let complete = false;
  const self: Activation = {
    step() {
      return complete;
    },
    cancelImmediate() {
      complete = true;
      channel.stop(note);
    },
    cancelLoop() {
      self.cancelImmediate();
    },
  };
  return self;
}

export interface SequencedActivationProps {
  /** lists of notes to activate at each beat */
  sequence: NoteActivation[][];
  repetitions?: number;
  channel: ActivationChannel;
}

/**
 * creates a note activation sequence that may be stepped through
 */
export function SequencedActivation({
  sequence,
  repetitions,
  channel,
}: SequencedActivationProps): Activation {
  const logger = createLogger("SequencedActivation");
  const seq = mapSequence(sequence);
  let position = 0;
  let maxRepetitions = repetitions;
  let repetition = 0;
  const seenNotes = new Set<number>();
  let destroyed = false;
  function unwind() {
    for (const note of allNotes(seq)) {
      channel.stop(note);
    }
    destroyed = true;
  }
  return {
    step(): boolean {
      if (destroyed) {
        return true;
      }
      let unwinding = repetition === maxRepetitions;
      const commands = seq[position];
      for (const command of commands) {
        if (command.on) {
          const repititionOk = !command.oneTime || repetition === 0;
          if (repititionOk && !unwinding) {
            channel.start(command.note, command.velocity);
          }
        } else {
          if (seenNotes.has(command.note)) {
            channel.stop(command.note);
          }
        }
      }
      // prevent initial simultaneous on/aff from creating a buggy note
      for (const command of commands) {
        seenNotes.add(command.note);
      }
      position = (position + 1) % seq.length;
      if (position === 0) {
        repetition += 1;
      }
      const done = unwinding;
      if (done) {
        unwind();
      }
      return done;
    },
    cancelImmediate(): void {
      if (!destroyed) {
        unwind();
      }
    },
    cancelLoop(): void {
      if (!destroyed) {
        maxRepetitions = repetition + 1;
      }
    },
  };
}

export interface OnOff {
  note: number;
  on: boolean;
  oneTime?: boolean;
  velocity?: number;
}

export function mapSequence(sequence: NoteActivation[][]): OnOff[][] {
  const indices: OnOff[][] = Array(sequence.length)
    .fill(undefined)
    .map(() => []);
  sequence.forEach((notes, i) => {
    notes.forEach((note) => {
      if (note.beats !== undefined) {
        indices[(i + note.beats) % indices.length].push({
          note: note.note,
          on: false,
        });
      }
      indices[i].push({
        note: note.note,
        on: true,
        velocity: note.velocity,
        ...(note.beats === undefined ? { oneTime: true } : {}),
      });
    });
  });
  return indices;
}

function allNotes(onOffs: OnOff[][]): number[] {
  return [...new Set(onOffs.flatMap((xs) => xs.map((x) => x.note)))];
}
