import { For, Match, Switch, createSignal } from "solid-js";

import { Trans } from "@lingui-solid/solid/macro";
import { styled } from "styled-system/jsx";

import { CategoryButton, Column, Dialog, DialogProps } from "@revolt/ui";
import type { DialogAction } from "@revolt/ui/components/design/Dialog";

import { Markdown } from "@revolt/markdown";
import { Symbol } from "@revolt/ui/components/utils/Symbol";
import { Modals } from "../types";

/**
 * Changelog element
 */
type Element =
  | string
  | {
      type: "image";
      src: string;
    };

/**
 * Changelog post
 */
export interface ChangelogPost {
  icon: string;
  date: Date;
  link: string;
  title: string;
  content: Element[];
}

const ChangelogPosts: ChangelogPost[] = [];

export const CHANGELOG_MODAL_CONST = {
  index: 0,
  until: new Date("2026-01-01T00:00:00.000Z"),
};

/**
 * Modal to display changelog
 */
export function ChangelogModal(
  props: DialogProps & Modals & { type: "changelog" },
) {
  const [log, setLog] = createSignal(props.initial);

  /**
   * Get the currently selected log
   * @returns Log
   */
  const currentLog = () =>
    typeof log() !== "undefined" ? ChangelogPosts[log()!] : undefined;

  const actions = () => {
    const actionList: DialogAction[] = [
      {
        text: <Trans>Read More</Trans>,
        onClick() {
          window.open(currentLog()?.link, "_blank");
        },
      },
      { text: <Trans>Close</Trans> },
    ];

    // if (currentLog()) {
    //   actionList.push({
    //     text: <Trans>View older updates</Trans>,
    //     onClick: () => {
    //       setLog(undefined);
    //       return false;
    //     },
    //   });
    // }

    return actionList;
  };

  return (
    <Dialog
      show={props.show}
      onClose={props.onClose}
      title={
        <Switch fallback={<Trans>Changelog</Trans>}>
          <Match when={currentLog()}>{currentLog()!.title}</Match>
        </Switch>
      }
      actions={actions()}
    >
      <Switch
        fallback={
          <Column>
            <For each={ChangelogPosts}>
              {(entry, index) => {
                /**
                 * Handle changing post
                 */
                const onClick = () => setLog(index());

                return (
                  <CategoryButton
                    icon={<Symbol>{entry.icon}</Symbol>}
                    onClick={onClick}
                  >
                    {entry.title}
                  </CategoryButton>
                );
              }}
            </For>
          </Column>
        }
      >
        <Match when={currentLog()}>
          <RenderLog post={currentLog()!} />
        </Match>
      </Switch>
    </Dialog>
  );
}

/**
 * Render a single changelog post
 */
function RenderLog(props: { post: ChangelogPost }) {
  return (
    <Column>
      <For each={props.post.content}>
        {(entry) => (
          <Switch>
            <Match when={typeof entry === "string"}>
              <Markdown content={entry as string} />
            </Match>
            <Match when={typeof entry === "object" && entry.type === "image"}>
              <Image src={(entry as { src: string }).src} loading="lazy" />
            </Match>
          </Switch>
        )}
      </For>
    </Column>
  );
}

/**
 * Image wrapper
 */
const Image = styled("img", {
  base: {
    borderRadius: "var(--borderRadius-md)",
  },
});
