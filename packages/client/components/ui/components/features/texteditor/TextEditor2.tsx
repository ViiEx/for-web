import { lazy } from "solid-js";

// Lazy wrapper so the @codemirror/* + lang-markdown + etc. graph is split into
// its own chunk and only fetched when a text editor is rendered (compose box,
// edit message, settings forms).
export const TextEditor2 = lazy(() =>
  import("./TextEditor2.impl").then((m) => ({ default: m.TextEditor2 })),
);
