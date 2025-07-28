"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface ReleaseNote {
  id: string;
  title: string;
  content: string;
  date: string;
}

interface ReleaseNotesContextValue {
  releaseNotes: ReleaseNote[];
  addReleaseNote: (note: ReleaseNote) => void;
  removeReleaseNote: (id: string) => void;
  updateReleaseNote: (note: ReleaseNote) => void;
}

const ReleaseNotesContext = createContext<ReleaseNotesContextValue | undefined>(undefined);

export function ReleaseNotesProvider({ children }: { children: ReactNode }) {
  const [releaseNotes, setReleaseNotes] = useState<ReleaseNote[]>([]);

  function addReleaseNote(note: ReleaseNote) {
    setReleaseNotes((prev) => [...prev, note]);
  }

  function removeReleaseNote(id: string) {
    setReleaseNotes((prev) => prev.filter((note) => note.id !== id));
  }

  function updateReleaseNote(note: ReleaseNote) {
    setReleaseNotes((prev) => prev.map((n) => (n.id === note.id ? note : n)));
  }

  return (
    <ReleaseNotesContext.Provider value={{ releaseNotes, addReleaseNote, removeReleaseNote, updateReleaseNote }}>
      {children}
    </ReleaseNotesContext.Provider>
  );
}

export function useReleaseNotes() {
  const context = useContext(ReleaseNotesContext);
  if (!context) {
    throw new Error("useReleaseNotes must be used within ReleaseNotesProvider");
  }
  return context;
}
