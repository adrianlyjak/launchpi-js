import { ColorButton } from "./ColorButton";
import { GridController } from "./GridController";
import { GridState, renderGrid } from "./GridState";

export interface GridStateWithButtons extends GridState {
  readonly buttons: readonly ColorButton[];
}

export function createButton(
  button: ColorButton,
  state: GridStateWithButtons
): GridStateWithButtons {
  return {
    ...state,
    buttons: state.buttons.concat([button]),
  };
}
export interface StateStore {
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
