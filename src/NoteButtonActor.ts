import * as mobx from "mobx";
import { GridController, MIDIPress } from "./GridController";
import { createEffect, Effect, updateEffect } from "./GridState";
import { StateStore } from "./StateStore";
import { Hamfistrument } from "./Hamfistrument";
import { Cancel } from "./messaging";
import * as notes from "./notes";
import * as colors from "./colors";
import { createLogger } from "./logger";

export interface NoteButtonActorProps {
  noteIndex: number;
  notePositions: number[];
  context: {
    instrument: Hamfistrument;
    grid: GridController;
    store: StateStore;
  };
}

export function NoteButtonActor({
  noteIndex,
  notePositions,
  context: { instrument, grid, store },
}: NoteButtonActorProps): Cancel {
  let thisEffect: undefined | Effect;

  const logger = createLogger(`NoteButtonActor:${noteIndex}`);

  const neighbors = notePositions.flatMap((notePosition) =>
    grid.gridDimensions.withNeighborIndexes(notePosition, 2)
  );

  function getMidiActive(): {
    midi: number;
    active: boolean;
  } {
    const midi = instrument.midiScale[noteIndex];
    const active = instrument.activeNotes.has(midi);
    return {
      midi,
      active,
    };
  }

  function updateGridLights(midi: MidiActive): void {
    const note = notes.getNote(midi.midi);
    const baseColor = notes.getColor(note);
    const color = midi.active
      ? colors.muteColor(baseColor, 1.25)
      : colors.muteColor(baseColor, 0.5);
    const screen = grid.gridDimensions.empty as (colors.RGB | undefined)[];
    for (const neighbor of neighbors) {
      screen[neighbor] = color;
    }
    logger.debug("update grid lights", midi);
    if (thisEffect) {
      thisEffect = { ...thisEffect, screen };
      store.setState(updateEffect(thisEffect, store.state));
    } else {
      store.setState(createEffect({ screen }, store.state));
      thisEffect = store.state.effects[store.state.effects.length - 1];
    }
  }

  const disposeNoteHighlighting = mobx.reaction(
    getMidiActive,
    updateGridLights,
    {
      equals: mobx.comparer.structural,
      fireImmediately: true,
    }
  );

  let cancelActive: Cancel | undefined;
  let active = 0;
  function onMidiEvent(midipress: MIDIPress) {
    if (midipress.type === "KeyDown") {
      active += 1;
      if (active === 1) {
        logger.debug("trigger");
        cancelActive = instrument.triggerNoteIndex(noteIndex);
      }
    } else {
      active = Math.max(0, active - 1); // fix bug if midi is started with key pressed down
      if (active === 0) {
        logger.debug("untrigger");
        cancelActive && cancelActive();
        cancelActive = undefined;
      }
    }
  }
  grid.addEventListener(neighbors, onMidiEvent);

  return () => {
    disposeNoteHighlighting();
    grid.removeEventListener(neighbors, onMidiEvent);
    cancelActive && cancelActive();
  };
}

interface MidiActive {
  midi: number;
  active: boolean;
}
