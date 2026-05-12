import {
  Show,
  createEffect,
  createSignal,
  on,
  onCleanup,
  onMount,
} from "solid-js";

import { Trans } from "@lingui-solid/solid/macro";
import { ConnectionQuality, RoomEvent } from "livekit-client";
import { css } from "styled-system/css";

import { useUser } from "@revolt/client";
import { useModals } from "@revolt/modal";
import { useVoice } from "@revolt/rtc";
import { useState } from "@revolt/state";
import { Avatar } from "@revolt/ui";
import { Symbol } from "@revolt/ui/components/utils/Symbol";

const panel = css({
  position: "fixed",
  left: "var(--gap-md)",
  bottom: "var(--gap-md)",
  zIndex: 50,
  width: "300px",
  display: "flex",
  flexDirection: "column",
  borderRadius: "var(--borderRadius-xl)",
  background: "var(--md-sys-color-surface-container)",
  color: "var(--md-sys-color-on-surface)",
  boxShadow:
    "0 10px 25px -5px rgba(0,0,0,0.35), 0 6px 10px -6px rgba(0,0,0,0.3), inset 0 0 0 1px color-mix(in oklab, var(--md-sys-color-on-surface) 8%, transparent)",
  overflow: "hidden",
  userSelect: "none",
  padding: ".5rem",
});

const voiceSection = css({
  display: "flex",
  flexDirection: "column",
  gap: "var(--gap-xs)",
  padding: "var(--gap-sm) var(--gap-md)",
  // background:
  //   "color-mix(in oklab, var(--md-sys-color-primary) 12%, transparent)",
  borderBottom: "1px solid var(--md-sys-color-outline-variant)",
});

const voiceHeader = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "var(--gap-sm)",
});

const voiceActions = css({
  display: "flex",
  alignItems: "center",
  gap: "2px",
  marginInlineStart: "auto",
});

const voiceInfo = css({
  display: "flex",
  flexDirection: "column",
  minWidth: 0,
  flex: 1,
});

const voiceConnected = css({
  fontSize: "12px",
  fontWeight: 600,
  color:
    "color-mix(in oklab, var(--md-sys-color-primary) 80%, var(--md-sys-color-on-surface))",
});

const voiceWhere = css({
  fontSize: "12px",
  color: "var(--md-sys-color-on-surface-variant)",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
});

const userRow = css({
  display: "flex",
  alignItems: "center",
  gap: "var(--gap-sm)",
  padding: "0.5rem var(--gap-sm)",
});

const userInfo = css({
  display: "flex",
  flexDirection: "column",
  minWidth: 0,
  flex: 1,
});

const userName = css({
  fontSize: "13px",
  fontWeight: 600,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
});

const userHandle = css({
  fontSize: "11px",
  color: "var(--md-sys-color-on-surface-variant)",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
});

const iconBtn = css({
  flexShrink: 0,
  width: "32px",
  height: "32px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "var(--borderRadius-md)",
  border: 0,
  background: "transparent",
  color: "var(--md-sys-color-on-surface-variant)",
  cursor: "pointer",
  transition: "background 120ms ease, color 120ms ease",
  _hover: {
    background: "var(--md-sys-color-surface-container-high)",
    color: "var(--md-sys-color-on-surface)",
  },
  "&[data-active=true]": {
    color: "var(--md-sys-color-on-surface)",
  },
  "&[data-disabled=true]": {
    opacity: 0.4,
    cursor: "not-allowed",
    _hover: {
      background: "transparent",
      color: "var(--md-sys-color-on-surface-variant)",
    },
  },
  "&[data-danger=true]": {
    color: "var(--md-sys-color-error)",
    _hover: {
      background:
        "color-mix(in oklab, var(--md-sys-color-error) 15%, transparent)",
      color: "var(--md-sys-color-error)",
    },
  },
});

const signalBars = css({
  display: "inline-flex",
  alignItems: "flex-end",
  gap: "2px",
  width: "16px",
  height: "16px",
  padding: "0 1px",
});

const signalBar = css({
  width: "3px",
  borderRadius: "1px",
  background: "currentColor",
  opacity: 0.25,
  "&[data-on=true]": {
    opacity: 1,
  },
});

const signalWrap = css({
  flexShrink: 0,
  width: "28px",
  height: "28px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "var(--borderRadius-md)",
  color: "var(--md-sys-color-on-surface-variant)",
  "&[data-quality=excellent]": {
    color: "var(--md-sys-color-primary)",
  },
  "&[data-quality=good]": {
    color: "var(--md-sys-color-primary)",
  },
  "&[data-quality=poor]": {
    color: "#e7a93b",
  },
  "&[data-quality=lost]": {
    color: "var(--md-sys-color-error)",
  },
});

function qualityLabel(q: ConnectionQuality): string {
  if (q === ConnectionQuality.Excellent) return "Excellent connection";
  if (q === ConnectionQuality.Good) return "Good connection";
  if (q === ConnectionQuality.Poor) return "Poor connection";
  if (q === ConnectionQuality.Lost) return "Connection lost";
  return "Connection quality unknown";
}

function qualityKey(q: ConnectionQuality): string {
  if (q === ConnectionQuality.Excellent) return "excellent";
  if (q === ConnectionQuality.Good) return "good";
  if (q === ConnectionQuality.Poor) return "poor";
  if (q === ConnectionQuality.Lost) return "lost";
  return "unknown";
}

function activeBars(q: ConnectionQuality): number {
  if (q === ConnectionQuality.Excellent) return 3;
  if (q === ConnectionQuality.Good) return 2;
  if (q === ConnectionQuality.Poor) return 1;
  return 0;
}

function ConnectionStrength(props: { quality: ConnectionQuality }) {
  return (
    <div
      class={signalWrap}
      data-quality={qualityKey(props.quality)}
      title={qualityLabel(props.quality)}
    >
      <div class={signalBars}>
        <div
          class={signalBar}
          data-on={activeBars(props.quality) >= 1}
          style={{ height: "5px" }}
        />
        <div
          class={signalBar}
          data-on={activeBars(props.quality) >= 2}
          style={{ height: "9px" }}
        />
        <div
          class={signalBar}
          data-on={activeBars(props.quality) >= 3}
          style={{ height: "13px" }}
        />
      </div>
    </div>
  );
}

function IconButton(props: {
  onClick?: () => void;
  active?: boolean;
  danger?: boolean;
  disabled?: boolean;
  title?: string;
  children: any;
}) {
  return (
    <button
      type="button"
      class={iconBtn}
      data-active={props.active}
      data-danger={props.danger}
      data-disabled={props.disabled}
      disabled={props.disabled}
      title={props.title}
      onClick={(e) => {
        e.stopPropagation();
        if (props.disabled) return;
        props.onClick?.();
      }}
    >
      {props.children}
    </button>
  );
}

export function UserPanel() {
  const user = useUser();
  const state = useState();
  const voice = useVoice();
  const { openModal } = useModals();

  const inVoice = () =>
    voice && (voice.state() === "CONNECTED" || voice.state() === "CONNECTING");

  const [hasCamera, setHasCamera] = createSignal(false);
  onMount(async () => {
    try {
      const devices = await navigator.mediaDevices?.enumerateDevices?.();
      setHasCamera(!!devices?.some((d) => d.kind === "videoinput"));
    } catch {
      setHasCamera(false);
    }
  });

  const canScreenshare = () =>
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices?.getDisplayMedia;

  const [quality, setQuality] = createSignal<ConnectionQuality>(
    ConnectionQuality.Unknown,
  );

  createEffect(
    on(
      () => voice?.room(),
      (room) => {
        if (!room) {
          setQuality(ConnectionQuality.Unknown);
          return;
        }
        const update = () =>
          setQuality(room.localParticipant.connectionQuality);
        update();
        const handler = (
          q: ConnectionQuality,
          participant: { isLocal: boolean },
        ) => {
          if (participant.isLocal) setQuality(q);
        };
        room.on(RoomEvent.ConnectionQualityChanged, handler);
        onCleanup(() => room.off(RoomEvent.ConnectionQualityChanged, handler));
      },
    ),
  );

  const muted = () => !state.voice.micOn;
  const deafened = () => state.voice.deafen;
  const noiseOn = () => state.voice.noiseSupression !== "disabled";

  function toggleMic() {
    if (inVoice()) {
      voice.toggleMute();
    } else {
      state.voice.micOn = !state.voice.micOn;
    }
  }

  function toggleDeafen() {
    if (inVoice()) {
      voice.toggleDeafen();
    } else {
      state.voice.deafen = !state.voice.deafen;
    }
  }

  function toggleNoiseSuppression() {
    state.voice.noiseSupression =
      state.voice.noiseSupression === "disabled" ? "browser" : "disabled";
  }

  function hangUp() {
    voice?.disconnect();
  }

  function openSettings() {
    openModal({ type: "settings", config: "user" });
  }

  return (
    <Show when={user()}>
      <div class={panel}>
        <Show when={inVoice()}>
          <div class={voiceSection}>
            <div class={voiceHeader}>
              <div
                class={css({
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--gap-sm)",
                })}
              >
                <ConnectionStrength quality={quality()} />
                <div class={voiceInfo}>
                  <div class={voiceConnected}>
                    <Show
                      when={voice.state() === "CONNECTED"}
                      fallback={<Trans>Connecting…</Trans>}
                    >
                      <Trans>Voice Connected</Trans>
                    </Show>
                  </div>
                  <div class={voiceWhere}>
                    {voice.channel()?.name}
                    <Show when={voice.channel()?.server}>
                      {" / "}
                      {voice.channel()!.server!.name}
                    </Show>
                  </div>
                </div>
              </div>
              <div class={voiceActions}>
                <IconButton
                  onClick={toggleNoiseSuppression}
                  active={noiseOn()}
                  title={
                    noiseOn() ? "Noise suppression on" : "Noise suppression off"
                  }
                >
                  <Symbol>
                    {noiseOn() ? "noise_aware" : "noise_control_off"}
                  </Symbol>
                </IconButton>
                <IconButton onClick={hangUp} danger title="Disconnect">
                  <Symbol>call_end</Symbol>
                </IconButton>
              </div>
            </div>
            <div
              class={css({
                display: "flex",
                justifyContent: "space-between",
                gap: "2px",
              })}
            >
              <IconButton
                onClick={() => voice.toggleCamera()}
                active={voice.video()}
                disabled={!hasCamera()}
                title={
                  !hasCamera()
                    ? "No camera available"
                    : voice.video()
                      ? "Stop camera"
                      : "Start camera"
                }
              >
                <Symbol>{voice.video() ? "videocam" : "videocam_off"}</Symbol>
              </IconButton>
              <IconButton
                onClick={() => voice.toggleScreenshare()}
                active={voice.screenshare()}
                disabled={!canScreenshare()}
                title={voice.screenshare() ? "Stop sharing" : "Share screen"}
              >
                <Symbol>screen_share</Symbol>
              </IconButton>
              <IconButton disabled title="Soundboard (coming soon)">
                <Symbol>graphic_eq</Symbol>
              </IconButton>
            </div>
          </div>
        </Show>

        <div class={userRow}>
          <Avatar
            size={32}
            src={user()?.animatedAvatarURL}
            fallback={user()?.displayName}
          />
          <div class={userInfo}>
            <div class={userName}>{user()?.displayName}</div>
            <div class={userHandle}>
              {user()?.username}#{user()?.discriminator}
            </div>
          </div>
          <IconButton
            onClick={toggleMic}
            active={!muted()}
            title={muted() ? "Unmute" : "Mute"}
          >
            <Symbol>{muted() ? "mic_off" : "mic"}</Symbol>
          </IconButton>
          <IconButton
            onClick={toggleDeafen}
            active={!deafened()}
            title={deafened() ? "Undeafen" : "Deafen"}
          >
            <Symbol>{deafened() ? "headset_off" : "headset"}</Symbol>
          </IconButton>
          <IconButton onClick={openSettings} title="Settings">
            <Symbol>settings</Symbol>
          </IconButton>
        </div>
      </div>
    </Show>
  );
}
