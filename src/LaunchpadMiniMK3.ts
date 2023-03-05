import { RGB } from "./colors";
import { EventEmitter } from "events";
import { GridController, MIDIPress } from "./GridController";
import { grid8x8, grid9x9, GridUtil } from "./GridUtil";

export class LaunchpadMiniMK3 implements GridController {
  private input: WebMidi.MIDIInput;
  private output: WebMidi.MIDIOutput;
  private evt: EventEmitter = new EventEmitter();

  readonly gridDimensions: GridUtil = grid9x9;

  static fromMidiAccess(midi: WebMidi.MIDIAccess) {
    const { input, output } = getMini(midi);
    return new LaunchpadMiniMK3(input, output);
  }

  constructor(input: WebMidi.MIDIInput, output: WebMidi.MIDIOutput) {
    this.input = input;
    this.output = output;
    this.input.onmidimessage = this._onEvent;
    sendSwitchMode(this.output, true);
  }

  private _onEvent = (e: WebMidi.MIDIMessageEvent) => {
    // noteon and control events. Same structure
    if (e.data[0] === 144 || e.data[0] === 176) {
      const midiPress: MIDIPress = {
        keyIndex: grid9x9.positionToIndex(e.data[1]),
        type: e.data[2] === 0 ? "KeyUp" : "KeyDown",
      };
      this.evt.emit("midimessage/*", midiPress);
      this.evt.emit("midimessage/" + midiPress.keyIndex, midiPress);
    }
  };

  addEventListener(
    keys: "*" | number[],
    callback: (evt: MIDIPress) => void
  ): void {
    const events =
      keys === "*" ? ["midimessage/*"] : keys.map((n) => "midimessage/" + n);
    for (const e of events) {
      this.evt.on(e, callback);
    }
  }

  removeEventListener(
    keys: "*" | number[],
    callback: (evt: MIDIPress) => void
  ): void {
    const events =
      keys === "*" ? ["midimessage/*"] : keys.map((n) => "midimessage/" + n);
    for (const e of events) {
      this.evt.off(e, callback);
    }
  }

  setGrid(grid: (RGB | undefined)[]): void {
    const toSet: SetPaletteColorRGB[] = grid.flatMap((gridValue, i) => {
      if (!gridValue) {
        return [];
      } else {
        const asInt = gridValue.map((x) => Math.round(x * 127));
        const position = this.gridDimensions.indexToPosition(i);
        const command: SetPaletteColorRGB = [
          3,
          position,
          asInt[0],
          asInt[1],
          asInt[2],
        ];
        return [command];
      }
    });
    sendSetColors(this.output, ...toSet);
  }
}

function sendSysex(out: WebMidi.MIDIOutput, bytes: number[]): void {
  out.send([
    // preamble that seems to be at the start of all sysex type messages
    240,
    0,
    32,
    41,
    2,
    13,
    // data
    ...bytes,
    // 247 seems to be an "end of message" marker
    247,
  ]);
}

function sendSwitchMode(
  out: WebMidi.MIDIOutput,
  isProgrammerMode: boolean = true
): void {
  sendSysex(out, [14, isProgrammerMode ? 1 : 0]);
}

function sendSetColors(
  out: WebMidi.MIDIOutput,
  ...colors: SetColorCommand[]
): void {
  sendSysex(out, [3].concat(colors.flatMap((x) => x)));
}

type GridPosition = number; // 11 - 19, 21 - 29, etc. up to 81 - 89, then finally 91 - 98
type PaletteNumber = number; // 0 - 127
type ColorValue = number; // 0 - 127

type SetPaletteColor = [0, GridPosition, PaletteNumber];
type SetPaletteColorToggle = [1, GridPosition, PaletteNumber, PaletteNumber];
type SetPaletteColorPulse = [2, GridPosition, PaletteNumber, PaletteNumber];
type SetPaletteColorRGB = [3, GridPosition, ColorValue, ColorValue, ColorValue];
type SetColorCommand =
  | SetPaletteColor
  | SetPaletteColorToggle
  | SetPaletteColorPulse
  | SetPaletteColorRGB;

function getMini(midi: WebMidi.MIDIAccess): {
  input: WebMidi.MIDIInput;
  output: WebMidi.MIDIOutput;
} {
  const ins: WebMidi.MIDIInput[] = [];
  midi.inputs.forEach((x) => ins.push(x));
  const outs: WebMidi.MIDIOutput[] = [];
  midi.outputs.forEach((x) => outs.push(x));
  const input = ins.find((x) => x.id.toLowerCase().match(/lpminimk3/));
  const output = outs.find((x) => x.id.toLowerCase().match(/lpminimk3/));
  if (!input || !output) {
    throw new Error(
      `could not find launchpad input or output. Inputs: ${ins
        .map((x) => x.id)
        .join(", ")} Outputs: ${outs.map((x) => x.id).join(", ")}`
    );
  }
  return { input, output };
}
