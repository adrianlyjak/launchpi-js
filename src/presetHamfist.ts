import { LaunchpadMiniMK3 } from "./LaunchpadMiniMK3";

import nav from "jzz";
import { muteColor, RGB } from "./colors";
import { GridController } from "./GridController";
import { createEffect, GridState, renderGrid, updateEffect } from "./GridState";
import {
  familyOfHarmonicMajor,
  familyOfHarmonicMinor,
  familyOfMelodicMinor,
  familyOfNaturalMajor,
  getColor,
  getNote,
  Notes,
  rotateFamily,
} from "./notes";

async function sleep(duration: number) {
  return new Promise((res) => setTimeout(res, duration));
}

export async function run() {
  const midi = await nav.requestMIDIAccess({ sysex: true });
  const synth = midi.outputs.get("fluid");
  var outs = [] as any[];
  midi.outputs.forEach((x) => outs.push(x));

  if (!synth) throw new Error("fluidsynth is not connected!");
  const grid: GridController = LaunchpadMiniMK3.fromMidiAccess(midi);

  const store = StateStore({
    initialState: { effects: [], screenDimensions: 9, buttons: [] },
    grid,
  });

  const baseProps = {
    store,
    grid,
    synth,
  };
  const intervals = rotateFamily(familyOfHarmonicMinor, 0);
  const startInteger = 60;
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
  buttonPlacements.map((positions, i) => {
    const rem = i % intervals.length;
    const octave = Math.trunc(i / intervals.length);
    const midi = intervals[rem] + octave * 12 + startInteger;
    return ColorButton({ positions, note: midi, ...baseProps });
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

export interface ColorButton {}

export function ColorButton({
  positions,
  note,
  store,
  grid,
  synth,
}: {
  positions: number[];
  note: number;
  store: StateStore;
  grid: GridController;
  synth: WebMidi.MIDIOutput;
}): ColorButton {
  const noteValue = getNote(note);
  const color = getColor(noteValue);
  const muted = muteColor(color, 0.4);
  const group = positions.flatMap((p) =>
    grid.gridDimensions.withNeighborIndexes(p, 2)
  );
  const screen = grid.gridDimensions.empty as (RGB | undefined)[];
  for (const n of group) {
    screen[n] = muted;
  }
  store.setState(createEffect({ screen }, store.state));
  const thisEffect = store.state.effects[store.state.effects.length - 1];
  let active: number = 0;
  let activeTime: number = 0;
  function trigger() {
    active += 1;
    if (active === 1) {
      activeTime = new Date().valueOf();
      synth.send([144, note, 127]);
      for (const neighbor of group) {
        screen[neighbor] = muteColor(color, 1.125);
      }
      store.setState(updateEffect({ ...thisEffect, screen }, store.state));
    }
  }
  function untrigger() {
    let passed = new Date().valueOf() - activeTime;
    let atLeast = Math.max(0, 300 - passed);
    setTimeout(() => {
      active -= 1;
      if (active === 0) {
        synth.send([144, note, 0]);
        for (const neighbor of group) {
          screen[neighbor] = muted;
        }
        store.setState(updateEffect({ ...thisEffect, screen }, store.state));
      }
    }, atLeast);
  }
  grid.addEventListener(group, (evt) => {
    if (evt.type === "KeyDown") {
      trigger();
    } else {
      untrigger();
    }
  });
  const button: ColorButton = {};
  store.setState(createButton(button, store.state));
  return button;
}

interface GridStateWithButtons extends GridState {
  readonly buttons: readonly ColorButton[];
}

function createButton(
  button: ColorButton,
  state: GridStateWithButtons
): GridStateWithButtons {
  return {
    ...state,
    buttons: state.buttons.concat([button]),
  };
}
interface StateStore {
  state: GridStateWithButtons;
  setState(gs: GridStateWithButtons): void;
}

export function StateStore(props: {
  initialState: GridStateWithButtons;
  grid: GridController;
}): StateStore {
  var state = props.initialState;
  return {
    get state(): GridStateWithButtons {
      return state;
    },
    setState(gs: GridStateWithButtons): void {
      state = gs;
      props.grid.setGrid(renderGrid(state));
    },
  };
}
