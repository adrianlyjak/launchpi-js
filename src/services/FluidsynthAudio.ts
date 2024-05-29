import net from "net";
import { createLogger } from "../logger";

export interface Audio {
  setVolume(decimal: number): Promise<void>;
  getVolume(): Promise<number>;
}
export function FluidsynthAudio({
  port = 9800,
}: { port?: number } = {}): Audio {
  const logger = createLogger("FluidsynthAudio");
  return {
    async setVolume(decimal: number): Promise<void> {
      var client = new net.Socket();
      logger.debug("connecting fluid synth");
      client.connect(port, "127.0.0.1", () => {
        logger.info("sending volume " + decimal);
        client.write(`set synth.gain ${decimal.toFixed(1)}\nquit\n`);
      });
      await new Promise((r) => client.once("close", r));
    },
    async getVolume(): Promise<number> {
      var client = new net.Socket();
      logger.debug("connecting fluid synth");
      let data: string = "";
      await new Promise<void>((res, rej) =>
        client.connect(port, "127.0.0.1", () => {
          client.write(`get synth.gain\nquit\n`, (err) => err && rej(err));
          client.on("data", (buff) => {
            res();
            data += buff.toString();
          });
        })
      );
      await new Promise((r) => client.once("close", r));
      const result = Number.parseFloat(data.split("\n")[0]);
      return result;
    },
  };
}
