import { EventEmitter } from "events";
import { Input, Output } from "midi";
import { RGB } from "../functions/colors";
import { grid9x9, GridUtil } from "../functions/GridUtil";
import { createLogger } from "../logger";
import { GridController, MIDIPress, SetGridColor } from "./GridController";

export class LaunchpadMiniMK3 implements GridController {
  private input: Input;
  private output: Output;
  private evt: EventEmitter = new EventEmitter();
  private logger = createLogger("LaunchpadMiniMK3");
  readonly gridDimensions: GridUtil = grid9x9;

  static create() {
    const { input, output } = getMini();
    return new LaunchpadMiniMK3(input, output);
  }

  constructor(input: Input, output: Output) {
    this.input = input;
    this.output = output;
    this.input.on("message", this._onEvent);
    sendSwitchMode(this.output, true);
  }

  private _onEvent = (
    deltaTime: number,
    message: [number, number, number]
  ): void => {
    // noteon and control events. Same structure
    if (message[0] === 144 || message[0] === 176) {
      this.logger.silly("button press " + message.join(","));
      const midiPress: MIDIPress = {
        keyIndex: grid9x9.positionToIndex(message[1]),
        type: message[2] === 0 ? "KeyUp" : "KeyDown",
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

  setColors(grid: SetGridColor[]): void {
    const toSet: SetPaletteColorRGB[] = grid.flatMap(({ i, c: gridValue }) => {
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
    });
    sendSetColors(this.output, ...toSet);
  }
}

function sendSysex(out: Output, bytes: number[]): void {
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
  ] as any);
}

function sendSwitchMode(out: Output, isProgrammerMode: boolean = true): void {
  sendSysex(out, [14, isProgrammerMode ? 1 : 0]);
}

function sendSetColors(out: Output, ...colors: SetColorCommand[]): void {
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

export function getMini(): {
  input: Input;
  output: Output;
} {
  const input = new Input();
  const output = new Output();
  const ins: { name: string; index: number }[] = Array(input.getPortCount())
    .fill(null)
    .map((_, i) => {
      return {
        name: input.getPortName(i),
        index: i,
      };
    });
  const outs: { name: string; index: number }[] = Array(output.getPortCount())
    .fill(null)
    .map((_, i) => {
      return {
        name: output.getPortName(i),
        index: i,
      };
    });
  const inputPort = ins.find((x) => x.name.toLowerCase().match(/lpminimk3/));
  const outputPort = outs.find((x) => x.name.toLowerCase().match(/lpminimk3/));
  if (!inputPort || !outputPort) {
    throw new Error(
      `could not find launchpad input or output. Inputs: ${ins
        .map((x) => x.name)
        .join(", ")} Outputs: ${outs.map((x) => x.name).join(", ")}`
    );
  }
  input.openPort(inputPort.index);
  output.openPort(outputPort.index);
  return { input, output };
}
