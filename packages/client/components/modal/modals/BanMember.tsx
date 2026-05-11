import { createFormControl, createFormGroup } from "solid-forms";

import { Trans, useLingui } from "@lingui-solid/solid/macro";

import {
  Avatar,
  Column,
  Dialog,
  DialogProps,
  Form2,
  Select,
  Text,
} from "@revolt/ui";

import { useModals } from "..";
import { Modals } from "../types";

/**
 * Ban a server member with reason
 */
export function BanMemberModal(
  props: DialogProps & Modals & { type: "ban_member" },
) {
  const { t } = useLingui();
  const { showError } = useModals();

  const group = createFormGroup({
    reason: createFormControl(""),
    deleteMessageSeconds: createFormControl("0"),
  });
  async function onSubmit() {
    try {
      await props.member.ban({
        reason: group.controls.reason.value,
        delete_message_seconds: Number(
          group.controls.deleteMessageSeconds.value,
        ),
      });

      props.onClose();
    } catch (error) {
      showError(error);
    }
  }

  const submit = Form2.useSubmitHandler(group, onSubmit);

  return (
    <Dialog
      show={props.show}
      onClose={props.onClose}
      title={<Trans>Ban Member</Trans>}
      actions={[
        { text: <Trans>Cancel</Trans> },
        {
          text: <Trans>Ban</Trans>,
          onClick: () => {
            onSubmit();
            return false;
          },
          isDisabled: !Form2.canSubmit(group),
        },
      ]}
      isDisabled={group.isPending}
    >
      <form onSubmit={submit}>
        <Column align>
          <Avatar src={props.member.user?.animatedAvatarURL} size={64} />
          <Text>
            <Trans>You are about to ban {props.member.user?.username}</Trans>
          </Text>
          <Form2.TextField
            maxlength={1024}
            counter
            name="reason"
            control={group.controls.reason}
            label={t`Reason`}
            placeholder={t`User broke a certain rule…`}
          />
          <Select
            label={t`Delete Message History`}
            value={group.controls.deleteMessageSeconds.value}
            onChange={(value) =>
              group.controls.deleteMessageSeconds.setValue(value)
            }
            options={[
              { value: "0", label: <Trans>Don't delete messages</Trans> },
              { value: "3600", label: <Trans>1 hour</Trans> },
              { value: "21600", label: <Trans>6 hours</Trans> },
              { value: "86400", label: <Trans>1 day</Trans> },
              { value: "259200", label: <Trans>3 days</Trans> },
              { value: "604800", label: <Trans>7 days</Trans> },
            ]}
          />
        </Column>
      </form>
    </Dialog>
  );
}
