import { observable } from "mobx";
import { Audio } from "./FluidsynthAudio";

export interface AudioStore {
  readonly volume: number;
  setVolume(decimal: number): void;
}

export function AudioStore(audio: Audio): AudioStore {
  const volume = observable.box(0);

  audio.getVolume().then((v) => {
    volume.set(v);
  });

  return {
    get volume(): number {
      return volume.get();
    },
    setVolume(decimal) {
      volume.set(decimal);
      audio.setVolume(decimal);
    },
  };
}
