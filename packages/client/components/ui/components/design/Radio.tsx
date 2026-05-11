import { JSX, createContext, useContext } from "solid-js";

import { styled } from "styled-system/jsx";

interface GroupProps {
  value?: string;
  onChange?: (event: { currentTarget: { value: string } }) => void;
  required?: boolean;
  disabled?: boolean;
  children?: JSX.Element;
  name?: string;
}

interface OptionProps {
  value?: string;
  children?: JSX.Element;
  checked?: boolean;
  disabled?: boolean;
}

type GroupCtx = {
  value?: string;
  name: string;
  disabled?: boolean;
  onChange?: GroupProps["onChange"];
};

const RadioGroupContext = createContext<GroupCtx>();

let nameCounter = 0;
const nextName = () => `radio-${++nameCounter}`;

const GroupRoot = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
});

const OptionRoot = styled("label", {
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

const Dot = styled("span", {
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    width: "16px",
    height: "16px",
    borderRadius: "50%",
    border: "1px solid var(--md-sys-color-outline)",
    background:
      "color-mix(in oklab, var(--md-sys-color-surface-container-high) 75%, transparent)",
    transition:
      "background-color .15s, border-color .15s, box-shadow .15s",
    position: "relative",

    "input:focus-visible + &": {
      borderColor: "var(--md-sys-color-outline)",
      boxShadow:
        "0 0 0 3px color-mix(in oklab, var(--md-sys-color-outline) 30%, transparent)",
    },

    "input:checked + &": {
      borderColor: "var(--md-sys-color-primary)",
    },

    "input:checked + &::after": {
      content: "''",
      position: "absolute",
      inset: "3px",
      borderRadius: "50%",
      background: "var(--md-sys-color-primary)",
    },
  },
});

/**
 * Luma-styled radio group.
 */
export function Radio2(props: GroupProps) {
  const name = props.name ?? nextName();

  return (
    <RadioGroupContext.Provider
      value={{
        get value() {
          return props.value;
        },
        get disabled() {
          return props.disabled;
        },
        get onChange() {
          return props.onChange;
        },
        name,
      }}
    >
      <GroupRoot role="radiogroup">{props.children}</GroupRoot>
    </RadioGroupContext.Provider>
  );
}

Radio2.Option = function Option(props: OptionProps) {
  const ctx = useContext(RadioGroupContext);
  const checked = () =>
    ctx ? ctx.value === props.value : !!props.checked;
  const disabled = () => props.disabled || ctx?.disabled;

  return (
    <OptionRoot data-disabled={!!disabled()}>
      <NativeInput
        type="radio"
        name={ctx?.name}
        value={props.value}
        checked={checked()}
        disabled={disabled()}
        onChange={(event) => {
          if (event.currentTarget.checked && props.value !== undefined) {
            ctx?.onChange?.({
              currentTarget: { value: props.value },
            });
          }
        }}
      />
      <Dot />
      <span>{props.children}</span>
    </OptionRoot>
  );
};
