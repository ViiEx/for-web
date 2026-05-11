import { JSX, Show, createSignal, splitProps } from "solid-js";

import { cva } from "styled-system/css";
import { styled } from "styled-system/jsx";

import "mdui/components/select.js";

type Variant = "filled" | "outlined";

type Props = Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: string;
  helper?: string;
  variant?: Variant;
  counter?: boolean;
  autoFocus?: boolean;
  type?:
    | "text"
    | "number"
    | "password"
    | "url"
    | "email"
    | "search"
    | "tel"
    | "hidden"
    | "date"
    | "datetime-local"
    | "month"
    | "time"
    | "week";
};

const inputStyles = cva({
  base: {
    height: "36px",
    width: "100%",
    minWidth: 0,
    borderRadius: "var(--borderRadius-xli)",
    border: "1px solid transparent",
    background: "color-mix(in oklab, var(--md-sys-color-surface-container-high) 75%, transparent)",
    color: "var(--md-sys-color-on-surface)",
    paddingInline: "12px",
    paddingBlock: "4px",
    fontSize: "0.875rem",
    fontFamily: "inherit",
    outline: "none",
    transition: "color .15s, box-shadow .15s, background-color .15s, border-color .15s",

    "&::placeholder": {
      color: "var(--md-sys-color-on-surface-variant)",
    },

    "&:focus-visible": {
      borderColor: "var(--md-sys-color-outline)",
      boxShadow: "0 0 0 3px color-mix(in oklab, var(--md-sys-color-outline) 30%, transparent)",
    },

    "&[aria-invalid='true']": {
      borderColor: "var(--md-sys-color-error)",
      boxShadow: "0 0 0 3px color-mix(in oklab, var(--md-sys-color-error) 20%, transparent)",
    },

    "&:disabled": {
      opacity: 0.5,
      pointerEvents: "none",
      cursor: "not-allowed",
    },
  },
});

const Wrapper = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    width: "100%",
  },
});

const Label = styled("label", {
  base: {
    fontSize: "0.8125rem",
    fontWeight: 500,
    color: "var(--md-sys-color-on-surface)",
  },
});

const HelperRow = styled("div", {
  base: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.75rem",
    color: "var(--md-sys-color-on-surface-variant)",
  },
});

/**
 * Luma-styled text input.
 */
export function TextField(props: Props) {
  const [local, rest] = splitProps(props, [
    "label",
    "helper",
    "variant",
    "counter",
    "autoFocus",
  ]);

  const [length, setLength] = createSignal(
    typeof props.value === "string" ? props.value.length : 0,
  );

  return (
    <Wrapper>
      <Show when={local.label}>
        <Label>{local.label}</Label>
      </Show>

      <input
        {...rest}
        autofocus={local.autoFocus}
        class={inputStyles()}
        onInput={(event) => {
          setLength(event.currentTarget.value.length);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const r = rest as any;
          const handler = r.onInput ?? r.oninput;
          if (typeof handler === "function") handler(event);
        }}
      />

      <Show when={local.helper || (local.counter && rest.maxlength)}>
        <HelperRow>
          <span>{local.helper ?? ""}</span>
          <Show when={local.counter && rest.maxlength}>
            <span>
              {length()}/{rest.maxlength}
            </span>
          </Show>
        </HelperRow>
      </Show>
    </Wrapper>
  );
}

/**
 * Select dropdown — still backed by MDUI for now.
 */
function Select(
  props: JSX.HTMLAttributes<HTMLInputElement> & {
    value?: string;
    variant?: Variant;
    required?: boolean;
    disabled?: boolean;
  },
) {
  return <mdui-select {...props} />;
}

TextField.Select = Select;
