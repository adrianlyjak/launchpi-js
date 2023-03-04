import { muteColor, RGB } from "./colors";
import { GridController } from "./GridController";
import { createEffect, updateEffect } from "./GridState";
import { createButton, StateStore } from "./GridStateWithButtons";
import { getColor, getNote } from "./notes";

export interface ColorButton {
  index: number;
  activateLight(): void;
  deactivateLight(): void;
}

export interface ColorButtonContext {
  scale: number[];
  store: StateStore;
  grid: GridController;
  synth: WebMidi.MIDIOutput;
}

export function ColorButton({
  positions,
  index,
  ctx: { scale, store, grid, synth },
}: {
  positions: number[];
  index: number;
  ctx: ColorButtonContext;
}): ColorButton {
  const note = scale[index];
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

  let lightActive: number = 0;
  function activateLight(): void {
    lightActive += 1;
    if (lightActive === 1) {
      for (const neighbor of group) {
        screen[neighbor] = muteColor(color, 1.125);
      }
      store.setState(updateEffect({ ...thisEffect, screen }, store.state));
    }
  }
  function deactivateLight(): void {
    lightActive -= 1;
    if (lightActive === 0) {
      for (const neighbor of group) {
        screen[neighbor] = muted;
      }
      store.setState(updateEffect({ ...thisEffect, screen }, store.state));
    }
  }

  const channel = index % 8; // cludge

  function sleep(ms: number): Promise<void> {
    return new Promise((res) => setTimeout(res, ms));
  }
  function loop(): [Cancel, Promise<void>] {
    let shouldContinue = true;
    async function innerLoop(): Promise<void> {
      while (shouldContinue) {
        activateLight();
        synth.send([144 + channel, note, 127]);
        await sleep(300);
        synth.send([144 + channel, note, 0]);
        deactivateLight();
        const nextButton = store.state.buttons.find(
          (x) => x.index === index + 2
        );
        nextButton?.activateLight();
        synth.send([144 + channel, scale[index + 2], 127]);
        await sleep(300);
        synth.send([144 + channel, scale[index + 2], 0]);
        nextButton?.deactivateLight();
        const nextNextButton = store.state.buttons.find(
          (x) => x.index === index + 4
        );
        nextNextButton?.activateLight();
        synth.send([144 + channel, scale[index + 4], 127]);
        await sleep(300);
        synth.send([144 + channel, scale[index + 4], 0]);
        nextNextButton?.deactivateLight();
      }
    }
    function cancel(): void {
      shouldContinue = false;
    }
    return [cancel, innerLoop()];
  }

  let cancel: undefined | Cancel;

  function trigger() {
    active += 1;
    if (active === 1) {
      cancel && cancel();
      const [c, p] = loop();
      cancel = c;
    }
  }
  function untrigger() {
    active -= 1;
    if (active === 0) {
      cancel && cancel();
    }
  }
  grid.addEventListener(group, (evt) => {
    if (evt.type === "KeyDown") {
      trigger();
    } else {
      untrigger();
    }
  });
  const button: ColorButton = {
    activateLight,
    deactivateLight,
    index,
  };
  store.setState(createButton(button, store.state));
  return button;
}

type Cancel = () => void;
