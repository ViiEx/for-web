import { JSX, Match, Show, Switch, createMemo, createSignal } from "solid-js";

import { Trans } from "@lingui-solid/solid/macro";
import { css } from "styled-system/css";

import { useClient, useClientLifecycle } from "@revolt/client";
import {
  createMfaResource,
  createOwnProfileResource,
} from "@revolt/client/resources";
import { useModals } from "@revolt/modal";
import {
  Column,
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
  Row,
  iconSize,
} from "@revolt/ui";

import MdAlternateEmail from "@material-design-icons/svg/outlined/alternate_email.svg?component-solid";
import MdBlock from "@material-design-icons/svg/outlined/block.svg?component-solid";
import MdChevronRight from "@material-design-icons/svg/outlined/chevron_right.svg?component-solid";
import MdDelete from "@material-design-icons/svg/outlined/delete.svg?component-solid";
import MdExpandMore from "@material-design-icons/svg/outlined/expand_more.svg?component-solid";
import MdLock from "@material-design-icons/svg/outlined/lock.svg?component-solid";
import MdMail from "@material-design-icons/svg/outlined/mail.svg?component-solid";
import MdPassword from "@material-design-icons/svg/outlined/password.svg?component-solid";
import MdVerifiedUser from "@material-design-icons/svg/outlined/verified_user.svg?component-solid";

import { useSettingsNavigation } from "../Settings";

import { UserSummary } from "./account/index";

/**
 * Account Page
 */
export function MyAccount() {
  const client = useClient();
  const profile = createOwnProfileResource();
  const { navigate } = useSettingsNavigation();

  return (
    <Column gap="lg">
      <UserSummary
        user={client().user!}
        bannerUrl={profile.data?.animatedBannerURL}
        onEdit={() => navigate("profile")}
        showBadges
      />
      <EditAccount />
      <MultiFactorAuth />
      <ManageAccount />
    </Column>
  );
}

/**
 * Edit account details
 */
function EditAccount() {
  const client = useClient();
  const { openModal } = useModals();
  const [email, setEmail] = createSignal("•••••••••••@•••••••••••");

  return (
    <ItemGroup>
      <Item
        interactive
        onPress={() =>
          openModal({
            type: "edit_username",
            client: client(),
          })
        }
      >
        <ItemMedia>
          <MdAlternateEmail {...iconSize(22)} />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>
            <Trans>Username</Trans>
          </ItemTitle>
          <ItemDescription>{client().user?.username}</ItemDescription>
        </ItemContent>
        <ItemActions>
          <MdChevronRight {...iconSize(20)} />
        </ItemActions>
      </Item>
      <Item
        interactive
        onPress={() =>
          openModal({
            type: "edit_email",
            client: client(),
          })
        }
      >
        <ItemMedia>
          <MdMail {...iconSize(22)} />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>
            <Trans>Email</Trans>
          </ItemTitle>
          <ItemDescription>
            <Row>
              {email()}
              <Show when={email().startsWith("•")}>
                <a
                  onClick={(event) => {
                    event.stopPropagation();
                    client().account.fetchEmail().then(setEmail);
                  }}
                >
                  Reveal
                </a>
              </Show>
            </Row>
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <MdChevronRight {...iconSize(20)} />
        </ItemActions>
      </Item>
      <Item
        interactive
        onPress={() =>
          openModal({
            type: "edit_password",
            client: client(),
          })
        }
      >
        <ItemMedia>
          <MdPassword {...iconSize(22)} />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>
            <Trans>Password</Trans>
          </ItemTitle>
          <ItemDescription>•••••••••</ItemDescription>
        </ItemContent>
        <ItemActions>
          <MdChevronRight {...iconSize(20)} />
        </ItemActions>
      </Item>
    </ItemGroup>
  );
}

const nestedGroup = css({
  paddingLeft: "calc(var(--gap-lg) + 32px + var(--gap-md))",
});

const chevron = css({
  transition: "transform 150ms ease",
  "&[data-open=true]": {
    transform: "rotate(180deg)",
  },
});

/**
 * Reusable collapsible Item
 */
function CollapseItem(props: {
  icon: () => JSX.Element;
  title: JSX.Element;
  description: JSX.Element;
  children: JSX.Element;
}) {
  const [open, setOpen] = createSignal(false);
  return (
    <>
      <Item interactive onPress={() => setOpen(!open())}>
        <ItemMedia>{props.icon()}</ItemMedia>
        <ItemContent>
          <ItemTitle>{props.title}</ItemTitle>
          <ItemDescription>{props.description}</ItemDescription>
        </ItemContent>
        <ItemActions>
          <MdExpandMore
            {...iconSize(20)}
            class={chevron}
            data-open={open()}
          />
        </ItemActions>
      </Item>
      <Show when={open()}>
        <div class={nestedGroup}>{props.children}</div>
      </Show>
    </>
  );
}

/**
 * Multi-factor authentication
 */
function MultiFactorAuth() {
  const client = useClient();
  const mfa = createMfaResource();
  const { openModal, mfaFlow, mfaEnableTOTP, showError } = useModals();

  async function showRecoveryCodes() {
    const ticket = await mfaFlow(mfa.data!);
    ticket!.fetchRecoveryCodes().then((codes) =>
      openModal({ type: "mfa_recovery", mfa: mfa.data!, codes }),
    );
  }

  async function generateRecoveryCodes() {
    const ticket = await mfaFlow(mfa.data!);
    ticket!.generateRecoveryCodes().then((codes) =>
      openModal({ type: "mfa_recovery", mfa: mfa.data!, codes }),
    );
  }

  async function setupAuthenticatorApp() {
    const ticket = await mfaFlow(mfa.data!);
    const secret = await ticket!.generateAuthenticatorSecret();

    let success;
    while (!success) {
      try {
        const code = await mfaEnableTOTP(secret, client().user!.username);
        if (code) {
          await mfa.data!.enableAuthenticator(code);
          success = true;
        }
      } catch (err) {
        showError(err);
      }
    }
  }

  function disableAuthenticatorApp() {
    mfaFlow(mfa.data!).then((ticket) => ticket!.disableAuthenticator());
  }

  return (
    <ItemGroup>
      <CollapseItem
        icon={() => <MdVerifiedUser {...iconSize(22)} />}
        title={<Trans>Recovery Codes</Trans>}
        description={
          <Trans>
            Configure a way to get back into your account in case your 2FA is
            lost
          </Trans>
        }
      >
        <Switch
          fallback={
            <Item
              interactive
              disabled={mfa.isLoading}
              onPress={generateRecoveryCodes}
            >
              <ItemContent>
                <ItemTitle>
                  <Trans>Generate Recovery Codes</Trans>
                </ItemTitle>
                <ItemDescription>
                  <Trans>Setup recovery codes</Trans>
                </ItemDescription>
              </ItemContent>
            </Item>
          }
        >
          <Match when={!mfa.isLoading && mfa.data?.recoveryEnabled}>
            <Item interactive onPress={showRecoveryCodes}>
              <ItemContent>
                <ItemTitle>
                  <Trans>View Recovery Codes</Trans>
                </ItemTitle>
                <ItemDescription>
                  <Trans>Get active recovery codes</Trans>
                </ItemDescription>
              </ItemContent>
            </Item>
            <Item interactive onPress={generateRecoveryCodes}>
              <ItemContent>
                <ItemTitle>
                  <Trans>Reset Recovery Codes</Trans>
                </ItemTitle>
                <ItemDescription>
                  <Trans>Get a new set of recovery codes</Trans>
                </ItemDescription>
              </ItemContent>
            </Item>
          </Match>
        </Switch>
      </CollapseItem>
      <CollapseItem
        icon={() => <MdLock {...iconSize(22)} />}
        title={<Trans>Authenticator App</Trans>}
        description={<Trans>Configure one-time password authentication</Trans>}
      >
        <Switch
          fallback={
            <Item
              interactive
              disabled={mfa.isLoading}
              onPress={setupAuthenticatorApp}
            >
              <ItemContent>
                <ItemTitle>
                  <Trans>Enable Authenticator</Trans>
                </ItemTitle>
                <ItemDescription>
                  <Trans>Setup one-time password authenticator</Trans>
                </ItemDescription>
              </ItemContent>
            </Item>
          }
        >
          <Match when={!mfa.isLoading && mfa.data?.authenticatorEnabled}>
            <Item interactive onPress={disableAuthenticatorApp}>
              <ItemContent>
                <ItemTitle>
                  <Trans>Remove Authenticator</Trans>
                </ItemTitle>
                <ItemDescription>
                  <Trans>Disable one-time password authenticator</Trans>
                </ItemDescription>
              </ItemContent>
            </Item>
          </Match>
        </Switch>
      </CollapseItem>
    </ItemGroup>
  );
}

const dangerIcon = css({
  "& svg": {
    fill: "var(--md-sys-color-error) !important",
  },
});

/**
 * Manage account
 */
function ManageAccount() {
  const client = useClient();
  const mfa = createMfaResource();
  const { mfaFlow } = useModals();
  const { logout } = useClientLifecycle();

  const stillOwnServers = createMemo(
    () =>
      client().servers.filter((server) => server.owner?.self || false).length >
      0,
  );

  function disableAccount() {
    mfaFlow(mfa.data!).then((ticket) =>
      ticket!.disableAccount().then(() => logout()),
    );
  }

  function deleteAccount() {
    mfaFlow(mfa.data!).then((ticket) =>
      ticket!.deleteAccount().then(() => logout()),
    );
  }

  return (
    <ItemGroup>
      <Item
        interactive
        disabled={mfa.isLoading}
        onPress={disableAccount}
      >
        <ItemMedia class={dangerIcon}>
          <MdBlock {...iconSize(22)} />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>
            <Trans>Disable Account</Trans>
          </ItemTitle>
          <ItemDescription>
            <Trans>
              You won't be able to access your account unless you contact
              support - however, your data will not be deleted.
            </Trans>
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <MdChevronRight {...iconSize(20)} />
        </ItemActions>
      </Item>
      <Item
        interactive
        disabled={mfa.isLoading || stillOwnServers()}
        onPress={deleteAccount}
      >
        <ItemMedia class={dangerIcon}>
          <MdDelete {...iconSize(22)} />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>
            <Switch fallback={<Trans>Delete Account</Trans>}>
              <Match when={stillOwnServers()}>
                <Trans>
                  Cannot delete account until servers are deleted or transferred
                </Trans>
              </Match>
            </Switch>
          </ItemTitle>
          <ItemDescription>
            <Trans>
              Your account and all of your data (including your messages and
              friends list) will be queued for deletion. A confirmation email
              will be sent - you can cancel this within 7 days by contacting
              support.
            </Trans>
          </ItemDescription>
        </ItemContent>
        <Show when={!stillOwnServers()}>
          <ItemActions>
            <MdChevronRight {...iconSize(20)} />
          </ItemActions>
        </Show>
      </Item>
    </ItemGroup>
  );
}
