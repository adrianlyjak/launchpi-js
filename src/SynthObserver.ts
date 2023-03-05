import { Channel } from "./Hamfistrument";
import { Cancel } from "./messaging";
import * as mobx from "mobx";
import { createLogger } from "./logger";

export interface SynthState {
  channels: Channel[];
}

export function SynthObserver(
  state: SynthState,
  synth: WebMidi.MIDIOutput
): Cancel {
  const disposers = state.channels.flatMap((channel) => {
    const logger = createLogger(`SynthObserver:${channel.index}`);
    const removeNoteReaction = mobx.reaction(
      () => mobx.toJS(channel.activeNotes),
      (current, prev) => {
        const added = [...current].filter((x) => !prev.has(x));
        const removed = [...prev].filter((x) => !current.has(x));
        logger.debug("trigger note", { added, removed });
        const channelIndex = channel.index; // force drums 9;
        for (const add of added) {
          synth.send([144 + channelIndex, add, 127]);
        }
        for (const remove of removed) {
          synth.send([144 + channelIndex, remove, 0]);
        }
      },
      { equals: mobx.comparer.structural }
    );
    const removeInstrumentReaction = mobx.reaction(
      () => channel.instrument,
      (current) => {
        // change program (instrument) on the specific channel
        if (current) {
          logger.debug("set synth", current);
          synth.send([192 + channel.index, current.program]);
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
}
