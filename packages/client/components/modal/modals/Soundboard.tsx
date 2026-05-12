import { For, Show, createMemo } from "solid-js";

import { Trans, useLingui } from "@lingui-solid/solid/macro";
import { Sound } from "stoat.js";
import { styled } from "styled-system/jsx";

import { useVoice } from "@revolt/rtc";
import { useState } from "@revolt/state";
import { Dialog, DialogProps, Text } from "@revolt/ui";
import { Symbol } from "@revolt/ui/components/utils/Symbol";

import { Modals } from "../types";

export function SoundboardModal(
  props: DialogProps & Modals & { type: "soundboard" },
) {
  const { t } = useLingui();
  const voice = useVoice();
  const state = useState();

  const sounds = createMemo(() =>
    props.server.sounds.toSorted((a, b) => a.name.localeCompare(b.name)),
  );

  function play(sound: Sound) {
    const url = sound.url;
    if (!url) return;
    voice.playSound(url, state.voice.outputVolume);
    props.onClose();
  }

  return (
    <Dialog
      show={props.show}
      onClose={props.onClose}
      title={t`Soundboard`}
      actions={[{ text: <Trans>Close</Trans> }]}
    >
      <Show
        when={sounds().length}
        fallback={
          <EmptyState>
            <Symbol>music_note</Symbol>
            <Text class="label">
              <Trans>
                No sounds yet. Server admins can upload sounds in server
                settings.
              </Trans>
            </Text>
          </EmptyState>
        }
      >
        <Grid>
          <For each={sounds()}>
            {(sound) => (
              <SoundButton
                onClick={() => play(sound)}
                title={sound.name}
                disabled={!voice.speakingPermission}
              >
                <SoundIcon>
                  <Symbol>graphic_eq</Symbol>
                </SoundIcon>
                <SoundName>{sound.name}</SoundName>
              </SoundButton>
            )}
          </For>
        </Grid>
      </Show>
    </Dialog>
  );
}

const Grid = styled("div", {
  base: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))",
    gap: "var(--gap-md)",
    maxHeight: "60vh",
    overflowY: "auto",
    padding: "var(--gap-sm) 0",
  },
});

const SoundButton = styled("button", {
  base: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "var(--gap-xs)",
    padding: "var(--gap-md)",
    background: "var(--md-sys-color-surface-container-high)",
    color: "var(--md-sys-color-on-surface)",
    border: "none",
    borderRadius: "var(--borderRadius-md)",
    cursor: "pointer",
    fontSize: "0.85em",
    transition: "background 0.12s ease",

    _hover: {
      background: "var(--md-sys-color-secondary-container)",
    },

    _disabled: {
      cursor: "not-allowed",
      opacity: 0.4,
    },
  },
});

const SoundIcon = styled("div", {
  base: {
    fontSize: "1.6em",
    lineHeight: 1,
  },
});

const SoundName = styled("span", {
  base: {
    width: "100%",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    textAlign: "center",
  },
});

const EmptyState = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "var(--gap-sm)",
    padding: "var(--gap-lg)",
    textAlign: "center",
  },
});
