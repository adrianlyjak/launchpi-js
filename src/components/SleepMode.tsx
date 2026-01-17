import React, { useCallback, useContext, useEffect, useRef } from "react";
import { createLogger } from "../logger";
import { SynthAndGridContext } from "./WithSynthAndGrid";

const logger = createLogger("SleepMode");

export const SleepMode: React.FC<{
  sleeping: boolean;
  setSleeping: (sleeping: boolean) => void;
  delayMillis?: number;
}> = ({ sleeping, setSleeping, delayMillis = 60000 }) => {
  const { gridController, fluidsynthProcess, reconnectSynth } =
    useContext(SynthAndGridContext);
  const wakingRef = useRef(false);

  const beSleeping = useCallback(() => setSleeping(true), [setSleeping]);

  useEffect(() => {
    if (sleeping) {
      // Stop FluidSynth when entering sleep (disconnects audio stream)
      logger.info("Entering sleep mode, stopping FluidSynth");
      fluidsynthProcess.stop();

      const beAwake = async () => {
        // Prevent multiple simultaneous wake attempts
        if (wakingRef.current) return;
        wakingRef.current = true;

        logger.info("Waking up, starting FluidSynth");
        try {
          await fluidsynthProcess.start();
          await reconnectSynth();
          setSleeping(false);
        } catch (err) {
          logger.error("Failed to wake up", err);
        } finally {
          wakingRef.current = false;
        }
      };

      gridController.addEventListener("*", beAwake);
      return () => gridController.removeEventListener("*", beAwake);
    } else {
      let sleepTimer: undefined | ReturnType<typeof setTimeout>;
      function startTimer() {
        clearTimeout(sleepTimer);
        sleepTimer = setTimeout(beSleeping, delayMillis);
      }
      startTimer();
      gridController.addEventListener("*", startTimer);
      return () => {
        gridController.removeEventListener("*", startTimer);
        clearTimeout(sleepTimer);
      };
    }
  }, [
    sleeping,
    beSleeping,
    gridController,
    fluidsynthProcess,
    reconnectSynth,
    setSleeping,
  ]);

  return null;
};
