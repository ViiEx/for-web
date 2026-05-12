import {
  ComponentProps,
  For,
  JSX,
  Show,
  createMemo,
  createSignal,
  splitProps,
} from "solid-js";

import { css } from "styled-system/css";

import MdChevronRight from "@material-design-icons/svg/outlined/chevron_right.svg?component-solid";
import MdContentCopy from "@material-design-icons/svg/outlined/content_copy.svg?component-solid";
import MdKeyboardDown from "@material-design-icons/svg/outlined/keyboard_arrow_down.svg?component-solid";
import MdOpenInNew from "@material-design-icons/svg/outlined/open_in_new.svg?component-solid";

import { iconSize } from "../utils";

import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "./Item";

/**
 * CategoryButton — thin wrapper around the new `Item` primitive,
 * preserving the legacy API so existing call-sites work unchanged.
 */

type Action = "chevron" | "collapse" | "external" | "edit" | "copy" | JSX.Element;

export interface Props {
  readonly icon?: JSX.Element | "blank";
  readonly children?: JSX.Element;
  readonly description?: JSX.Element;

  readonly disabled?: boolean;
  readonly onClick?: () => void;
  readonly action?: Action | Action[];

  readonly roundedIcon?: boolean;
  readonly variant?: "filled" | "tonal" | "tertiary" | "tertiaryAlt";
}

function renderAction(action: Action): JSX.Element {
  if (action === "chevron") return <MdChevronRight {...iconSize(18)} />;
  if (action === "collapse") return <MdKeyboardDown {...iconSize(18)} />;
  if (action === "external") return <MdOpenInNew {...iconSize(18)} />;
  if (action === "copy") return <MdContentCopy {...iconSize(18)} />;
  return action as JSX.Element;
}

export function CategoryButton(props: Props) {
  const actions = () =>
    (Array.isArray(props.action) ? props.action : [props.action]).filter(
      (a) => a !== undefined && a !== null,
    ) as Action[];

  return (
    <Item
      interactive={!!props.onClick && !props.disabled}
      disabled={props.disabled}
      onPress={props.onClick}
    >
      <Show when={props.icon && props.icon !== "blank"}>
        <ItemMedia variant="icon">{props.icon}</ItemMedia>
      </Show>
      <Show when={props.icon === "blank"}>
        <ItemMedia variant="icon" class={css({ background: "transparent" })} />
      </Show>
      <ItemContent>
        <Show when={props.children}>
          <ItemTitle>{props.children}</ItemTitle>
        </Show>
        <Show when={props.description}>
          <ItemDescription>{props.description}</ItemDescription>
        </Show>
      </ItemContent>
      <Show when={actions().length > 0}>
        <ItemActions>
          <For each={actions()}>{(a) => renderAction(a)}</For>
        </ItemActions>
      </Show>
    </Item>
  );
}

CategoryButton.Group = ItemGroup;

type CollapseProps = Omit<Props, "onClick" | "children"> & {
  children?: JSX.Element;
  title?: JSX.Element;
  scrollable?: boolean;
};

const chevronStyle = css({
  transition: "transform 150ms ease",
  "&[data-open=true]": {
    transform: "rotate(180deg)",
  },
});

const nestedStyle = css({
  paddingLeft: "calc(var(--gap-lg) + 36px + var(--gap-md))",
  display: "flex",
  flexDirection: "column",
  gap: "var(--gap-xs)",
});

CategoryButton.Collapse = (props: CollapseProps) => {
  const [open, setOpen] = createSignal(false);
  const [, rest] = splitProps(props, ["children", "title", "action", "scrollable"]);

  return (
    <>
      <Item interactive onPress={() => setOpen(!open())}>
        <Show when={rest.icon && rest.icon !== "blank"}>
          <ItemMedia variant="icon">{rest.icon}</ItemMedia>
        </Show>
        <Show when={rest.icon === "blank"}>
          <ItemMedia variant="icon" class={css({ background: "transparent" })} />
        </Show>
        <ItemContent>
          <Show when={props.title}>
            <ItemTitle>{props.title}</ItemTitle>
          </Show>
          <Show when={rest.description}>
            <ItemDescription>{rest.description}</ItemDescription>
          </Show>
        </ItemContent>
        <ItemActions>
          <MdKeyboardDown
            {...iconSize(20)}
            class={chevronStyle}
            data-open={open()}
          />
        </ItemActions>
      </Item>
      <Show when={open()}>
        <div class={nestedStyle}>{props.children}</div>
      </Show>
    </>
  );
};

export type CategorySelectOption = Omit<
  ComponentProps<typeof CategoryButton>,
  "onClick" | "children"
> &
  (
    | { title: JSX.Element; shortDesc?: JSX.Element }
    | { title?: JSX.Element; shortDesc: JSX.Element }
  );

type SelectProps<T extends string> = Omit<
  ComponentProps<typeof CategoryButton>,
  "onClick" | "children" | "description"
> & {
  title?: JSX.Element;
  options: { [k in T]: CategorySelectOption };
  value?: T;
  onUpdate: (v: T) => void;
};

CategoryButton.Select = <T extends string>(props: SelectProps<T>) => {
  const [open, setOpen] = createSignal(false);
  const opts = createMemo(() => Object.keys(props.options) as T[]);

  const currentLabel = createMemo(() => {
    const opt = props.options[(props.value ?? opts()[0]) as T];
    if (!opt) return undefined;
    return opt.shortDesc ?? opt.description ?? opt.title;
  });

  return (
    <>
      <Item interactive onPress={() => setOpen(!open())}>
        <Show when={props.icon && props.icon !== "blank"}>
          <ItemMedia variant="icon">{props.icon}</ItemMedia>
        </Show>
        <Show when={props.icon === "blank"}>
          <ItemMedia variant="icon" class={css({ background: "transparent" })} />
        </Show>
        <ItemContent>
          <Show when={props.title}>
            <ItemTitle>{props.title}</ItemTitle>
          </Show>
          <Show when={currentLabel()}>
            <ItemDescription>{currentLabel()}</ItemDescription>
          </Show>
        </ItemContent>
        <ItemActions>
          <MdKeyboardDown
            {...iconSize(20)}
            class={chevronStyle}
            data-open={open()}
          />
        </ItemActions>
      </Item>
      <Show when={open()}>
        <div class={nestedStyle}>
          <For each={opts()}>
            {(val) => {
              const opt = props.options[val];
              const isActive = () => (props.value ?? opts()[0]) === val;
              return (
                <Item
                  interactive
                  onPress={() => {
                    props.onUpdate(val);
                    setOpen(false);
                  }}
                >
                  <ItemContent>
                    <ItemTitle>{opt.title ?? opt.shortDesc}</ItemTitle>
                    <Show when={opt.description}>
                      <ItemDescription>{opt.description}</ItemDescription>
                    </Show>
                  </ItemContent>
                  <Show when={isActive()}>
                    <ItemActions>
                      <CheckMark />
                    </ItemActions>
                  </Show>
                </Item>
              );
            }}
          </For>
        </div>
      </Show>
    </>
  );
};

function CheckMark() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="none">
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
