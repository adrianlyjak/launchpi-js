import { RGB } from "../functions/colors";
import { MIDIPress } from "./GridController";
import { grid9x9 } from "../functions/GridUtil";
import { LaunchpadMiniMK3 } from "./LaunchpadMiniMK3";
import { Input, MidiCallback, MidiMessage, Output } from "midi";

function mockInput(): Input & { trigger: (msg: MidiMessage) => void } {
  const callbacks: MidiCallback[] = [];
  const input = Object.assign({} as any as Input, {
    on(message: "message", callback: MidiCallback): void {
      callbacks.push(callback);
    },
    trigger(msg: MidiMessage): void {
      for (const c of callbacks) {
        c(new Date().valueOf(), msg);
      }
    },
  });
  return input;
}

function mockOutput(): Output & { sentEvents: number[][] } {
  const sent = [] as number[][];
  const out = Object.assign({} as any as Output, {
    send: (data: any): void => {
      sent.push([...data]);
    },
    sentEvents: sent,
  });
  return out;
}

describe("LaunchpadMiniMK3", () => {
  it("should enter programmer mode", () => {
    const out = mockOutput();
    new LaunchpadMiniMK3(mockInput(), out);
    expect(out.sentEvents).toHaveLength(1);
    expect(out.sentEvents[0]).toEqual([240, 0, 32, 41, 2, 13, 14, 1, 247]);
  });

  it("should set grid colors", () => {
    const out = mockOutput();
    const pad = new LaunchpadMiniMK3(mockInput(), out);
    out.sentEvents.pop();
    pad.setColors([
      { i: 0, c: [1, 1, 1] },
      { i: 80, c: [0, 0, 0] },
    ]);
    expect(out.sentEvents).toHaveLength(1);
    expect(out.sentEvents[0]).toEqual([
      240, 0, 32, 41, 2, 13, 3, 3, 11, 127, 127, 127, 3, 99, 0, 0, 0, 247,
    ]);
  });

  it("should add and remove event listeners", () => {
    const inp = mockInput();
    const pad = new LaunchpadMiniMK3(inp, mockOutput());
    const anyPresses = [] as MIDIPress[];
    const onAny = (evt: MIDIPress): void => {
      anyPresses.push(evt);
    };
    const coupleKeyPresses = [] as MIDIPress[];
    const onCoupleKeyPresses = (evt: MIDIPress): void => {
      coupleKeyPresses.push(evt);
    };
    pad.addEventListener("*", onAny);
    pad.addEventListener([0, 1], onCoupleKeyPresses);
    // bottom left on
    inp.trigger([144, 11, 127]);
    // top right on
    inp.trigger([144, 99, 127]);
    // bottom left off
    inp.trigger([144, 11, 0]);
    pad.removeEventListener("*", onAny);
    inp.trigger([144, 12, 127]);
    pad.removeEventListener([0, 1], onCoupleKeyPresses);
    inp.trigger([144, 12, 0]);
    expect(anyPresses).toHaveLength(3);
    expect(anyPresses.map((x) => x.keyIndex)).toEqual([0, 80, 0]);
    expect(anyPresses.map((x) => x.type)).toEqual([
      "KeyDown",
      "KeyDown",
      "KeyUp",
    ]);
    expect(coupleKeyPresses).toHaveLength(3);
    expect(coupleKeyPresses.map((x) => x.keyIndex)).toEqual([0, 0, 1]);
    expect(coupleKeyPresses.map((x) => x.type)).toEqual([
      "KeyDown",
      "KeyUp",
      "KeyDown",
    ]);
  });
});
