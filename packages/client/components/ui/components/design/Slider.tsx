import { type JSX, splitProps } from "solid-js";

import { css } from "styled-system/css";

type Props = Omit<
  JSX.HTMLAttributes<HTMLInputElement>,
  "onChange" | "onInput"
> & {
  min?: number;
  max?: number;
  step?: number;
  value: number;
  tickmarks?: boolean;
  labelFormatter?: (value: number) => string;
  onChange?: (event: { currentTarget: { value: number } }) => void;
  onInput?: (event: { currentTarget: { value: number } }) => void;
  disabled?: boolean;
};

const styles = css({
  appearance: "none",
  WebkitAppearance: "none",
  width: "100%",
  height: "20px",
  background: "transparent",
  outline: "none",
  cursor: "pointer",

  "&:disabled": {
    opacity: 0.5,
    cursor: "not-allowed",
  },

  "&::-webkit-slider-runnable-track": {
    height: "4px",
    borderRadius: "2px",
    background:
      "linear-gradient(to right, var(--md-sys-color-primary) 0%, var(--md-sys-color-primary) var(--_filled, 0%), var(--md-sys-color-surface-container-highest) var(--_filled, 0%), var(--md-sys-color-surface-container-highest) 100%)",
  },
  "&::-moz-range-track": {
    height: "4px",
    borderRadius: "2px",
    background: "var(--md-sys-color-surface-container-highest)",
  },
  "&::-moz-range-progress": {
    height: "4px",
    borderRadius: "2px",
    background: "var(--md-sys-color-primary)",
  },

  "&::-webkit-slider-thumb": {
    WebkitAppearance: "none",
    width: "16px",
    height: "16px",
    borderRadius: "50%",
    background: "var(--md-sys-color-primary)",
    border: "2px solid var(--md-sys-color-surface)",
    boxShadow: "0 1px 2px rgba(0,0,0,0.3)",
    marginTop: "-6px",
    cursor: "pointer",
    transition: "transform .1s",
  },
  "&::-moz-range-thumb": {
    width: "16px",
    height: "16px",
    borderRadius: "50%",
    background: "var(--md-sys-color-primary)",
    border: "2px solid var(--md-sys-color-surface)",
    boxShadow: "0 1px 2px rgba(0,0,0,0.3)",
    cursor: "pointer",
  },

  "&:focus-visible::-webkit-slider-thumb": {
    boxShadow:
      "0 0 0 4px color-mix(in oklab, var(--md-sys-color-primary) 25%, transparent)",
  },
  "&:focus-visible::-moz-range-thumb": {
    boxShadow:
      "0 0 0 4px color-mix(in oklab, var(--md-sys-color-primary) 25%, transparent)",
  },
});

/**
 * Luma-styled range slider on top of the native range input.
 */
export function Slider(props: Props) {
  const [, rest] = splitProps(props, [
    "labelFormatter",
    "tickmarks",
    "onChange",
    "onInput",
  ]);

  const min = () => props.min ?? 0;
  const max = () => props.max ?? 100;
  const filled = () => {
    const range = max() - min();
    if (range <= 0) return 0;
    return ((props.value - min()) / range) * 100;
  };

  return (
    <input
      type="range"
      {...rest}
      class={styles}
      style={{ "--_filled": `${filled()}%` }}
      onInput={(event) => {
        props.onInput?.({
          currentTarget: { value: +event.currentTarget.value },
        });
      }}
      onChange={(event) => {
        props.onChange?.({
          currentTarget: { value: +event.currentTarget.value },
        });
      }}
    />
  );
}
