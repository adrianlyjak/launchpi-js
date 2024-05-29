import { Input, Output } from "midi";
import React, { ReactNode, useEffect, useState } from "react";
import { Scale } from "../music/Scale";
import { AudioStore } from "../services/AudioStore";
import { Audio, FluidsynthAudio } from "../services/FluidsynthAudio";
import { GridController } from "../services/GridController";

export interface MidiPorts {
  synth: Output;
  grid: {
    input: Input;
    output: Output;
  };
  gridController: GridController;
  scale: Scale;
  audio: AudioStore;
}

export type GridInOut = {
  input: Input;
  output: Output;
};

export const SynthAndGridContext = React.createContext<MidiPorts>(
  new Error("MidiPorts must be provided") as any
);

export const WithSynthAndGrid: React.FC<{
  children: ReactNode;
  gridController: GridController;
  grid: GridInOut;
}> = ({ gridController, grid, children }) => {
  const [ports, setPorts] = useState<MidiPorts | undefined>(undefined);

  useEffect(() => {
    const timer = setInterval(() => {
      try {
        const synth = new Output();
        const index = Array(synth.getPortCount())
          .fill(null)
          .map((_, i) => synth.getPortName(i))
          .findIndex((x) => x.toLowerCase().match(/fluid/));

        if (index === -1) throw new Error("fluidsynth is not connected!");
        else {
          synth.openPort(index);
        }
        const scale: Scale = new Scale();
        setPorts({
          synth,
          grid,
          gridController,
          scale,
          audio: AudioStore(FluidsynthAudio()),
        });
        clearInterval(timer);
      } catch (er) {
        console.error("still loading synth / grid", er);
      }
    }, 500);
    return () => clearInterval(timer);
  }, []);
  if (ports && children) {
    return (
      <SynthAndGridContext.Provider value={ports}>
        {children}
      </SynthAndGridContext.Provider>
    );
  } else {
    return null;
  }
};
