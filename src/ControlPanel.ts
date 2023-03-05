import { GridController, MIDIPress } from "./GridController";
import { Hamfistrument } from "./Hamfistrument";
import { Cancel } from "./messaging";

export function FamilySelectorActor({
  position = 72,
  instrument,
  grid,
}: {
  position?: number;
  instrument: Hamfistrument;
  grid: GridController;
}): Cancel {
  const positions = [position, position + 1];
  function tweakFamily(midiPress: MIDIPress): void {
    if (midiPress.type === "KeyDown") {
      const change = midiPress.keyIndex === position ? 1 : -1;
      instrument.changeScaleFamily(change);
    }
  }
  grid.addEventListener(positions, tweakFamily);
  return () => {
    grid.removeEventListener(positions, tweakFamily);
  };
}

export function FamilyRotationSelectorActor({
  position = 74,
  instrument,
  grid,
}: {
  position?: number;
  instrument: Hamfistrument;
  grid: GridController;
}): Cancel {
  const positions = [position, position + 1];
  function tweakFamily(midiPress: MIDIPress): void {
    if (midiPress.type === "KeyDown") {
      const change = midiPress.keyIndex === position ? -1 : 1;
      instrument.rotateScaleFamily(change);
    }
  }
  grid.addEventListener(positions, tweakFamily);
  return () => {
    grid.removeEventListener(positions, tweakFamily);
  };
}

export function PitchSelectorActor({
  position = 76,
  instrument,
  grid,
}: {
  position?: number;
  instrument: Hamfistrument;
  grid: GridController;
}): Cancel {
  const positions = [position, position + 1];
  function tweakFamily(midiPress: MIDIPress): void {
    if (midiPress.type === "KeyDown") {
      const change = midiPress.keyIndex === position ? -1 : 1;
      instrument.changeStartMidiNote(change);
    }
  }
  grid.addEventListener(positions, tweakFamily);
  return () => {
    grid.removeEventListener(positions, tweakFamily);
  };
}

export function InstrumentSelectorActor({
  position = 78,
  instrument,
  grid,
}: {
  position?: number;
  instrument: Hamfistrument;
  grid: GridController;
}): Cancel {
  let program = 0;
  const positions = [position, position + 1];
  function tweakFamily(midiPress: MIDIPress): void {
    if (midiPress.type === "KeyDown") {
      const change = midiPress.keyIndex === position ? -1 : 1;
      program = Math.max(0, program + change);
      instrument.setInstrument({
        bank: 0,
        program: program,
      });
    }
  }
  grid.addEventListener(positions, tweakFamily);
  return () => {
    grid.removeEventListener(positions, tweakFamily);
  };
}

export function ArpegiateSelectorActor({
  position = 8,
  instrument,
  grid,
}: {
  position?: number;
  instrument: Hamfistrument;
  grid: GridController;
}): Cancel {
  const positions = [position];
  function tweakFamily(midiPress: MIDIPress): void {
    if (midiPress.type === "KeyDown") {
      instrument.toggleArpegiate();
    }
  }
  grid.addEventListener(positions, tweakFamily);
  return () => {
    grid.removeEventListener(positions, tweakFamily);
  };
}
