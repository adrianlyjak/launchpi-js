import * as mobx from "mobx";
import { createLogger, Logger } from "./logger";
import { Cancel, sleep } from "./messaging";
import * as notes from "./notes";

export class Hamfistrument {
  constructor() {
    mobx.makeAutoObservable(this, {
      logger: false,
    });
  }

  logger: Logger = createLogger("Hamfistrument");

  /** which scale family to use */
  private scaleFamilyIndex: number = 0;

  /**
   * how to rotate the scale family (e.g. 0th rotation of natural major is
   * the major scale, 5th rotation is the minor scale
   */
  private scaleFamilyRotation: number = 0;

  /** the lowest note */
  private startMidiNote: number = 60;

  // hard coded for now. Number of buttons plus some room for arpegiation
  private nScaleNotes: number = 16 + 4;

  /** state of active notes, for use for flushing state out to synth */
  channels: Channel[] = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => ({
    index: i,
    activeNotes: new Set(),
  }));

  private activeChannelIndex: number = 0;

  arpegiate: boolean = false;

  /** the scale family intervals */
  get scaleFamily(): number[] {
    return notes.rotateFamily(
      scales[this.scaleFamilyIndex]!,
      this.scaleFamilyRotation
    );
  }

  /** the full midi scale */
  get midiScale(): number[] {
    return Array(this.nScaleNotes)
      .fill(null)
      .map((_, i) => {
        const rem = i % this.scaleFamily.length;
        const octave = Math.trunc(i / this.scaleFamily.length);
        return this.scaleFamily[rem] + octave * 12 + this.startMidiNote;
      });
  }

  /** flattened active (midi) note values across all channels */
  get activeNotes(): Set<number> {
    return this.channels.reduce((sum, channel) => {
      channel.activeNotes.forEach((x) => sum.add(x));
      return sum;
    }, new Set<number>());
  }

  /** increments / decrements the start midi note */
  changeStartMidiNote(change: 1 | -1): void {
    this.startMidiNote = Math.min(
      Math.max(this.startMidiNote + change, 12),
      120
    );
  }

  /** changes the scale family */
  changeScaleFamily(change: 1 | -1): void {
    this.logger.debug(`change scale family: ${change}`);
    const update = this.scaleFamilyIndex + change;
    this.scaleFamilyIndex =
      update < 0 ? scales.length - 1 : update % scales.length;
    this.scaleFamilyRotation = 0;
  }

  /** varies the scale family */
  rotateScaleFamily(change: 1 | -1): void {
    this.logger.debug(`rotate scale family: ${change}`);
    const update = this.scaleFamilyRotation + change;
    this.scaleFamilyRotation =
      update < 0
        ? this.scaleFamily.length - 1
        : update % this.scaleFamily.length;
  }

  setInstrument(instrument: Instrument): void {
    for (const channel of this.channels) {
      channel.instrument = instrument;
    }
  }

  toggleArpegiate(): void {
    this.arpegiate = !this.arpegiate;
  }

  triggerNoteIndex(i: number): Cancel {
    this.activeChannelIndex =
      (this.activeChannelIndex + 1) % this.channels.length;
    const channel = this.activeChannelIndex;
    const activationChannel = this.activationChannel(channel);
    const single: boolean = false;
    if (!this.arpegiate) {
      const note = this.midiScale[i];

      return SingleNoteActivation({
        midi: note,
        channel: activationChannel,
      });
    } else {
      const midiNotes = [0, 2, 4].map((incr) => this.midiScale[i + incr]);
      return ArpegiatedChordActivation({
        midiNotes: midiNotes,
        channel: activationChannel,
      });
    }
  }

  private activationChannel(channel: number): ActivationChannel {
    return {
      start: (note): void => {
        this._trigger(channel, note);
      },
      stop: (note): void => {
        this._untrigger(channel, note);
      },
    };
  }

  private _trigger(channel: number, note: number): void {
    this.logger.debug("add notes", { channel, note });
    this.channels[channel].activeNotes.add(note);
  }

  private _untrigger(channel: number, note: number): void {
    this.logger.debug("remove notes", { channel, note });
    this.channels[channel].activeNotes.delete(note);
  }
}

const scales = [
  notes.familyOfNaturalMajor,
  notes.familyOfNaturalMajor,
  notes.familyOfHarmonicMajor,
  notes.familyOfHarmonicMinor,
];

export interface Channel {
  index: number;
  activeNotes: Set<number>;
  instrument?: Instrument;
}

export interface Instrument {
  bank: number;
  program: number;
}

interface ActivationChannel {
  start: (note: number) => void;
  stop: (note: number) => void;
}

function SingleNoteActivation({
  midi,
  minMillis = 300,
  channel: { start, stop },
}: {
  midi: number;
  minMillis?: number;
  channel: ActivationChannel;
}): Cancel {
  let startTime = new Date().valueOf();
  start(midi);
  return () => {
    let end = new Date().valueOf();
    let remaining = Math.max(minMillis - (end - startTime), 0);
    setTimeout(() => {
      stop(midi);
    }, remaining);
  };
}

function ArpegiatedChordActivation({
  midiNotes,
  millisPerNote = 300,
  channel: { start, stop },
}: {
  midiNotes: number[];
  millisPerNote?: number;
  channel: ActivationChannel;
}): Cancel {
  let complete = false;

  async function loop() {
    while (!complete) {
      for (const note of midiNotes) {
        start(note);
        await sleep(millisPerNote);
        stop(note);
      }
    }
  }
  loop();

  return () => {
    complete = true;
  };
}
