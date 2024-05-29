import { Output } from "midi";
import { SynthOutput } from "./Instrument";
import net from "net";

import { createLogger } from "../logger";

const logger = createLogger("FluidsynthOutput");
export function FluidsynthOutput(
  output: Output,
  port: number = 9800
): SynthOutput {
  return {
    noteon({ channel, note, velocity: volume }) {
      logger.silly(`noton ${note} channel=${channel} velocity=${volume}`);
      output.send([144 + channel, note, Math.round(volume * 127)]);
    },
    noteoff({ channel, note }) {
      logger.silly(`notoff ${note} channel=${channel}`);
      output.send([144 + channel, note, 0]);
    },
    setInstrument({ channel, bank, program }) {
      output.send([192 + channel, program] as any);
      // change bank, (set of instruments) not sure what the 0 is
      output.send([176 + channel, 0, bank]);
    },
  };
}
