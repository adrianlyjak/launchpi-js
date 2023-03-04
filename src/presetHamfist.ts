import { LaunchpadMiniMK3 } from "./LaunchpadMiniMK3";

import nav from "jzz";
import { ColorButton, ColorButtonContext } from "./ColorButton";
import { RGB } from "./colors";
import { GridController } from "./GridController";
import { StateStore } from "./GridStateWithButtons";
import {
  familyOfHarmonicMajor,
  familyOfHarmonicMinor,
  familyOfMelodicMinor,
  familyOfNaturalMajor,
  rotateFamily,
} from "./notes";

export async function run() {
  const midi = await nav.requestMIDIAccess({ sysex: true });
  const synth: WebMidi.MIDIOutput | undefined = midi.outputs.get("fluid");

  if (!synth) throw new Error("fluidsynth is not connected!");
  const grid: GridController = LaunchpadMiniMK3.fromMidiAccess(midi);

  const store = StateStore({
    initialState: { effects: [], screenDimensions: 9, buttons: [] },
    grid,
  });

  const intervals = rotateFamily(familyOfNaturalMajor, 0);
  const startInteger = 56;
  const buttonPlacements = [
    [0],
    [2],
    [4],
    [6],

    [24],
    [22],
    [20],
    [18],

    [36],
    [38],
    [40],
    [42],

    [60],
    [58],
    [56],
    [54],
  ];

  Array(8)
    .fill(null)
    .forEach((_, i) => {
      //  // https://www.midi.org/specifications-old/item/table-2-expanded-messages-list-status-bytes
      // change program (instrument) on the specific channel
      synth.send([192 + i, 0]);
      // change bank, (instrument set) not sure what the 0 is
      synth.send([176 + i, 0, 1]);
    });

  const scale = Array(buttonPlacements.length + 4)
    .fill(null)
    .map((_, i) => {
      const rem = i % intervals.length;
      const octave = Math.trunc(i / intervals.length);
      return intervals[rem] + octave * 12 + startInteger;
    });
  const ctx: ColorButtonContext = { scale, store, grid, synth };
  buttonPlacements.map((positions, index) => {
    return ColorButton({ positions, index, ctx });
  });
  const controls = Array(9 * 9)
    .fill(null)
    .map((_, i) => {
      if (i % 9 == 8 || i > 71) {
        return [0.1, 0.1, 0.1] as RGB;
      } else {
        return undefined;
      }
    });

  grid.setGrid(controls);
}
