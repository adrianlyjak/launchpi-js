import React, {
  ReactElement,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { Canvas } from "../components/Canvas";
import {
  ChordsInstrument,
  useChordsState,
} from "../components/ChordsInstrument";
import { LongPress } from "../components/LongPress";
import { NotesInstrument } from "../components/NotesInstrument";
import { SharedLock } from "../components/SharedLock";
import { SleepMode } from "../components/SleepMode";
import { TonicSelector } from "../components/TonicSelector";
import { VolumeSelector } from "../components/VolumeSelector";
import { SynthAndGridContext } from "../components/WithSynthAndGrid";
import { createLogger } from "../logger";
import { Instrument } from "../music/Instrument";
import { FluidsynthOutput } from "../music/SynthOutput";

const logger = createLogger("HamfistAppPage");
export const HamfistAppPage: React.FC<{}> = ({}): ReactElement<any, any> => {
  const { scale, synth } = useContext(SynthAndGridContext);
  const notes = useMemo(() => {
    const note = new Instrument({
      scale,
      channels: [1, 2, 3, 4, 5, 6],
      name: "Notes",
    });
    note.setNoteOffset(7 * 2);
    note.addOutput(FluidsynthOutput(synth));
    return note;
  }, []);
  const chords = useMemo(() => {
    const ch = new Instrument({ scale, channels: [0], name: "Chords" });
    ch.player.setMaxActivations(1);
    ch.setVolume(0.75);
    ch.setNoteOffset(7 * 2);
    ch.addOutput(FluidsynthOutput(synth));
    return ch;
  }, []);

  const [mode, setMode] = useState<Modes>("Instrument");
  const setSleeping = useCallback((isSleeping: boolean) => {
    logger.info(isSleeping ? "Entering sleep mode" : "Exiting sleep mode");
    setMode(isSleeping ? "Sleeping" : "Instrument");
  }, []);
  const chordActivations = useChordsState();
  const isSleeping = mode === "Sleeping";

  const nextMode = useCallback(() => {
    setMode((mode) => {
      if (mode === "Instrument") {
        return "Controls";
      } else {
        return "Instrument";
      }
    });
  }, []);
  const modeToggleDelay = mode === "Instrument" ? 2000 : 0;
  return (
    <>
      {/* Sinks */}
      <SleepMode
        setSleeping={setSleeping}
        sleeping={isSleeping}
        delayMillis={60000}
      />
      <Canvas />
      {mode !== "Sleeping" ? (
        <>
          <ModeToggle
            position={79}
            onTrigger={nextMode}
            delayMillis={modeToggleDelay}
          />
        </>
      ) : null}

      {/* Pages - Instrument */}
      {mode === "Instrument" ? (
        <SharedLock
          delayMillis={
            (scale.timeSignature.props.microbeatsPerMeasure *
              scale.timeSignature.props.millisPerMicrobeat) /
            2
          }
          relockAfter={240000}
          position={78}
          lockedColor={[1, 0, 0]}
          unlockingColor={[0, 1, 0]}
        >
          <ChordsInstrument
            chords={chords}
            notes={notes}
            bottomLeftPosition={36}
            activationState={chordActivations}
          />
          <NotesInstrument notes={notes} bottomLeftPosition={0} />
        </SharedLock>
      ) : null}
      {/* Pages - Controls */}
      {mode === "Controls" ? (
        <>
          <VolumeSelector />
          <TonicSelector />
        </>
      ) : null}
    </>
  );
};

type Modes = "Instrument" | "Controls" | "Sleeping";

const ModeToggle: React.FC<{
  position: number;
  onTrigger: () => void;
  delayMillis: number;
}> = ({ position, onTrigger, delayMillis }) => {
  return (
    <LongPress
      activeColor={[1, 1, 1]}
      idleColor={[0.0, 0.0, 0.5]}
      onKeypress={onTrigger}
      position={position}
      delayMillis={delayMillis}
    />
  );
};
