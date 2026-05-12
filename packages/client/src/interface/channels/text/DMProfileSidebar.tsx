import { Show } from "solid-js";

import { useQuery } from "@tanstack/solid-query";
import { Channel } from "stoat.js";
import { css } from "styled-system/css";

import { useModals } from "@revolt/modal";
import { Profile } from "@revolt/ui";

const wrapper = css({
  display: "flex",
  flexDirection: "column",
  gap: "var(--gap-md)",
  padding: "var(--gap-md)",
  width: "100%",
});

/**
 * Sidebar shown on DM channels — surfaces the recipient's profile
 * directly in the right rail (Discord-style).
 */
export function DMProfileSidebar(props: { channel: Channel }) {
  const { openModal } = useModals();

  const user = () => props.channel.recipient;

  const query = useQuery(() => ({
    queryKey: ["profile", user()?.id],
    queryFn: () => user()!.fetchProfile(),
    enabled: !!user(),
  }));

  return (
    <Show when={user()}>
      <div class={wrapper}>
        <Profile.Banner
          width={2}
          user={user()!}
          bannerUrl={query.data?.animatedBannerURL}
          onClickAvatar={(e) => {
            e.stopPropagation();
            if (user()!.avatar) {
              openModal({ type: "image_viewer", file: user()!.avatar! });
            }
          }}
        />
        <Profile.Actions user={user()!} width={2} />
        <Profile.Status user={user()!} />
        <Profile.Badges user={user()!} />
        <Profile.Joined user={user()!} />
        <Profile.Mutuals user={user()!} />
        <Profile.Bio content={query.data?.content} full />
      </div>
    </Show>
  );
}
