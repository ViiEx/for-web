import { BiSolidTrash } from "solid-icons/bi";
import { createFormControl, createFormGroup } from "solid-forms";
import { For, Match, Show, Switch, createSignal } from "solid-js";

import { Trans, useLingui } from "@lingui-solid/solid/macro";
import { Server, Sound } from "stoat.js";
import { css } from "styled-system/css";

import { useClient } from "@revolt/client";
import { CONFIGURATION } from "@revolt/common";
import { useError } from "@revolt/i18n";
import {
  CategoryButton,
  CircularProgress,
  Column,
  Form2,
  IconButton,
  Row,
  Text,
} from "@revolt/ui";
import { Symbol } from "@revolt/ui/components/utils/Symbol";

const SUPPORTED_TYPES = "audio/mpeg,audio/ogg,audio/wav,audio/webm";

/**
 * Sound list — server-settings page for managing the per-server soundboard.
 */
export function SoundList(props: { server: Server }) {
  const err = useError();
  const { t } = useLingui();
  const client = useClient();

  function isDisabled() {
    return props.server.sounds.length >= CONFIGURATION.MAX_SOUNDS;
  }

  const editGroup = createFormGroup(
    {
      name: createFormControl("", { required: true }),
      file: createFormControl<string | File[] | null>(null, {
        required: true,
      }),
    },
    {
      disabled: isDisabled(),
    },
  );

  async function onSubmit() {
    const file = (editGroup.controls.file.value as File[])[0];
    const body = new FormData();
    body.append("file", file);

    const [key, value] = client().authenticationHeader;
    const data: { id: string } = await fetch(
      `${CONFIGURATION.DEFAULT_MEDIA_URL}/sounds`,
      {
        method: "POST",
        body,
        headers: { [key]: value },
      },
    ).then((res) => res.json());

    await props.server.createSound(data.id, {
      name: editGroup.controls.name.value,
    });
  }

  function onReset() {
    editGroup.controls.name.setValue("");
    editGroup.controls.file.setValue(null);
  }

  const submit = Form2.useSubmitHandler(editGroup, onSubmit, onReset);

  return (
    <Column gap="lg">
      <form onSubmit={submit}>
        <Column>
          <Row align>
            <Column>
              <Form2.FileInput
                control={editGroup.controls.file}
                accept={SUPPORTED_TYPES}
                imageJustify={false}
                allowRemoval={false}
              />
            </Column>
            <Column grow>
              <Form2.TextField
                minlength={1}
                maxlength={32}
                counter
                name="name"
                control={editGroup.controls.name}
                label={t`Sound Name`}
              />

              <Row align>
                <Form2.Submit group={editGroup}>
                  <Trans>Upload</Trans>
                </Form2.Submit>
                <Switch
                  fallback={
                    <Trans>
                      {CONFIGURATION.MAX_SOUNDS - props.server.sounds.length}{" "}
                      sound slots remaining
                    </Trans>
                  }
                >
                  <Match when={editGroup.errors?.error}>
                    {err(editGroup.errors!.error)}
                  </Match>
                  <Match when={editGroup.isPending}>
                    <CircularProgress />
                  </Match>
                </Switch>
              </Row>
            </Column>
          </Row>
        </Column>
      </form>

      <Column gap="sm">
        <For
          each={props.server.sounds.toSorted((b, a) =>
            a.id.localeCompare(b.id),
          )}
        >
          {(sound) => <SoundRow sound={sound} />}
        </For>
      </Column>
    </Column>
  );
}

function SoundRow(props: { sound: Sound }) {
  const [previewing, setPreviewing] = createSignal(false);
  let previewAudio: HTMLAudioElement | undefined;

  function togglePreview() {
    const url = props.sound.url;
    if (!url) return;
    if (previewing()) {
      previewAudio?.pause();
      setPreviewing(false);
      return;
    }
    previewAudio = new Audio(url);
    previewAudio.onended = () => setPreviewing(false);
    previewAudio.onerror = () => setPreviewing(false);
    previewAudio.play().then(() => setPreviewing(true), () => setPreviewing(false));
  }

  function onDelete() {
    previewAudio?.pause();
    void props.sound.delete();
  }

  return (
    <CategoryButton
      roundedIcon={false}
      icon={
        <IconWrap>
          <Symbol>{previewing() ? "stop" : "play_arrow"}</Symbol>
        </IconWrap>
      }
      onClick={togglePreview}
      action={
        <IconButton size="sm" variant="standard" onPress={onDelete}>
          <BiSolidTrash size={16} />
        </IconButton>
      }
    >
      <Column gap="none">
        <span class={css({ flex: 1 })}>{props.sound.name}</span>
        <Show when={props.sound.creator}>
          <Text class="label">
            <Trans>by {props.sound.creator!.displayName}</Trans>
          </Text>
        </Show>
      </Column>
    </CategoryButton>
  );
}

function IconWrap(props: { children: any }) {
  return (
    <span
      class={css({
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "32px",
        height: "32px",
        borderRadius: "var(--borderRadius-md)",
        background: "var(--md-sys-color-surface-container-high)",
      })}
    >
      {props.children}
    </span>
  );
}
