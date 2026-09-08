// Shared, named focus treatments. Every interactive element in the
// app picks one of these instead of components each inventing their
// own ring classes — three genuinely different contexts, but the
// menu of options lives in exactly one place.

// Default: an element with visible space around it (buttons on a
// plain background, standalone icon buttons).
export const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg";

// Same, but for elements sitting on the lighter "surface" background
// (e.g. rows inside a card) — the offset color has to match its
// backdrop or the ring gap looks like a mistake.
export const FOCUS_RING_ON_SURFACE =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

// Inset: for full-width disclosure buttons where an offset ring would
// get clipped by the parent's rounded/overflow-hidden edges.
export const FOCUS_RING_INSET =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset";

// Plain, no offset: for bordered form fields (input/select/textarea)
// and tightly-packed pills, where an offset ring would either double
// up with the existing border or get clipped by a tight flex gap.
export const FOCUS_RING_FIELD = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent";
