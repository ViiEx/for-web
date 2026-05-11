import { JSX, Show } from "solid-js";

import { Select as KSelect } from "@kobalte/core/select";
import { css } from "styled-system/css";

export type SelectOption<T = string> = {
  value: T;
  label: JSX.Element | (() => JSX.Element);
  disabled?: boolean;
};

function renderLabel(label: JSX.Element | (() => JSX.Element)): JSX.Element {
  return typeof label === "function" ? (label as () => JSX.Element)() : label;
}

type Props<T extends string = string> = {
  options: SelectOption<T>[];
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;
  placeholder?: JSX.Element;
  label?: JSX.Element;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  size?: "sm" | "default";
  title?: string;
  class?: string;
};

const trigger = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "6px",
  width: "100%",
  minWidth: 0,
  height: "36px",
  paddingInline: "12px",
  paddingBlock: "4px",
  borderRadius: "var(--borderRadius-xli)",
  border: "1px solid transparent",
  background:
    "color-mix(in oklab, var(--md-sys-color-surface-container-high) 75%, transparent)",
  color: "var(--md-sys-color-on-surface)",
  fontSize: "0.875rem",
  fontFamily: "inherit",
  outline: "none",
  cursor: "pointer",
  whiteSpace: "nowrap",
  transition:
    "color .15s, box-shadow .15s, background-color .15s, border-color .15s",

  "&[data-disabled]": {
    opacity: 0.5,
    cursor: "not-allowed",
  },

  "&:focus-visible, &[data-expanded]": {
    borderColor: "var(--md-sys-color-outline)",
    boxShadow:
      "0 0 0 3px color-mix(in oklab, var(--md-sys-color-outline) 30%, transparent)",
  },

  "&[data-invalid]": {
    borderColor: "var(--md-sys-color-error)",
    boxShadow:
      "0 0 0 3px color-mix(in oklab, var(--md-sys-color-error) 20%, transparent)",
  },

  "&[data-size='sm']": {
    height: "32px",
  },
});

const placeholderStyle = css({
  color: "var(--md-sys-color-on-surface-variant)",
});

const valueStyle = css({
  overflow: "hidden",
  textOverflow: "ellipsis",
});

const icon = css({
  flexShrink: 0,
  color: "var(--md-sys-color-on-surface-variant)",
  width: "16px",
  height: "16px",
});

const content = css({
  zIndex: 200,
  minWidth: "var(--kb-select-trigger-width, 9rem)",
  maxHeight: "var(--kb-popper-content-available-height, 18rem)",
  overflow: "auto",
  borderRadius: "var(--borderRadius-xl)",
  background: "var(--md-sys-color-surface-container)",
  boxShadow:
    "0 10px 25px -5px rgba(0,0,0,0.35), 0 6px 10px -6px rgba(0,0,0,0.3), inset 0 0 0 1px color-mix(in oklab, var(--md-sys-color-on-surface) 8%, transparent)",
  padding: "6px",
  outline: "none",
  color: "var(--md-sys-color-on-surface)",
});

const itemStyle = css({
  position: "relative",
  display: "flex",
  alignItems: "center",
  gap: "10px",
  width: "100%",
  paddingBlock: "8px",
  paddingInline: "12px",
  paddingRight: "32px",
  borderRadius: "var(--borderRadius-li)",
  fontSize: "0.875rem",
  fontWeight: 500,
  cursor: "default",
  userSelect: "none",
  outline: "none",

  "&[data-highlighted]": {
    background:
      "color-mix(in oklab, var(--md-sys-color-on-surface) 10%, transparent)",
  },

  "&[data-disabled]": {
    opacity: 0.5,
    pointerEvents: "none",
  },
});

const indicator = css({
  position: "absolute",
  right: "8px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "16px",
  height: "16px",
});

const labelStyle = css({
  fontSize: "0.8125rem",
  fontWeight: 500,
  color: "var(--md-sys-color-on-surface)",
  marginBottom: "6px",
  display: "block",
});

/**
 * Luma-styled Select built on Kobalte.
 *
 * Pass an array of `{ value, label }` via `options`. The `label` may be any
 * JSX, but the trigger's selected value is rendered from it as well.
 */
export function Select<T extends string = string>(props: Props<T>) {
  return (
    <KSelect<SelectOption<T>>
      options={props.options}
      optionValue="value"
      optionTextValue={(o) =>
        typeof o.label === "string" ? (o.label as string) : (o.value as string)
      }
      optionDisabled="disabled"
      value={
        props.value !== undefined
          ? props.options.find((o) => o.value === props.value)
          : undefined
      }
      defaultValue={
        props.defaultValue !== undefined
          ? props.options.find((o) => o.value === props.defaultValue)
          : undefined
      }
      onChange={(option) => option && props.onChange?.(option.value)}
      placeholder={props.placeholder}
      disabled={props.disabled}
      required={props.required}
      name={props.name}
      itemComponent={(itemProps) => (
        <KSelect.Item item={itemProps.item} class={itemStyle}>
          <KSelect.ItemLabel>
            {renderLabel(itemProps.item.rawValue.label)}
          </KSelect.ItemLabel>
          <KSelect.ItemIndicator class={indicator}>
            <CheckIcon />
          </KSelect.ItemIndicator>
        </KSelect.Item>
      )}
    >
      <Show when={props.label}>
        <KSelect.Label class={labelStyle}>{props.label}</KSelect.Label>
      </Show>
      <KSelect.Trigger
        class={`${trigger} ${props.class ?? ""}`}
        data-size={props.size ?? "default"}
        title={props.title}
        aria-label={props.title}
      >
        <KSelect.Value<SelectOption<T>> class={valueStyle}>
          {(state) =>
            state.selectedOption() ? (
              renderLabel(state.selectedOption().label)
            ) : (
              <span class={placeholderStyle}>{props.placeholder}</span>
            )
          }
        </KSelect.Value>
        <KSelect.Icon class={icon}>
          <ChevronIcon />
        </KSelect.Icon>
      </KSelect.Trigger>
      <KSelect.Portal>
        <KSelect.Content class={content}>
          <KSelect.Listbox class={css({ outline: "none" })} />
        </KSelect.Content>
      </KSelect.Portal>
    </KSelect>
  );
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" width="16" height="16">
      <path
        d="M4 6l4 4 4-4"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" width="16" height="16">
      <path
        d="M3 8.5l3.5 3.5L13 5"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
}
