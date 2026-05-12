# Soundboard — Server-Side Contract

This document describes the API surface the frontend expects from the Stoat
server (and Autumn media server) to support the per-server soundboard feature.
The client implementation in this repo is already wired against the names and
shapes below. When the server is built out, regenerate `stoat-api` and the
client should pick up the official types automatically — until then the client
uses locally-declared mirror types in `client/packages/stoat.js/src/api/sound.ts`.

## Overview

A **Sound** is a short audio clip uploaded to a Stoat server. Members with the
appropriate permission can upload sounds; any member who can join a voice
channel can trigger playback, which broadcasts the clip into the LiveKit room
as a separate audio track attributed to the player.

## Recommended limits

| Field                | Value          | Notes                                                  |
| -------------------- | -------------- | ------------------------------------------------------ |
| Max clip duration    | 5 s            | Matches Discord; enforced server-side after decode     |
| Max file size        | 512 KiB        | Enforce in Autumn                                      |
| Accepted mime types  | `audio/mpeg`, `audio/ogg`, `audio/wav`, `audio/webm` | Re-encode to a single canonical format if you can      |
| Max sounds / server  | 48             | Expose via `RevoltConfig.features.limits.default.sounds` |
| Max name length      | 32             | Same as emoji                                          |

The client reads the limit through `CONFIGURATION.MAX_SOUNDS` which currently
defaults to 48. Update the value on the server's config payload to drive it
remotely.

## Autumn

Add a new tag: **`sounds`**.

```
POST {AUTUMN}/sounds
Content-Type: multipart/form-data
Body: file=<audio-file>

→ 200 OK
{ "id": "<autumn-id>" }
```

Validation:
- Reject files larger than 512 KiB.
- Reject mime types outside the accepted list above.
- Decode the audio (e.g. with `symphonia` / `ffprobe`) and reject anything
  longer than 5 s. Do this before persisting so callers don't waste storage.

## Stoat API

### Type: `Sound`

```ts
{
  _id: string;              // ULID, also the Autumn id
  parent: SoundParent;      // see below
  creator_id: string;       // user who uploaded
  name: string;             // display name, 1..32 chars
  // Optional but recommended:
  // duration_ms?: number;  // surfaces "0:03" in the UI
}
```

### Type: `SoundParent`

```ts
type SoundParent =
  | { type: "Server"; id: string }
  | { type: "Detached" };   // for sounds whose parent was deleted
```

This mirrors `EmojiParent`. We don't currently use `Detached` on the client
but include it for consistency with emoji behaviour.

### Type: `DataCreateSound`

```ts
{
  name: string;
  parent: SoundParent;
}
```

### Routes

| Method | Path                          | Body / Notes                                         | Response             |
| ------ | ----------------------------- | ---------------------------------------------------- | -------------------- |
| `PUT`  | `/custom/sound/:autumnId`     | `DataCreateSound`                                     | `Sound`              |
| `GET`  | `/custom/sound/:soundId`      | —                                                    | `Sound`              |
| `DELETE` | `/custom/sound/:soundId`    | —                                                    | `204`                |
| `GET`  | `/servers/:serverId/sounds`   | List all sounds belonging to a server                | `Sound[]`            |

### Permissions

Reuse `ManageCustomisation` (the bit already used for emojis) to gate
upload/delete. Anyone who can join the voice channel can *play* sounds — no
new permission needed for playback (it's just publishing an audio track).

### Server events (WebSocket)

Add two events to the v1 protocol, modelled after `EmojiCreate`/`EmojiDelete`:

```jsonc
// Broadcast to all members of the parent server when a sound is added.
{ "type": "SoundCreate", "_id": "...", "parent": { ... }, "creator_id": "...", "name": "..." }

// Broadcast on deletion.
{ "type": "SoundDelete", "id": "..." }
```

The client handles both in `events/v1.ts` and re-emits them as `soundCreate` /
`soundDelete` on the `Client`.

### Ready payload

Include the user's accessible sounds in the initial `Ready` payload alongside
emojis, so the soundboard can render without a follow-up fetch. If that's
expensive, the client will fall back to `Server.fetchSounds()` on demand.

```jsonc
{
  "type": "Ready",
  // ...existing fields...
  "sounds": [/* Sound[] */]
}
```

## Playback

The client does **not** ask the server to broadcast audio. When a user
triggers a sound it:

1. Fetches the clip via Autumn (`{AUTUMN}/sounds/<id>`).
2. Decodes it through the Web Audio API.
3. Routes it through a `MediaStreamAudioDestinationNode` and publishes the
   resulting track to LiveKit as `Track.Source.Unknown` with name
   `soundboard`. Other clients subscribe to it via the existing
   `RoomAudioManager`.

This means **no server changes are needed for playback** — LiveKit handles
fan-out. The Stoat server just needs to allow a second audio track per
participant in the room (the default token grants already permit this).

## Migration notes

* The frontend types in `client/packages/stoat.js/src/api/sound.ts` should be
  removed once `stoat-api` is regenerated with `Sound`, `SoundParent`,
  `DataCreateSound`, and the `SoundCreate` / `SoundDelete` event variants. The
  client code imports through that local module to make the swap a one-line
  change.
