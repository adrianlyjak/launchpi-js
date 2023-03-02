import { LaunchpadMiniMK3 } from "./LaunchpadMiniMK3";

import nav from "jzz";
import { GridController } from "./GridController";
import { grid8x8, grid9x9, GridUtil } from "./GridUtil";
import { getColor, noteColorArray, Notes } from "./notes";
import { RGB } from "./colors";
import { createEffect, GridState, renderGrid } from "./GridState";

async function sleep(duration: number) {
  return new Promise((res) => setTimeout(res, duration));
}

export async function run() {
  const midi = await nav.requestMIDIAccess({ sysex: true });
  const fluid = midi.outputs.get("fluid");
  var outs = [] as any[];
  midi.outputs.forEach((x) => outs.push(x));

  if (!fluid) throw new Error("fluidsynth is not connected!");
  const grid: GridController = LaunchpadMiniMK3.fromMidiAccess(midi);
  grid.addEventListener((msg) => {
    if (msg.data[0] == 144) {
      const position = msg.data[1];
      const idx = grid8x8.positionToIndex(position);
      const note = idx + 36;
      const withNeighbors = new Set(grid8x8.withNeighborIndexes(idx, 2));
      grid.setGrid(
        grid8x8
          .indexArray()
          .map((i) =>
            withNeighbors.has(i) ? ([0.5, 0.5, 0.5] as RGB) : undefined
          ),
        grid8x8
      );
      fluid.send([144, note, msg.data[2]]);
    }
  });

  let gs: GridState = { effects: [], screenDimensions: 8 };

  const notes = [Notes.C, Notes.D, Notes.E, Notes.F, Notes.G, Notes.A, Notes.B];
  grid8x8.indexArray(2).forEach((x, i) => {
    const note = notes[i % notes.length];
    const color = getColor(note);
    const screen: (RGB | undefined)[] = grid8x8.empty;
    for (const j of grid8x8.withNeighborIndexes(x, 2)) {
      screen[j] = color;
    }
    gs = createEffect({ screen: screen }, gs);
  });

  grid.setGrid(renderGrid(gs), grid8x8);
  const controls = Array(9 * 9)
    .fill(null)
    .map((_, i) => {
      if (i % 9 == 8 || i > 71) {
        return [1, 1, 1] as RGB;
      } else {
        return undefined;
      }
    });

  grid.setGrid(controls, grid9x9);
}

interface ColorButton {
  indexes: number[];
}
function ColorButton({ indexes }: { indexes: number[] }): ColorButton {
  return {
    indexes,
  };
}

// map out

const notes = async function testFluidSynthOut(
  fluid: WebMidi.MIDIOutput
): Promise<void> {
  // send a noteon with C3
  fluid.send([144, 60, 127]);
  await sleep(1000);
  fluid.send([144, 60, 0]);
  await sleep(1000);
  // switch bank and program to change instruments to "Thunder" from "GeneralUser" midi
  // font expected to be loaded (position 002-122)
  // https://www.midi.org/specifications-old/item/table-2-expanded-messages-list-status-bytes
  fluid.send([192, 122]); // change program

  // change bank
  // fluid.send([176, 0, 2])

  while (true) {
    await sleep(1000);
    fluid.send([144, 60, 127]);
    await sleep(1000);

    fluid.send([144, 72, 127]);
    await sleep(1000);
    fluid.send([144, 84, 127]);
    await sleep(1000);
    fluid.send([144, 22, 127]);
  }
};
