import { Input, Output } from "midi";
import React, { ReactNode, useEffect, useRef, useState } from "react";
import { Scale } from "../music/Scale";
import { AudioStore } from "../services/AudioStore";
import { Audio, FluidsynthAudio } from "../services/FluidsynthAudio";
import { FluidsynthProcess } from "../services/FluidsynthProcess";
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
  fluidsynthProcess: FluidsynthProcess;
  reconnectSynth(): Promise<void>;
}

export type GridInOut = {
  input: Input;
  output: Output;
};

export const SynthAndGridContext = React.createContext<MidiPorts>(
  new Error("MidiPorts must be provided") as any
);

function findAndOpenSynthPort(): Output {
  const synth = new Output();
  const index = Array(synth.getPortCount())
    .fill(null)
    .map((_, i) => synth.getPortName(i))
    .findIndex((x) => x.toLowerCase().match(/fluid/));

  if (index === -1) throw new Error("fluidsynth is not connected!");
  synth.openPort(index);
  return synth;
}

async function waitForSynthPort(timeoutMs: number = 10000): Promise<Output> {
  const startTime = Date.now();
  while (Date.now() - startTime < timeoutMs) {
    try {
      return findAndOpenSynthPort();
    } catch {
      await new Promise((r) => setTimeout(r, 100));
    }
  }
  throw new Error("Timed out waiting for FluidSynth MIDI port");
}

export const WithSynthAndGrid: React.FC<{
  children: ReactNode;
  gridController: GridController;
  grid: GridInOut;
  fluidsynthProcess: FluidsynthProcess;
}> = ({ gridController, grid, fluidsynthProcess, children }) => {
  const [ports, setPorts] = useState<MidiPorts | undefined>(undefined);
  const synthRef = useRef<Output | null>(null);
  const audioStoreRef = useRef<AudioStore | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      try {
        const synth = findAndOpenSynthPort();
        synthRef.current = synth;
        const scale: Scale = new Scale();
        const audioStore = AudioStore(
          FluidsynthAudio({ port: fluidsynthProcess.shellPort })
        );
        audioStoreRef.current = audioStore;

        const reconnectSynth = async () => {
          // Close old synth if open
          if (synthRef.current) {
            try {
              synthRef.current.closePort();
            } catch {
              // ignore errors on close
            }
          }

          // Wait for new MIDI port and open it
          const newSynth = await waitForSynthPort();
          synthRef.current = newSynth;

          // Restore volume after reconnect
          if (audioStoreRef.current) {
            const currentVolume = audioStoreRef.current.volume;
            if (currentVolume > 0) {
              audioStoreRef.current.setVolume(currentVolume);
            }
          }

          // Update ports state with new synth
          setPorts((prev) => (prev ? { ...prev, synth: newSynth } : prev));
        };

        setPorts({
          synth,
          grid,
          gridController,
          scale,
          audio: audioStore,
          fluidsynthProcess,
          reconnectSynth,
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
