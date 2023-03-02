// retrieving current state
// patching current state
// syncing color state to controller
//
// how to -
//   - run independent animations whose colors mix

import { addColors, RGB } from "./colors";
import { GridUtil } from "./GridUtil";

export interface GridState {
  readonly screenDimensions: number;
  readonly effects: readonly Effect[];
}

export interface Effect {
  id: string;
  screen: (RGB | undefined)[];
}

export function renderGrid(gridState: GridState): (RGB | undefined)[] {
  return new GridUtil(gridState.screenDimensions).indexArray().map((i) => {
    const values = gridState.effects.flatMap((effect) => {
      const pixel = effect.screen[i];
      return pixel ? [pixel] : [];
    });
    if (!values.length) {
      return undefined;
    } else {
      return values.reduce((a, b) => addColors(a, b), [0, 0, 0]);
    }
  });
}

export function createEffect(
  effect: Omit<Effect, "id">,
  gridState: GridState
): GridState {
  return {
    ...gridState,
    effects: gridState.effects.concat([{ ...effect, id: nextId() }]),
  };
}

export function updateEffect(effect: Effect, gridState: GridState): GridState {
  return {
    ...gridState,
    effects: gridState.effects.map((x) => (x.id === effect.id ? effect : x)),
  };
}

export function deleteEffect(
  effectId: string,
  gridState: GridState
): GridState {
  return {
    ...gridState,
    effects: gridState.effects.filter((x) => x.id !== effectId),
  };
}

let id = 0;
function nextId(): string {
  id += 1;
  return `${id}`;
}
