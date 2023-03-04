import * as mobx from "mobx";
import { Cancel } from "./messaging";
import * as notes from "./notes";

export class Hamfistrument {
  constructor() {
    mobx.makeAutoObservable(this);
  }

  /** which scale family to use */
  scaleFamilyIndex: number = 0;

  /**
   * how to rotate the scale family (e.g. 0th rotation of natural major is
   * the major scale, 5th rotation is the minor scale
   */
  scaleFamilyRotation: number = 0;

  /** the lowest note */
  startMidiNote: number = 60;

  // hard coded for now. Number of buttons plus some room for arpegiation
  nScaleNotes: number = 16 + 4;

  /** state of active notes, for use for flushing state out to synth */
  channels: Channel[] = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => ({
    index: i,
    activeNotes: new Set(),
  }));

  activeChannelIndex: number = 0;

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
    this.startMidiNote += change;
  }

  /** changes the scale family */
  changeScaleFamily(change: 1 | -1): void {
    this.scaleFamilyIndex =
      (this.scaleFamilyIndex + change) % this.scaleFamily.length;
  }

  /** varies the scale family */
  rotateScaleFamily(change: 1 | -1): void {
    this.scaleFamilyRotation =
      (this.scaleFamilyRotation + change) % this.scaleFamily.length;
  }

  triggerNoteIndex(i: number): Cancel {
    this.activeChannelIndex =
      (this.activeChannelIndex += 1) % this.channels.length;
    const channel = this.activeChannelIndex;
    const note = this.midiScale[i];
    this.channels[channel].activeNotes.add(note);
    return (): void => {
      this._untrigger(channel, note);
    };
  }

  _untrigger(channel: number, note: number): void {
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
