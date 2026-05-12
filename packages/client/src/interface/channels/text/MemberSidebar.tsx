import {
  For,
  Match,
  Show,
  Switch,
  createEffect,
  createMemo,
  on,
} from "solid-js";

import { useLingui } from "@lingui-solid/solid/macro";
import { VirtualContainer } from "@minht11/solid-virtual-container";
import { Channel, ServerMember, User } from "stoat.js";
import { styled } from "styled-system/jsx";

import { floatingUserMenus } from "@revolt/app/menus/UserContextMenu";
import { useClient } from "@revolt/client";
import { timeLocale, useTime } from "@revolt/i18n";
import { useModals } from "@revolt/modal";
import { useQuery } from "@tanstack/solid-query";

import { TextWithEmoji } from "@revolt/markdown";
import { userInformation } from "@revolt/markdown/users";
import {
  Avatar,
  Deferred,
  MenuButton,
  OverflowingText,
  Profile,
  Row,
  Tooltip,
  UserStatus,
  Username,
  typography,
} from "@revolt/ui";
import { css } from "styled-system/css/css";

interface Props {
  /**
   * Channel
   */
  channel: Channel;

  /**
   * Scroll target element
   */
  scrollTargetElement: HTMLDivElement;
}

const userInfo = css({
  display: "flex",
  flexDirection: "column",
  minWidth: 0,
  flex: 1,
  paddingRight: "var(--gap-md)",
  paddingLeft: "var(--gap-md)",
  marginBottom: "12px",
});

const userName = css({
  fontSize: "20px",
  fontWeight: 700,
  lineHeight: 1.2,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  color: "var(--md-sys-color-on-surface)",
});

const userHandle = css({
  fontSize: "14px",
  lineHeight: "18px",
  color: "var(--md-sys-color-on-surface-variant)",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
});

const sectionStack = css({
  display: "flex",
  flexDirection: "column",
  gap: "var(--gap-md)",
  paddingLeft: "var(--gap-md)",
  paddingRight: "var(--gap-md)",
  marginTop: "var(--gap-md)",
});

const glassCard = css({
  position: "relative",
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  padding: "12px",
  borderRadius: "8px",
  background:
    "linear-gradient(135deg, color-mix(in srgb, var(--md-sys-color-surface) 55%, transparent), color-mix(in srgb, var(--md-sys-color-surface) 25%, transparent))",
  backdropFilter: "blur(20px) saturate(180%)",
  // border:
  //   "1px solid color-mix(in srgb, var(--md-sys-color-on-surface) 12%, transparent)",
  boxShadow:
    "0 1px 0 color-mix(in srgb, white 8%, transparent) inset, 0 8px 24px color-mix(in srgb, black 18%, transparent)",
  color: "var(--md-sys-color-on-surface)",
  overflow: "hidden",
  marginBottom: "12px",
});

const cardTitle = css({
  fontSize: "12px",
  fontWeight: 600,
  lineHeight: 1.3333333333333333,
  color: "var(--md-sys-color-on-surface-variant)",
});

const cardContent = css({
  fontSize: "14px",
  fontWeight: 400,
  lineHeight: 1.2857142857142858,
  color: "var(--md-sys-color-on-surface)",
});

const activityBody = css({
  display: "flex",
  alignItems: "center",
  gap: "12px",
  minWidth: 0,
});

const activityAvatarStack = css({
  position: "relative",
  width: "48px",
  height: "48px",
  flexShrink: 0,
});

const activityAvatarBack = css({
  position: "absolute",
  top: 0,
  left: 0,
  width: "28px",
  height: "28px",
  borderRadius: "50%",
  overflow: "hidden",
  border: "2px solid var(--md-sys-color-surface)",
});

const activityAvatarFront = css({
  position: "absolute",
  bottom: 0,
  right: 0,
  width: "32px",
  height: "32px",
  borderRadius: "50%",
  overflow: "hidden",
  border: "2px solid var(--md-sys-color-surface)",
});

const activityDetails = css({
  display: "flex",
  flexDirection: "column",
  gap: "2px",
  minWidth: 0,
  flex: 1,
});

const activityChannelName = css({
  display: "flex",
  alignItems: "center",
  gap: "4px",
  fontSize: "14px",
  fontWeight: 600,
  lineHeight: 1.2857142857142858,
  color: "var(--md-sys-color-on-surface)",
});

const activityChannelSubtitle = css({
  fontSize: "12px",
  fontWeight: 400,
  lineHeight: 1.3333333333333333,
  color: "var(--md-sys-color-on-surface-variant)",
});

const cardDivider = css({
  height: "1px",
  background:
    "color-mix(in srgb, var(--md-sys-color-on-surface) 10%, transparent)",
  margin: "12px -16px",
});

const collapsible = css({
  "& > summary": {
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: 600,
    lineHeight: 1.3333333333333333,
    listStyle: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    color: "var(--md-sys-color-on-surface-variant)",
  },
  "& > summary::-webkit-details-marker": {
    display: "none",
  },
  "& > summary::after": {
    content: '"▸"',
    fontSize: "0.7rem",
    color: "var(--md-sys-color-on-surface-variant)",
    transition: "transform 200ms ease",
  },
  "&[open] > summary::after": {
    transform: "rotate(90deg)",
  },
});

const collapsibleList = css({
  display: "flex",
  flexDirection: "column",
  gap: "var(--gap-sm)",
  marginTop: "12px",
  paddingTop: "12px",
  borderTop:
    "1px solid color-mix(in srgb, var(--md-sys-color-on-surface) 10%, transparent)",
});

const collapsibleRow = css({
  display: "flex",
  alignItems: "center",
  gap: "var(--gap-sm)",
  fontSize: "14px",
  fontWeight: 400,
  lineHeight: 1.2857142857142858,
  color: "var(--md-sys-color-on-surface)",
  minWidth: 0,
  padding: "4px 0",
});

const collapsibleEmpty = css({
  fontSize: "0.75rem",
  color: "var(--md-sys-color-on-surface-variant)",
  marginTop: "12px",
  paddingTop: "12px",
  borderTop:
    "1px solid color-mix(in srgb, var(--md-sys-color-on-surface) 10%, transparent)",
});

/**
 * Member Sidebar
 */
export function MemberSidebar(props: Props) {
  const client = useClient();
  const user = () => props.channel.recipient;
  const { openModal } = useModals();
  const dayjs = useTime();

  const query = useQuery(() => ({
    queryKey: ["profile", user()?.id],
    queryFn: () => user()!.fetchProfile(),
    enabled: !!user(),
  }));

  const mutualsQuery = useQuery(() => ({
    queryKey: ["mutual", user()?.id],
    queryFn: async () => {
      const u = user()!;
      if (u.self || u.bot) return { users: [], servers: [] };

      const clnt = client();
      const { users, servers } = await u.fetchMutual();

      return {
        users: users.map((userId) => clnt.users.get(userId)!).filter((u) => u),
        servers: servers
          .map((serverId) => clnt.servers.get(serverId)!)
          .filter((s) => s),
      };
    },
    enabled: !!user() && props.channel.type === "DirectMessage",
  }));

  const joinedFormat = () =>
    timeLocale()[1]
      .formats.L?.replace("MM", "MMM")
      .replaceAll("/", " ")
      .replaceAll("-", " ");

  const voiceActivity = createMemo(() => {
    const u = user();
    if (!u) return null;
    for (const channel of client().channels.values()) {
      if (channel.voiceParticipants.has(u.id)) {
        const others = [...channel.voiceParticipants.values()]
          .filter((p) => p.userId !== u.id)
          .map((p) => client().users.get(p.userId))
          .filter((x): x is User => !!x);
        return { channel, others };
      }
    }
    return null;
  });

  return (
    <Switch>
      <Match when={props.channel.type === "Group"}>
        <GroupMemberSidebar
          channel={props.channel}
          scrollTargetElement={props.scrollTargetElement}
        />
      </Match>
      <Match when={props.channel.type === "TextChannel"}>
        <ServerMemberSidebar
          channel={props.channel}
          scrollTargetElement={props.scrollTargetElement}
        />
      </Match>
      <Match when={props.channel.type === "DirectMessage"}>
        <div class={css({ marginBottom: "8px" })}>
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
            full
          />
        </div>
        <div class={userInfo}>
          <div class={userName}>{user()?.displayName}</div>
          <div class={userHandle}>
            {user()?.username}#{user()?.discriminator}
          </div>
        </div>
        <div class={sectionStack}>
          <Show when={voiceActivity()}>
            {(activity) => (
              <div class={glassCard}>
                <div class={cardTitle}>In voice</div>
                <div class={activityBody}>
                  <div class={activityAvatarStack}>
                    <Show when={activity().others[0]}>
                      <div class={activityAvatarBack}>
                        <Avatar
                          src={activity().others[0]!.animatedAvatarURL}
                          fallback={activity().others[0]!.displayName}
                          size={28}
                        />
                      </div>
                    </Show>
                    <div class={activityAvatarFront}>
                      <Avatar
                        src={user()!.animatedAvatarURL}
                        fallback={user()!.displayName}
                        size={32}
                      />
                    </div>
                  </div>
                  <div class={activityDetails}>
                    <div class={activityChannelName}>
                      <OverflowingText>
                        {activity().channel.name}
                      </OverflowingText>
                    </div>
                    <Show when={activity().channel.server}>
                      <div class={activityChannelSubtitle}>
                        <OverflowingText>
                          in {activity().channel.server!.name}
                        </OverflowingText>
                      </div>
                    </Show>
                  </div>
                </div>
              </div>
            )}
          </Show>
          <Show when={user()}>
            <div class={glassCard}>
              <div class={cardTitle}>Member since</div>
              <div class={cardContent}>
                {dayjs(user()!.createdAt).format(joinedFormat())}
              </div>
            </div>
          </Show>
          <div class={glassCard}>
            <details class={collapsible}>
              <summary>Mutual servers</summary>
              <Show
                when={mutualsQuery.data?.servers.length}
                fallback={<div class={collapsibleEmpty}>No mutual servers</div>}
              >
                <div class={collapsibleList}>
                  <For each={mutualsQuery.data?.servers}>
                    {(server) => (
                      <div class={collapsibleRow}>
                        <Avatar
                          src={server.animatedIconURL}
                          fallback={server.name}
                          size={20}
                        />
                        <OverflowingText>{server.name}</OverflowingText>
                      </div>
                    )}
                  </For>
                </div>
              </Show>
            </details>
            <div class={cardDivider} />
            <details class={collapsible}>
              <summary>Mutual friends</summary>
              <Show
                when={mutualsQuery.data?.users.length}
                fallback={<div class={collapsibleEmpty}>No mutual friends</div>}
              >
                <div class={collapsibleList}>
                  <For each={mutualsQuery.data?.users}>
                    {(u) => (
                      <div class={collapsibleRow}>
                        <Avatar
                          src={u.animatedAvatarURL}
                          fallback={u.displayName}
                          size={20}
                        />
                        <OverflowingText>{u.displayName}</OverflowingText>
                      </div>
                    )}
                  </For>
                </div>
              </Show>
            </details>
          </div>
        </div>
      </Match>
    </Switch>
  );
}

/**
 * Servers to not fetch all members for
 */
const LARGE_SERVERS = [
  "01F7ZSBSFHQ8TA81725KQCSDDP",
  "01G3PKD1YJ2H484MDX6KP9WRBN",
  // top servers on discover
  "01K313D0VP0HPNG30DNZ4Q672H",
  "01J31CCMTYKFPGCM13VRP3B289",
  "01H2Y4Y97PW6584PHN1TAVN5WR",
  "01HVKQBBQ3DQVVNK3M8DHXV30D",
  "01GDS83RMZW89AV0BZG24NEXYC",
  "01J5W0XERBBGK77BMDVPZJ20JW",
];

/**
 * Server Member Sidebar
 */
export function ServerMemberSidebar(props: Props) {
  const client = useClient();

  // todo: useQuery
  createEffect(
    on(
      () => props.channel.serverId,
      (serverId) =>
        props.channel.server?.syncMembers(
          LARGE_SERVERS.includes(serverId) ? true : false,
          200,
        ),
    ),
  );

  // Stage 1: Find roles and members
  const stage1 = createMemo(() => {
    const hoistedRoles = props.channel.server!.orderedRoles.filter(
      (role) => role.hoist,
    );

    const members = client().serverMembers.filter(
      (member) => member.id.server === props.channel.serverId,
    );

    return [members, hoistedRoles] as const;
  });

  // Stage 2: Filter members by permissions (if necessary)
  const stage2 = createMemo(() => {
    const [members] = stage1();
    if (props.channel.potentiallyRestrictedChannel) {
      return members.filter((member) =>
        member.hasPermission(props.channel, "ViewChannel"),
      );
    } else {
      return members;
    }
  });

  // Stage 3: Categorise each member entry into role lists
  const stage3 = createMemo(() => {
    const [, hoistedRoles] = stage1();
    const members = stage2();

    const byRole: Record<string, ServerMember[]> = { default: [], offline: [] };
    hoistedRoles.forEach((role) => (byRole[role.id] = []));

    for (const member of members) {
      if (!member.user?.online) {
        byRole["offline"].push(member);
        continue;
      }

      if (member.roles.length) {
        let assigned;
        for (const hoistedRole of hoistedRoles) {
          if (member.roles.includes(hoistedRole.id)) {
            byRole[hoistedRole.id].push(member);
            assigned = true;
            break;
          }
        }

        if (assigned) continue;
      }

      byRole["default"].push(member);
    }

    return [
      ...hoistedRoles.map((role) => ({
        role,
        members: byRole[role.id],
      })),
      {
        role: {
          id: "default",
          name: "Online",
        },
        members: byRole["default"],
      },
      {
        role: {
          id: "offline",
          name: "Offline",
        },
        members: byRole["offline"],
      },
    ].filter((entry) => entry.members.length);
  });

  // Stage 4: Perform sorting on role lists
  const roles = createMemo(() => {
    const roles = stage3();

    return roles.map((entry) => ({
      ...entry,
      members: [...entry.members].sort(
        (a, b) =>
          (a.nickname ?? a.user?.displayName)?.localeCompare(
            b.nickname ?? b.user?.displayName ?? "",
          ) || 0,
      ),
    }));
  });

  // Stage 5: Flatten into a single list with caching
  const objectCache = new Map();

  const elements = createMemo(() => {
    const elements: (
      | { t: 0; name: string; count: number }
      | { t: 1; member: ServerMember }
    )[] = [];

    // Create elements
    for (const role of roles()) {
      const roleElement = objectCache.get(role.role.name + role.members.length);
      if (roleElement) {
        elements.push(roleElement);
      } else {
        elements.push({
          t: 0,
          name: role.role.name,
          count: role.members.length,
        });
      }

      for (const member of role.members) {
        const memberElement = objectCache.get(member.id);
        if (memberElement) {
          elements.push(memberElement);
        } else {
          elements.push({
            t: 1,
            member,
          });
        }
      }
    }

    // Flush cache
    objectCache.clear();

    // Populate cache
    for (const element of elements) {
      if (element.t === 0) {
        objectCache.set(element.name + element.count, element);
      } else {
        objectCache.set(element.member.id, element);
      }
    }

    return elements;
  });

  const onlineMembers = createMemo(
    () =>
      client().serverMembers.filter(
        (member) =>
          (member.id.server === props.channel.serverId &&
            member.user?.online) ||
          false,
      ).length,
  );

  return (
    <Container>
      <Show when={!LARGE_SERVERS.includes(props.channel.serverId)}>
        <MemberTitle bottomMargin="yes">
          <Row align>
            <UserStatus size="0.7em" status="Online" />
            {onlineMembers()} members online
          </Row>
        </MemberTitle>
      </Show>

      <Deferred>
        <VirtualContainer
          items={elements()}
          scrollTarget={props.scrollTargetElement}
          itemSize={{ height: 42 }}
        >
          {(item) => (
            <div
              style={{
                ...item.style,
                width: "100%",
              }}
            >
              <Switch
                fallback={
                  <CategoryTitle>
                    {(item.item as { name: string }).name} {"–"}{" "}
                    {(item.item as { count: number }).count}
                  </CategoryTitle>
                }
              >
                <Match when={item.item.t === 1}>
                  <Member
                    member={(item.item as { member: ServerMember }).member}
                  />
                </Match>
              </Switch>
            </div>
          )}
        </VirtualContainer>
      </Deferred>
    </Container>
  );
}

/**
 * Group Member Sidebar
 */
export function GroupMemberSidebar(props: Props) {
  return (
    <Container>
      <MemberTitle>
        <Row align>{props.channel.recipientIds.size} members</Row>
      </MemberTitle>

      <Deferred>
        <VirtualContainer
          items={props.channel.recipients.toSorted((a, b) =>
            a.displayName.localeCompare(b.displayName),
          )}
          scrollTarget={props.scrollTargetElement}
          itemSize={{ height: 42 }}
        >
          {(item) => (
            <div
              style={{
                ...item.style,
                width: "100%",
              }}
            >
              <Member user={item.item} />
            </div>
          )}
        </VirtualContainer>
      </Deferred>
    </Container>
  );
}

/**
 * Container styles
 */
const Container = styled("div", {
  base: {
    paddingRight: "var(--gap-md)",
    width: "var(--layout-width-channel-sidebar)",
  },
});

/**
 * Category Title
 */
const CategoryTitle = styled("div", {
  base: {
    padding: "28px 14px 0",
    color: "var(--md-sys-color-on-surface)",

    ...typography.raw({ class: "label", size: "small" }),
  },
});

/**
 * Member title
 */
const MemberTitle = styled("div", {
  base: {
    marginTop: "12px",
    marginLeft: "14px",
    color: "var(--md-sys-color-on-surface)",

    ...typography.raw({ class: "label", size: "small" }),
  },
  variants: {
    bottomMargin: {
      no: {},
      yes: {
        marginBottom: "-12px",
      },
    },
  },
});

/**
 * Styles required to correctly display name and status
 */
const NameStatusStack = styled("div", {
  base: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
});

/**
 * Member
 */
function Member(props: { user?: User; member?: ServerMember }) {
  const { t } = useLingui();

  /**
   * Create user information
   */
  const user = () =>
    userInformation((props.user ?? props.member?.user)!, props.member);

  /**
   * Get user status
   */
  const status = () =>
    (props.user ?? props.member?.user)?.statusMessage((s) =>
      s === "Online"
        ? t`Online`
        : s === "Busy"
          ? t`Busy`
          : s === "Focus"
            ? t`Focus`
            : s === "Idle"
              ? t`Idle`
              : t`Offline`,
    );

  return (
    <div
      use:floating={floatingUserMenus(
        (props.user ?? props.member?.user)!,
        props.member,
      )}
    >
      <MenuButton
        size="normal"
        attention={
          (props.user ?? props.member?.user)?.online ? "active" : "muted"
        }
        icon={
          <Avatar
            src={user().avatar}
            size={32}
            holepunch="bottom-right"
            overlay={
              <UserStatus.Graphic
                status={(props.user ?? props.member?.user)?.presence}
              />
            }
          />
        }
      >
        <NameStatusStack>
          <OverflowingText>
            <Username username={user().username} colour={user().colour!} />
          </OverflowingText>
          <Show when={status()}>
            <Tooltip
              content={() => <TextWithEmoji content={status()!} />}
              placement="top-start"
              aria={status()!}
            >
              <OverflowingText class={typography({ class: "_status" })}>
                <TextWithEmoji content={status()!} />
              </OverflowingText>
            </Tooltip>
          </Show>
        </NameStatusStack>
      </MenuButton>
    </div>
  );
}
