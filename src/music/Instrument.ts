import { channel } from "diagnostics_channel";
import * as mobx from "mobx";
import { EventEmitter } from "stream";
import { Cancel } from "../functions/messaging";
import { createLogger, Logger } from "../logger";
import { ActivationPlayer } from "./ActivationPlayer";
import {
  InstrumentActivation,
  singleNoteActivation,
} from "./InstrumentActivation";
import { Activation, ActivationChannel } from "./NoteActivation";
import { getNote, Notes } from "./notes";
import { Scale } from "./Scale";
import { TimeSignature } from "./TimeSignature";

export interface InstrumentProps {
  channels: number[];
  scale: Scale;
  maxActive?: number;
  name: string;
}

export interface SynthOutput {
  /**
   * @param channel is the channel index (0 based),
   * @param note is the midi note (127)
   * @param velocity is decimal [0-1] for whatever reason. Needs to be converted to 127
   */
  noteon(props: { channel: number; note: number; velocity: number }): void;
  /**
   * @param channel is the channel index (0 based),
   * @param note is the midi note (127)
   */
  noteoff(props: { channel: number; note: number }): void;
  /**
   * @param channel is the channel index (0 based),
   */
  setInstrument(props: {
    channel: number;
    bank: number;
    program: number;
  }): void;
}

export class Instrument {
  scale: Scale;

  constructor({ channels, scale, maxActive, name }: InstrumentProps) {
    this.channels = channels.map((i) => ({
      index: i,
      activeNotes: [],
      volume: 1,
    }));
    this.scale = scale;
    this.maxActive = maxActive;
    mobx.makeAutoObservable(this, {
      logger: false,
      scale: false,
      player: false,
      name: false,
      outputs: false,
      getMidiNoteAtIndex: false,
      channels: false,
      onMidiNoteActive: false,
      onNoteActive: false,
    });
    this.logger = createLogger(`Instrument:${name}`);
    this.player = ActivationPlayer();
    this.name = name;
    this.timeSignature.onTick(this.player.step);
    this.emitter = new EventEmitter();
  }

  private emitter: EventEmitter;

  readonly name: string;

  player: ActivationPlayer;

  get timeSignature(): TimeSignature {
    return this.scale.timeSignature;
  }
  logger: Logger;

  /** state of active notes, for use for flushing state out to synth */
  readonly channels: Channel[];
  readonly outputs: SynthOutput[] = [];
  maxActive: number | undefined;
  active: Cancel[] = [];

  /** raise or lower the starting note of this instrument on the scale. E.g. to adjust the degree or to modify the octave */
  noteOffset: number = 0;

  addOutput(sink: SynthOutput): void {
    this.outputs.push(sink);
  }

  setNoteOffset(newOffset: number): void {
    this.logger.info("setting note offset to " + newOffset);
    this.noteOffset = newOffset;
  }

  private activeChannelIndex: number = 0;

  arpegiate: boolean = false;

  /** flattened active (midi) note values across all channels */
  get activeNotes(): Set<number> {
    return this.channels.reduce((sum, channel) => {
      channel.activeNotes.forEach((x) => sum.add(x));
      return sum;
    }, new Set<number>());
  }

  onMidiNoteActive(
    midi: number,
    cb: (evt: { active: boolean }) => void
  ): Cancel {
    this.emitter.on(`midi:${midi}`, cb);
    return () => this.emitter.off(`midi:${midi}`, cb);
  }

  onNoteActive(note: Notes, cb: (evt: { active: boolean }) => void): Cancel {
    this.emitter.on(`note:${note}`, cb);
    return () => this.emitter.off(`note:${note}`, cb);
  }

  onSetInstrument(cb: (prog: SynthProgram) => void): Cancel {
    this.emitter.on("instrument", cb);
    return () => this.emitter.off("instrument", cb);
  }
  setInstrument(instrument: SynthProgram): void {
    this.logger.info(
      `set instrument ${instrument.name || ""} bank=${
        instrument.bank
      } program=${instrument.program}`
    );
    for (const channel of this.channels) {
      channel.program = instrument;
    }
    this.emitter.emit("instrument", instrument);
    for (const out of this.outputs) {
      for (const channel of this.channels) {
        out.setInstrument({
          channel: channel.index,
          bank: instrument.bank,
          program: instrument.program,
        });
      }
    }
  }

  /**
   * sets the volume of all channels
   * @param volume number between 0 and 1
   */
  setVolume(volume: number = 1) {
    for (const channel of this.channels) {
      channel.volume = Math.max(0, Math.min(1, volume));
    }
  }

  getMidiNoteAtIndex(index: number): number {
    return this.scale.midiScale[index + this.noteOffset];
  }

  triggerNoteIndex(
    i: number,
    {
      onComplete,
      cancelImmediate = false,
      activation = singleNoteActivation,
    }: {
      onComplete?: () => void;
      cancelImmediate?: boolean;
      activation?: InstrumentActivation;
    } = {}
  ): Cancel {
    this.activeChannelIndex =
      (this.activeChannelIndex + 1) % this.channels.length;
    const channel = this.activeChannelIndex;
    const activationChannel = this.activationChannel(channel);
    const note = this.getMidiNoteAtIndex(i);
    let activated: Activation = activation({
      scale: this.scale,
      timeSignature: this.timeSignature,
      note,
      channel: activationChannel,
    });
    this.player.addActivation(activated, onComplete);
    if (cancelImmediate) {
      return activated.cancelImmediate;
    } else {
      return activated.cancelLoop;
    }
  }

  private activationChannel(channel: number): ActivationChannel {
    return {
      start: (note, velocity): void => {
        this._trigger(channel, note, velocity);
      },
      stop: (note): void => {
        this._untrigger(channel, note);
      },
    };
  }

  private _trigger(channel: number, note: number, velocity?: number): void {
    this.logger.debug("add notes", { channel, note });
    const hasNote = this.channels[channel].activeNotes.includes(note);
    if (!hasNote) {
      const channelObj = this.channels[channel];
      channelObj.activeNotes.push(note);
      for (const o of this.outputs) {
        o.noteon({
          channel: channelObj.index,
          note,
          velocity: velocity ?? this.channels[channel].volume,
        });
      }
      this.emitter.emit(`note:${getNote(note)}`, { active: true });
      this.emitter.emit(`midi:${note}`, { active: true });
    }
  }

  private _untrigger(channel: number, note: number): void {
    this.logger.debug("remove notes", { channel, note });
    const noteIndex = this.channels[channel].activeNotes.indexOf(note);
    if (noteIndex > -1) {
      const channelObj = this.channels[channel];
      channelObj.activeNotes.splice(noteIndex, 1);
      for (const o of this.outputs) {
        o.noteoff({ channel: channelObj.index, note });
      }
      this.emitter.emit(`note:${getNote(note)}`, { active: false });
      this.emitter.emit(`midi:${note}`, { active: false });
    }
  }
}

export interface Channel {
  readonly index: number;
  readonly activeNotes: number[];
  program?: SynthProgram;
  volume: number;
}

export interface SynthProgram {
  bank: number;
  program: number;
  name?: string;
}
