import { nextTick } from "process";
import { addColors, RGB } from "../functions/colors";
import { GridController } from "./GridController";

export type GridEffectID = string;

export interface StateStore {
  createEffect(position: PixelDef): Effect;
  updateEffect(id: GridEffectID, position: PixelUpdate): Effect;
  removeEffect(id: GridEffectID): void;
}

export interface Effect {
  readonly id: string;
  readonly screen: PixelDef;
}

export type PixelUpdate = Map<number, RGB | null>;
export type PixelDef = Map<number, RGB>;

interface IDGenerator {
  next(): string;
}
function IDGenerator(): IDGenerator {
  let id = 0;
  return {
    next(): string {
      return "" + (id += 1);
    },
  };
}
export function StateStore(props: {
  gridController: GridController;
}): StateStore {
  let idGenerator = IDGenerator();
  let effects: Map<string, Effect> = new Map();
  let effectIndexes: Map<number, Effect[]> = new Map();

  const allPixels = new Set(props.gridController.gridDimensions.indexArray());

  let pendingPixels: Set<number> = new Set();
  let scheduled: boolean = false;
  function doRenderTick(): void {
    const commands = [...pendingPixels]
      .map((p) => {
        const values = effectIndexes.get(p);
        if (values) {
          return {
            i: p,
            c: values.reduce((a, b) => addColors(a, b.screen.get(p)!), [
              0, 0, 0,
            ] as RGB),
          };
        } else {
          undefined;
        }
      })
      .filter((x) => !!x) as { i: number; c: RGB }[];

    props.gridController.setColors(commands);
    pendingPixels = new Set();
    scheduled = false;
  }
  function renderPixels(pixels: Set<number> = allPixels): void {
    for (const p of pixels) pendingPixels.add(p);
    if (!scheduled) {
      scheduled = true;
      nextTick(doRenderTick);
    }
  }

  return {
    createEffect(colors: PixelDef): Effect {
      const id = idGenerator.next();
      const effect = {
        id,
        screen: colors,
      };
      effects.set(effect.id, effect);
      for (const [pixel, c] of colors) {
        let arr = effectIndexes.get(pixel);
        if (!arr) {
          arr = [];
          effectIndexes.set(pixel, arr);
        }
        arr.push(effect);
      }
      renderPixels(new Set(colors.keys()));
      return effect;
    },
    updateEffect(id: GridEffectID, update: PixelUpdate): Effect {
      const effect = effects.get(id);
      if (!effect) {
        throw new Error(`no effect with id ${id} exists`);
      }
      for (const [pixel, v] of update) {
        if (v === null) {
          effect.screen.delete(pixel);
          const pixelEffects = effectIndexes.get(pixel);
          const idx = pixelEffects?.findIndex((x) => x.id === id);
          if (pixelEffects && idx && idx > -1) {
            pixelEffects.splice(idx, 1);
          }
        } else {
          effect.screen.set(pixel, v);
          let pixelEffects = effectIndexes.get(pixel);
          if (!pixelEffects) {
            pixelEffects = [];
            effectIndexes.set(pixel, pixelEffects);
          }
          const idx = pixelEffects?.findIndex((x) => x.id === id);
          if (idx === -1) {
            pixelEffects.push(effect);
          }
        }
      }
      renderPixels(new Set(update.keys()));
      return effect;
    },
    removeEffect(id: GridEffectID): void {
      const effect = effects.get(id);
      effects.delete(id);
      if (effect) {
        for (const [pixel, c] of effect.screen) {
          const pixelEffects = effectIndexes.get(pixel);
          const idx = pixelEffects?.findIndex((x) => x.id === id);
          if (idx && idx > -1) {
            pixelEffects?.splice(idx, 1);
          }
        }
        renderPixels(new Set(effect.screen.keys()));
      }
    },
  };
}
