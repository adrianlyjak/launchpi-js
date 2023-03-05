import { LaunchpadMiniMK3 } from "./LaunchpadMiniMK3";

import nav from "jzz";
import { GridController } from "./GridController";
import { StateStore } from "./GridStateWithButtons";
import { Hamfistrument } from "./Hamfistrument";
import { Cancel } from "./messaging";
import { NoteButtonActor } from "./NoteButtonActor";
import { SynthObserver } from "./SynthObserver";
import {
  ArpegiateSelectorActor,
  FamilyRotationSelectorActor,
  FamilySelectorActor,
  InstrumentSelectorActor,
  PitchSelectorActor,
} from "./ControlPanel";

export async function run(): Promise<Cancel> {
  const midi = await nav.requestMIDIAccess({ sysex: true });
  const synth: WebMidi.MIDIOutput | undefined = midi.outputs.get("fluid");

  if (!synth) throw new Error("fluidsynth is not connected!");
  const grid: GridController = LaunchpadMiniMK3.fromMidiAccess(midi);

  const store = StateStore({
    initialState: {
      effects: [],
      screenDimensions: grid.gridDimensions.dimensions,
      buttons: [],
    },
    grid,
  });

  const instrument = new Hamfistrument();
  const stopSynth = SynthObserver({ channels: instrument.channels }, synth);

  const controls = [
    FamilySelectorActor({ instrument, grid }),
    FamilyRotationSelectorActor({ instrument, grid }),
    PitchSelectorActor({ instrument, grid }),
    InstrumentSelectorActor({ instrument, grid }),
    ArpegiateSelectorActor({ instrument, grid }),
  ];

  const buttonPlacements = [
    [0],
    [2],
    [18],
    [20],
    [36],
    [38],
    [54],
    [56, 4],
    [6],
    [22],
    [24],
    [40],
    [42],
    [58],
    [60],
  ];

  const cancelButtons = buttonPlacements.map((position, index) => {
    return NoteButtonActor({
      notePositions: position,
      noteIndex: index,
      context: {
        instrument,
        store,
        grid,
      },
    });
  });
  return () => {
    for (const cancel of cancelButtons.concat(controls).concat([stopSynth])) {
      cancel();
    }
  };
}
