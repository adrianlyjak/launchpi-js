import * as mobx from "mobx";
import React, { useContext, useEffect } from "react";
import { createLogger } from "../logger";
import { Channel, Instrument } from "../music/Instrument";
import { SynthAndGridContext } from "./WithSynthAndGrid";

export interface SynthState {
  channels: Channel[];
  name: string;
}

export const SynthObserver: React.FC<{
  instrument: Instrument;
}> = ({ instrument }) => {
  const { synth } = useContext(SynthAndGridContext);
  const logger = createLogger(`SynthObserver:${instrument.name}`);
  useEffect(() => {
    logger.debug("mount");
    const disposers = instrument.channels.flatMap((channel) => {
      const channelLogger = createLogger(
        `SynthObserver:${instrument.name}:${channel.index}`
      );
      const removeNoteReaction = mobx.reaction(
        () => [...mobx.toJS(channel.activeNotes)],
        (currentArr, prevArr) => {
          const prev = new Set(prevArr);
          const current = new Set(currentArr);
          const added = [...current].filter((x) => !prev.has(x));
          const removed = [...prev].filter((x) => !current.has(x));
          channelLogger.debug("trigger note", { added, removed });
          const channelIndex = channel.index; // force drums 9;
          for (const add of added) {
            channelLogger.debug("send add ", [144 + channelIndex, add]);
            synth.send([
              144 + channelIndex,
              add,
              Math.round(channel.volume * 127),
            ]);
          }
          for (const remove of removed) {
            channelLogger.debug("send remove ", [144 + channelIndex, remove]);
            synth.send([144 + channelIndex, remove, 0]);
          }
        },
        { equals: mobx.comparer.structural }
      );
      const removeInstrumentReaction = mobx.reaction(
        () => mobx.toJS(channel.program),
        (current) => {
          // change program (instrument) on the specific channel
          if (current) {
            synth.send([192 + channel.index, current.program] as any);
            // change bank, (set of instruments) not sure what the 0 is
            synth.send([176 + channel.index, 0, current.bank]);
          }
        },
        { equals: mobx.comparer.structural }
      );
      return [removeNoteReaction, removeInstrumentReaction];
    });
    return () => {
      disposers.forEach((x) => x());
    };
  }, []);
  return null;
};
