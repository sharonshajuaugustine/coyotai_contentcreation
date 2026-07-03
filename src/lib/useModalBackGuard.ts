"use client";
import { useEffect, useRef } from "react";

// Traps the browser/hardware back gesture while a modal/form overlay is
// mounted. Without this, pressing back doesn't close the overlay - it
// navigates the whole page away (since the overlay has no history entry
// of its own), silently discarding anything the user typed. This pushes
// one history entry on mount and turns "back" into a controlled close.
//
// Deliberately does NOT try to "consume" the pushed entry on a UI-close
// (e.g. tapping the X button) by calling history.back() in cleanup - that
// would be a real, non-idempotent navigation, and React can invoke effect
// cleanup more than once (Strict Mode's mount->cleanup->mount in dev),
// which would close the overlay immediately after opening it. Leaving a
// harmless extra history entry behind is a fine trade for correctness.
export function useModalBackGuard(onClose: () => void) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    window.history.pushState({ coyotModal: true }, "");

    function onPopState() {
      onCloseRef.current();
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);
}
