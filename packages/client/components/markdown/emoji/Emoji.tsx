import { Match, Switch } from "solid-js";

import { styled } from "styled-system/jsx";

import { CustomEmoji, UnicodeEmoji } from ".";

/**
 * Image component for rendering emojis
 */
export const EmojiBase = styled("img", {
  base: {
    objectFit: "contain",
    display: "inline-block",
    width: "var(--emoji-size)",
    height: "var(--emoji-size)",
    margin: "0 0.05em 0 0.1em",
    verticalAlign: "-0.3em",

    // hide alt text
    color: "transparent",
  },
});

/**
 * Span used when an emoji image fails to load — renders the unicode glyph
 * via the OS emoji font, sized to match {@link EmojiBase}.
 */
export const EmojiFallback = styled("span", {
  base: {
    display: "inline-block",
    width: "var(--emoji-size)",
    height: "var(--emoji-size)",
    fontSize: "var(--emoji-size)",
    lineHeight: "var(--emoji-size)",
    textAlign: "center",
    margin: "0 0.05em 0 0.1em",
    verticalAlign: "-0.3em",
    fontFamily:
      '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", "Twemoji Mozilla", "EmojiOne Color", sans-serif',
    fontStyle: "normal",
    whiteSpace: "nowrap",
  },
});

/**
 * Render an individual emoji
 */
export function Emoji(props: { emoji: string }) {
  return (
    <Switch fallback={<UnicodeEmoji emoji={props.emoji} />}>
      <Match when={props.emoji.length === 26}>
        <CustomEmoji id={props.emoji} />
      </Match>
    </Switch>
  );
}
