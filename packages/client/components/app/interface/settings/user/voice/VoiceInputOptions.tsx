import { createMemo } from "solid-js";
import { useMediaDeviceSelect } from "solid-livekit-components";

import { Trans } from "@lingui-solid/solid/macro";

import { useState } from "@revolt/state";
import {
  Column,
  Item,
  ItemActions,
  ItemContent,
  ItemGroup,
  ItemMedia,
  ItemTitle,
  Select,
  Slider,
  Text,
} from "@revolt/ui";
import { Symbol } from "@revolt/ui/components/utils/Symbol";

/**
 * Input options
 */
export function VoiceInputOptions() {
  return (
    <Column>
      <ItemGroup>
        <SelectInput kind="audioinput" />
        <SelectInput kind="audiooutput" />
        {/* <SelectInput kind="videoinput" /> TODO O.o */}
      </ItemGroup>
      <VolumeSliders />
    </Column>
  );
}

/**
 * Select input device w/ type
 */
function SelectInput(props: { kind: MediaDeviceKind }) {
  const state = useState();
  const media = createMemo(() => useMediaDeviceSelect({ kind: props.kind }));

  const setKey = () =>
    props.kind === "audioinput"
      ? "preferredAudioInputDevice"
      : "preferredAudioOutputDevice";

  const activeId = createMemo(() => {
    const active = media().activeDeviceId();
    return (active === "default" ? state.voice[setKey()] : undefined) ?? active;
  });

  const options = createMemo(() => {
    const devs = media().devices();
    const opts: { value: string; label: string }[] = [];
    const def = devs.find((d) => d.deviceId === "default");
    if (def) opts.push({ value: "default", label: def.label });
    for (const d of devs)
      if (d.deviceId !== "default")
        opts.push({ value: d.deviceId, label: d.label });
    return opts;
  });

  return (
    <Item>
      <ItemMedia>
        <Symbol>{props.kind === "audioinput" ? "mic" : "speaker"}</Symbol>
      </ItemMedia>
      <ItemContent>
        <ItemTitle>
          {props.kind === "audioinput" ? (
            <Trans>Audio Input</Trans>
          ) : (
            <Trans>Audio Output</Trans>
          )}
        </ItemTitle>
      </ItemContent>
      <ItemActions>
        <Select
          value={activeId()}
          options={options()}
          onChange={(id) => {
            const mMedia = media();
            const dev = mMedia.devices().find((d) => d.deviceId === id);
            if (dev) {
              state.voice[setKey()] = dev.deviceId;
              mMedia.setActiveMediaDevice(dev.deviceId);
            }
          }}
        />
      </ItemActions>
    </Item>
  );
}

/**
 * Select volume
 */
function VolumeSliders() {
  const state = useState();

  return (
    <Column>
      <Text class="label">
        <Trans>Output Volume</Trans>
      </Text>
      <Slider
        min={0}
        max={3}
        step={0.1}
        value={state.voice.outputVolume}
        onInput={(event) =>
          (state.voice.outputVolume = event.currentTarget.value)
        }
        labelFormatter={(label) => (label * 100).toFixed(0) + "%"}
      />
    </Column>
  );
}
