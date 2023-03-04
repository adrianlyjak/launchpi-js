import { RGB } from "./colors";
import { MIDIPress } from "./GridController";
import { grid9x9 } from "./GridUtil";
import { LaunchpadMiniMK3 } from "./LaunchpadMiniMK3";

function mockInput(): WebMidi.MIDIInput {
  return {
    type: "input",
  } as any as WebMidi.MIDIInput;
}

function mockOutput(): WebMidi.MIDIOutput & { sentEvents: number[][] } {
  const sent = [] as number[][];
  return {
    ...({} as any as WebMidi.MIDIOutput),
    type: "output",
    send: (data) => sent.push([...data]),
    sentEvents: sent,
  };
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
    const corners: (RGB | undefined)[] = grid9x9.empty;
    corners[0] = [1, 1, 1];
    corners[80] = [0, 0, 0];
    pad.setGrid(corners);
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
    inp.onmidimessage({
      data: new Uint8Array([144, 11, 127]),
    } as WebMidi.MIDIMessageEvent);
    // top right on
    inp.onmidimessage({
      data: new Uint8Array([144, 99, 127]),
    } as WebMidi.MIDIMessageEvent);
    // bottom left off
    inp.onmidimessage({
      data: new Uint8Array([144, 11, 0]),
    } as WebMidi.MIDIMessageEvent);
    pad.removeEventListener("*", onAny);
    inp.onmidimessage({
      data: new Uint8Array([144, 12, 127]),
    } as WebMidi.MIDIMessageEvent);
    pad.removeEventListener([0, 1], onCoupleKeyPresses);
    inp.onmidimessage({
      data: new Uint8Array([144, 12, 0]),
    } as WebMidi.MIDIMessageEvent);
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
