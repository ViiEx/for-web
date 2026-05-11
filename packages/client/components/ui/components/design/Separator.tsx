import { JSX, splitProps } from "solid-js";

import { styled } from "styled-system/jsx";

type Orientation = "horizontal" | "vertical";

type Props = Omit<JSX.HTMLAttributes<HTMLDivElement>, "role"> & {
  orientation?: Orientation;
  /**
   * If true (default), the separator is purely decorative and is hidden from
   * assistive tech. Pass `false` for a semantic divider.
   */
  decorative?: boolean;
};

const Root = styled("div", {
  base: {
    flexShrink: 0,
    background: "var(--md-sys-color-outline-variant)",
  },
  variants: {
    orientation: {
      horizontal: {
        height: "1px",
        width: "100%",
      },
      vertical: {
        width: "1px",
        alignSelf: "stretch",
      },
    },
  },
});

export function Separator(props: Props) {
  const [local, rest] = splitProps(props, ["orientation", "decorative"]);
  const orientation = local.orientation ?? "horizontal";
  const decorative = local.decorative ?? true;

  return (
    <Root
      {...rest}
      orientation={orientation}
      data-orientation={orientation}
      role={decorative ? "none" : "separator"}
      aria-orientation={decorative ? undefined : orientation}
    />
  );
}
