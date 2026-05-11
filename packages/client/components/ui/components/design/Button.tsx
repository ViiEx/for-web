import { Show, splitProps } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";

import { AriaButtonProps, createButton } from "@solid-aria/button";
import { cva } from "styled-system/css/cva";

import { Ripple } from "./Ripple";
import { typography } from "./Text";

type Props = Omit<
  Parameters<typeof button>[0] &
    AriaButtonProps &
    JSX.DirectiveAttributes &
    Pick<
      JSX.ButtonHTMLAttributes<HTMLButtonElement>,
      "role" | "tabIndex" | "aria-selected"
    >,
  "onClick" | "_permitAnimation" | "disabled"
> & {
  groupActive?: boolean;
  bg?: string;
};

/**
 * Luma-styled button. Variant/size/group props match the previous MD3 API
 * so call-sites don't need to change.
 *
 * Connected groups: use `group="connected-start" | "connected" | "connected-end"`
 * on adjacent buttons inside a `<Row>`. The active one is filled, inactive ones
 * render outlined and share borders to form one connected pill.
 */
export function Button(props: Props) {
  const [passthrough, propsRest] = splitProps(props, [
    "aria-selected",
    "tabIndex",
    "role",
  ]);

  const [style, rest] = splitProps(propsRest, [
    "bg",
    "size",
    "shape",
    "variant",
    "group",
    "groupActive",
  ]);
  let ref: HTMLButtonElement | undefined;

  // Resolve effective variant from group/groupActive when the button is part
  // of a connected/standard group; otherwise honour the explicit variant.
  const variant = () => {
    if (style.group) {
      return style.groupActive ? "filled" : "outlined";
    }
    return style.variant;
  };

  const { buttonProps } = createButton(rest, () => ref);
  return (
    <button
      {...passthrough}
      {...buttonProps}
      ref={ref}
      class={button({
        shape: style.shape,
        variant: variant(),
        size: style.size,
        group: style.group,
        disabled: buttonProps.disabled,
      })}
      style={{
        "background-color": style.bg,
      }}
      // @codegen directives props=rest include=floating
    >
      <Show when={!buttonProps.disabled}>
        <Ripple />
      </Show>
      {rest.children}
    </button>
  );
}

const button = cva({
  base: {
    ...typography.raw(),

    // for <Ripple />:
    position: "relative",

    paddingInline: "var(--padding-inline)",

    flexShrink: 0,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",

    fontWeight: 500,
    fontFamily: "inherit",
    whiteSpace: "nowrap",
    userSelect: "none",

    cursor: "pointer",
    border: "1px solid transparent",
    borderRadius: "var(--borderRadius-xxl)",
    outline: "none",
    transition:
      "background-color .15s ease, color .15s ease, border-color .15s ease, box-shadow .15s ease, transform .05s ease",

    color: "var(--color)",
    fill: "var(--color)",

    "&:focus-visible": {
      borderColor: "var(--md-sys-color-outline)",
      boxShadow:
        "0 0 0 3px color-mix(in oklab, var(--md-sys-color-outline) 30%, transparent)",
    },

    "&:active:not([aria-haspopup])": {
      transform: "translateY(1px)",
    },
  },
  variants: {
    variant: {
      elevated: {
        background: "var(--md-sys-color-surface-container-low)",
        "--color": "var(--md-sys-color-on-surface)",
        boxShadow: "0 0.5px 1.5px #0004",
        "&:hover:not(:disabled)": {
          background: "var(--md-sys-color-surface-container-high)",
        },
      },
      filled: {
        background: "var(--md-sys-color-primary)",
        "--color": "var(--md-sys-color-on-primary)",
        "&:hover:not(:disabled)": {
          background:
            "color-mix(in oklab, var(--md-sys-color-primary) 80%, transparent)",
        },
      },
      tonal: {
        background: "var(--md-sys-color-secondary-container)",
        "--color": "var(--md-sys-color-on-secondary-container)",
        "&:hover:not(:disabled)": {
          background:
            "color-mix(in oklab, var(--md-sys-color-secondary-container) 80%, transparent)",
        },
      },
      outlined: {
        background: "transparent",
        borderColor: "var(--md-sys-color-outline-variant)",
        "--color": "var(--md-sys-color-on-surface)",
        "&:hover:not(:disabled)": {
          background:
            "color-mix(in oklab, var(--md-sys-color-on-surface) 6%, transparent)",
        },
      },
      text: {
        background: "transparent",
        "--color": "var(--md-sys-color-on-surface)",
        "&:hover:not(:disabled)": {
          background:
            "color-mix(in oklab, var(--md-sys-color-on-surface) 8%, transparent)",
        },
      },
      _error: {
        background:
          "color-mix(in oklab, var(--md-sys-color-error) 15%, transparent)",
        "--color": "var(--md-sys-color-error)",
        "&:hover:not(:disabled)": {
          background:
            "color-mix(in oklab, var(--md-sys-color-error) 22%, transparent)",
        },
        "&:focus-visible": {
          borderColor:
            "color-mix(in oklab, var(--md-sys-color-error) 40%, transparent)",
          boxShadow:
            "0 0 0 3px color-mix(in oklab, var(--md-sys-color-error) 20%, transparent)",
        },
      },

      // Deprecated aliases kept for back-compat with old call-sites.
      success: {
        background: "var(--md-sys-color-secondary-container)",
        "--color": "var(--md-sys-color-on-secondary-container)",
      },
      warning: {
        background:
          "color-mix(in oklab, var(--md-sys-color-error) 15%, transparent)",
        "--color": "var(--md-sys-color-error)",
      },
      error: {
        background: "var(--md-sys-color-error)",
        "--color": "var(--md-sys-color-on-error)",
      },
      primary: {
        background: "var(--md-sys-color-primary)",
        "--color": "var(--md-sys-color-on-primary)",
      },
      secondary: {
        background: "var(--md-sys-color-secondary-container)",
        "--color": "var(--md-sys-color-on-secondary-container)",
      },
      plain: {
        background: "transparent",
        "--color": "var(--md-sys-color-on-surface)",
        "&:hover:not(:disabled)": {
          background:
            "color-mix(in oklab, var(--md-sys-color-on-surface) 8%, transparent)",
        },
      },
    },
    shape: {
      round: {
        borderRadius: "var(--borderRadius-full)",
      },
      square: {
        borderRadius: "var(--borderRadius-md)",
      },
    },
    group: {
      "connected-start": {
        borderTopRightRadius: "0",
        borderBottomRightRadius: "0",
      },
      "connected-end": {
        borderTopLeftRadius: "0",
        borderBottomLeftRadius: "0",
        borderLeft: "0",
        // Cancel the parent flex `gap` so buttons sit flush, then overlap 1px
        // so the shared border doesn't double up.
        marginInlineStart: "calc(-1 * var(--gap-md) - 1px)",
      },
      connected: {
        borderRadius: "0",
        borderLeft: "0",
        marginInlineStart: "calc(-1 * var(--gap-md) - 1px)",
      },
      standard: {},
    },
    size: {
      xs: {
        height: "24px",
        "--padding-inline": "10px",
        fontSize: "0.75rem",
      },
      sm: {
        height: "36px",
        "--padding-inline": "12px",
        fontSize: "0.875rem",
      },
      md: {
        height: "40px",
        "--padding-inline": "16px",
      },
      lg: {
        height: "48px",
        "--padding-inline": "20px",
      },
      xl: {
        height: "56px",
        "--padding-inline": "24px",
      },
      icon: {
        width: "36px",
        height: "36px",
        "--padding-inline": "0",
      },
      /**
       * @deprecated
       */
      small: {
        height: "32px",
        "--padding-inline": "12px",
        fontSize: "0.8125rem",
      },
      /**
       * @deprecated
       */
      normal: {
        height: "36px",
        "--padding-inline": "16px",
        fontSize: "0.8125rem",
      },
      /**
       * @deprecated
       */
      fab: {
        width: "42px",
        height: "42px",
        borderRadius: "var(--borderRadius-lg)",
        "--padding-inline": "0",
      },
      /**
       * @deprecated
       */
      fluid: {
        borderRadius: "var(--borderRadius-md)",
      },
      /**
       * @deprecated
       */
      inline: {
        height: "auto",
        padding: "var(--gap-xs) var(--gap-md)",
        fontSize: "0.8125rem",
        borderRadius: "var(--borderRadius-md)",
        "--padding-inline": "0",
      },
      /**
       * @deprecated
       */
      none: {
        borderRadius: "0",
      },
    },
    disabled: {
      true: {
        cursor: "not-allowed",
        opacity: 0.5,
        pointerEvents: "none",
      },
      false: {},
    },
  },
  defaultVariants: {
    size: "sm",
    variant: "filled",
    disabled: false,
  },
});
