import { JSX, splitProps } from "solid-js";

import { cva, cx } from "styled-system/css";

/**
 * shadcn "Item" primitive ported to SolidJS + Panda.
 * Building block for setting rows and lists.
 */

const itemGroup = cva({
  base: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
  },
});

const itemSeparator = cva({
  base: {
    height: "1px",
    background: "var(--md-sys-color-outline-variant)",
    margin: "0",
  },
});

const item = cva({
  base: {
    display: "flex",
    alignItems: "center",
    gap: "var(--gap-md)",
    padding: "var(--gap-md) var(--gap-lg)",
    borderRadius: "var(--borderRadius-lg)",
    background: "transparent",
    color: "var(--md-sys-color-on-surface)",
    textAlign: "left",
    width: "100%",
    border: "0",
    cursor: "default",
    transition: "background 120ms ease",
    "&[data-interactive=true]": {
      cursor: "pointer",
      _hover: {
        background: "var(--md-sys-color-surface-container-high)",
      },
    },
    "&[data-disabled=true]": {
      opacity: 0.5,
      pointerEvents: "none",
    },
  },
  variants: {
    variant: {
      default: {},
      outline: {
        border: "1px solid var(--md-sys-color-outline-variant)",
      },
      muted: {
        background: "var(--md-sys-color-surface-container)",
      },
    },
    size: {
      default: {
        padding: "var(--gap-md) var(--gap-lg)",
      },
      sm: {
        padding: "var(--gap-sm) var(--gap-md)",
      },
      xs: {
        padding: "var(--gap-xs) var(--gap-sm)",
        gap: "var(--gap-sm)",
      },
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

const itemMedia = cva({
  base: {
    display: "flex",
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    color: "var(--md-sys-color-on-surface-variant)",
    "& svg": {
      fill: "currentColor",
    },
  },
  variants: {
    variant: {
      default: {
        width: "32px",
        height: "32px",
      },
      icon: {
        width: "36px",
        height: "36px",
        borderRadius: "var(--borderRadius-md)",
        background: "var(--md-sys-color-surface-container-high)",
      },
      image: {
        width: "40px",
        height: "40px",
        borderRadius: "var(--borderRadius-md)",
        overflow: "hidden",
      },
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const itemContent = cva({
  base: {
    display: "flex",
    flex: "1 1 auto",
    flexDirection: "column",
    gap: "2px",
    minWidth: 0,
  },
});

const itemTitle = cva({
  base: {
    fontSize: "14px",
    fontWeight: 500,
    color: "var(--md-sys-color-on-surface)",
    lineHeight: 1.4,
  },
});

const itemDescription = cva({
  base: {
    fontSize: "13px",
    color: "var(--md-sys-color-on-surface-variant)",
    lineHeight: 1.4,
  },
});

const itemActions = cva({
  base: {
    display: "flex",
    flexShrink: 0,
    alignItems: "center",
    gap: "var(--gap-sm)",
    marginLeft: "auto",
    color: "var(--md-sys-color-on-surface-variant)",
    "& > svg": {
      fill: "currentColor",
    },
  },
});

const itemHeader = cva({
  base: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    paddingInline: "var(--gap-lg)",
    paddingBlock: "var(--gap-sm)",
    fontSize: "12px",
    fontWeight: 500,
    color: "var(--md-sys-color-on-surface-variant)",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
});

const itemFooter = cva({
  base: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    paddingInline: "var(--gap-lg)",
    paddingBlock: "var(--gap-sm)",
    fontSize: "12px",
    color: "var(--md-sys-color-on-surface-variant)",
  },
});

type DivProps = JSX.HTMLAttributes<HTMLDivElement>;

export function ItemGroup(props: DivProps) {
  const [local, rest] = splitProps(props, ["class"]);
  return <div role="list" class={cx(itemGroup(), local.class)} {...rest} />;
}

export function ItemSeparator(props: DivProps) {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      class={cx(itemSeparator(), local.class)}
      {...rest}
    />
  );
}

export function Item(
  props: DivProps & {
    variant?: "default" | "outline" | "muted";
    size?: "default" | "sm" | "xs";
    interactive?: boolean;
    disabled?: boolean;
    onPress?: () => void;
  },
) {
  const [local, rest] = splitProps(props, [
    "class",
    "variant",
    "size",
    "interactive",
    "disabled",
    "onPress",
    "onClick",
  ]);

  const interactive = () => local.interactive ?? !!local.onPress;

  return (
    <div
      role={interactive() ? "button" : "listitem"}
      tabIndex={interactive() && !local.disabled ? 0 : undefined}
      data-interactive={interactive()}
      data-disabled={local.disabled}
      class={cx(item({ variant: local.variant, size: local.size }), local.class)}
      onClick={(e) => {
        if (local.disabled) return;
        local.onPress?.();
        if (typeof local.onClick === "function") local.onClick(e);
      }}
      onKeyDown={(e) => {
        if (!interactive() || local.disabled) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          local.onPress?.();
        }
      }}
      {...rest}
    />
  );
}

export function ItemMedia(
  props: DivProps & { variant?: "default" | "icon" | "image" },
) {
  const [local, rest] = splitProps(props, ["class", "variant"]);
  return (
    <div
      class={cx(itemMedia({ variant: local.variant }), local.class)}
      {...rest}
    />
  );
}

export function ItemContent(props: DivProps) {
  const [local, rest] = splitProps(props, ["class"]);
  return <div class={cx(itemContent(), local.class)} {...rest} />;
}

export function ItemTitle(props: DivProps) {
  const [local, rest] = splitProps(props, ["class"]);
  return <div class={cx(itemTitle(), local.class)} {...rest} />;
}

export function ItemDescription(props: DivProps) {
  const [local, rest] = splitProps(props, ["class"]);
  return <div class={cx(itemDescription(), local.class)} {...rest} />;
}

export function ItemActions(props: DivProps) {
  const [local, rest] = splitProps(props, ["class"]);
  return <div class={cx(itemActions(), local.class)} {...rest} />;
}

export function ItemHeader(props: DivProps) {
  const [local, rest] = splitProps(props, ["class"]);
  return <div class={cx(itemHeader(), local.class)} {...rest} />;
}

export function ItemFooter(props: DivProps) {
  const [local, rest] = splitProps(props, ["class"]);
  return <div class={cx(itemFooter(), local.class)} {...rest} />;
}
