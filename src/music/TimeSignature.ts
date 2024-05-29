import { EventEmitter } from "stream";
import { Cancel } from "../functions/messaging";
import { createLogger } from "../logger";

export interface TimeSignatureProps {
  /** a note cannot be shorter than this */
  readonly millisPerMicrobeat: number;
  /** whole number of notes microbeats per measure */
  readonly microbeatsPerMeasure: number;
  /** whole number for default beats (e.g. "quarter note", which, if microbeats per measure is 16, then this would be 4) */
  readonly defaultMicrobeats: number;
}

export interface TimeSignature {
  readonly props: TimeSignatureProps;
  start(): void;
  stop(): void;
  onTick(cb: () => void): Cancel;
}

let id = 0;

export function TimeSignature(props: TimeSignatureProps): TimeSignature {
  const myId = id++;
  const emitter = new EventEmitter();
  let timer: ReturnType<typeof setInterval> | undefined;
  return {
    props,
    start(): void {
      if (timer) {
        throw new Error("this TimeSignature is already started");
      }
      timer = setInterval(() => {
        emitter.emit("tick");
      }, props.millisPerMicrobeat);
    },
    stop() {
      clearInterval(timer);
    },
    onTick(cb) {
      emitter.on("tick", cb);
      return () => emitter.off("tick", cb);
    },
  };
}
