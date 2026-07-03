"use client";
import { useEffect, useState } from "react";

const KEY = "coyot_identity_name";

// Remembers the submitter's name across visits so they don't retype it
// on every form/comment — no real accounts, just a convenience.
export function useIdentity() {
  const [name, setNameState] = useState("");

  useEffect(() => {
    const stored = window.localStorage.getItem(KEY);
    if (stored) setNameState(stored);
  }, []);

  function setName(value: string) {
    setNameState(value);
    if (value.trim()) window.localStorage.setItem(KEY, value);
  }

  return { name, setName };
}
