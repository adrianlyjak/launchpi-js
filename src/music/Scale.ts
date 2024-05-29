import * as mobx from "mobx";
import * as notes from "./notes";
import { createLogger, Logger } from "../logger";
import { TimeSignature } from "./TimeSignature";

export class Scale {
  constructor() {
    mobx.makeAutoObservable(this, {
      logger: false,
      baseStartMidiNote: false,
      midiScale: mobx.computed({ keepAlive: true }),
      scaleFamily: mobx.computed({ keepAlive: true }),
    });
    this.timeSignature = TimeSignature({
      microbeatsPerMeasure: 16,
      defaultMicrobeats: 4,
      millisPerMicrobeat: 125,
    });
    this.timeSignature.start();
  }

  readonly timeSignature: TimeSignature;

  logger: Logger = createLogger("Scale");

  /** which scale family to use */
  scaleFamilyIndex: number = 0;

  /**
   * how to rotate the scale family (e.g. 0th rotation of natural major is
   * the major scale, 5th rotation is the minor scale
   */
  private scaleFamilyRotation: number = 0;

  readonly baseStartMidiNote: number = 36;
  /** the lowest note */
  startMidiNote: number = 36;

  // hard coded for now. Number of buttons plus some room for arpegiation
  private nScaleNotes: number = 128;

  nextStart(): void {
    this.changeStartMidiNote(this.scaleFamily[1]);
    this.rotateScaleFamily(1);
    if (this.startMidiNote - this.baseStartMidiNote >= 12)
      this.startMidiNote -= 12;
  }

  /** the scale family intervals */
  get scaleFamily(): number[] {
    return notes.rotateFamily(
      scaleFamilies[this.scaleFamilyIndex]!,
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

  static maxMidi: number = 120;
  static minMidi: number = 12;

  /** increments / decrements the start midi note */
  changeStartMidiNote(change: number): void {
    this.startMidiNote = Math.min(
      Math.max(this.startMidiNote + change, Scale.minMidi),
      Scale.maxMidi
    );
  }

  /** increments / decrements the start midi note */
  setStartMidiNote(index: number): void {
    this.startMidiNote = this.baseStartMidiNote + (index % 12);
  }

  setScaleFamilyIndex(index: number): void {
    this.logger.info(`change scale family index: ${index}`);
    this.scaleFamilyIndex = index;
    this.scaleFamilyRotation = 0;
  }

  /** changes the scale family */
  changeScaleFamily(change: 1 | -1): void {
    this.logger.debug(`change scale family: ${change}`);
    const update = this.scaleFamilyIndex + change;
    this.scaleFamilyIndex =
      update < 0 ? scaleFamilies.length - 1 : update % scaleFamilies.length;
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
}

export const scaleFamilies = [
  notes.familyOfNaturalMajor,
  notes.familyOfMelodicMinor,
  notes.familyOfHarmonicMajor,
  notes.familyOfHarmonicMinor,
];
