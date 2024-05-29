import * as nav from "jzz";
import React, { ReactNode, useEffect, useState } from "react";

export const WithMidi: React.FC<{
  midi?: WebMidi.MIDIAccess;
  children: ReactNode;
}> = ({ midi, children }) => {
  if (midi && children) {
    return <MidiContext.Provider value={midi}>{children}</MidiContext.Provider>;
  } else {
    return null;
  }
};

export const MidiContext = React.createContext<WebMidi.MIDIAccess>(
  new Error("midi context must be supplied") as any
);
