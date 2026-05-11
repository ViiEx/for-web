import { JSX, Show, splitProps } from "solid-js";

import { styled } from "styled-system/jsx";

type Props = {
  children?: JSX.Element;
  required?: boolean;
  name?: string;
  checked?: boolean;
  disabled?: boolean;
  indeterminate?: boolean;
  class?: string;
  onChange?: (event: { currentTarget: { checked: boolean } }) => void;
};

const Root = styled("label", {
  base: {
    display: "inline-flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "0.875rem",
    color: "var(--md-sys-color-on-surface)",
    cursor: "pointer",
    userSelect: "none",
    minHeight: "24px",
    "&[data-disabled='true']": {
      opacity: 0.5,
      cursor: "not-allowed",
    },
  },
});

const NativeInput = styled("input", {
  base: {
    position: "absolute",
    width: "1px",
    height: "1px",
    padding: 0,
    margin: "-1px",
    overflow: "hidden",
    clip: "rect(0,0,0,0)",
    whiteSpace: "nowrap",
    border: 0,
  },
});

const Box = styled("span", {
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    width: "16px",
    height: "16px",
    borderRadius: "4px",
    border: "1px solid var(--md-sys-color-outline)",
    background:
      "color-mix(in oklab, var(--md-sys-color-surface-container-high) 75%, transparent)",
    color: "var(--md-sys-color-on-primary)",
    transition:
      "background-color .15s, border-color .15s, box-shadow .15s, color .15s",

    "input:focus-visible + &": {
      borderColor: "var(--md-sys-color-outline)",
      boxShadow:
        "0 0 0 3px color-mix(in oklab, var(--md-sys-color-outline) 30%, transparent)",
    },

    "input:checked + &": {
      background: "var(--md-sys-color-primary)",
      borderColor: "var(--md-sys-color-primary)",
    },
  },
});

/**
 * Luma-styled checkbox. Native input under the hood for a11y / forms.
 */
export function Checkbox(props: Props) {
  const [local, rest] = splitProps(props, ["children", "class"]);

  return (
    <Root class={local.class} data-disabled={!!props.disabled}>
      <NativeInput
        type="checkbox"
        {...rest}
        onChange={(event) => {
          props.onChange?.({
            currentTarget: { checked: event.currentTarget.checked },
          });
        }}
      />
      <Box>
        <Show when={props.checked}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M2.5 6.2L4.8 8.5L9.5 3.5"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </Show>
        <Show when={!props.checked && props.indeterminate}>
          <svg width="10" height="2" viewBox="0 0 10 2">
            <rect width="10" height="2" rx="1" fill="currentColor" />
          </svg>
        </Show>
      </Box>
      <Show when={local.children}>
        <span>{local.children}</span>
      </Show>
    </Root>
  );
}
