import { GridController } from "./GridController";
import { GridState, renderGrid } from "./GridState";

export interface StateStore {
  state: GridState;
  setState(gs: GridState): void;
}

export function StateStore(props: {
  initialState: GridState;
  grid: GridController;
}): StateStore {
  var state = props.initialState;
  return {
    get state(): GridState {
      return state;
    },
    setState(gs: GridState): void {
      state = gs;
      props.grid.setGrid(renderGrid(state));
    },
  };
}
