import { Trans, useLingui } from "@lingui-solid/solid/macro";

import { useState } from "@revolt/state";
import {
  Checkbox,
  Column,
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
  Select,
  Text,
} from "@revolt/ui";

/**
 * Voice processing options
 */
export function VoiceProcessingOptions() {
  const { voice } = useState();
  const { t } = useLingui();

  return (
    <Column>
      <Text class="title">
        <Trans>Voice Processing</Trans>
      </Text>
      <ItemGroup>
        <Item>
          <ItemContent>
            <ItemTitle>
              <Trans>Noise Suppression</Trans>
            </ItemTitle>
            <ItemDescription>
              <Trans>Powered by RNNoise when Enhanced is selected</Trans>
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <Select
              value={voice.noiseSupression}
              onChange={(v) => (voice.noiseSupression = v as never)}
              options={[
                { value: "disabled", label: t`Disabled` },
                { value: "browser", label: t`Browser` },
                { value: "enhanced", label: t`Enhanced` },
              ]}
            />
          </ItemActions>
        </Item>
        <Item
          interactive
          onPress={() => (voice.echoCancellation = !voice.echoCancellation)}
        >
          <ItemContent>
            <ItemTitle>
              <Trans>Browser Echo Cancellation</Trans>
            </ItemTitle>
          </ItemContent>
          <ItemActions>
            <Checkbox checked={voice.echoCancellation} />
          </ItemActions>
        </Item>
        <Item
          interactive
          onPress={() => (voice.autoGainControl = !voice.autoGainControl)}
        >
          <ItemContent>
            <ItemTitle>
              <Trans>Automatic Gain Control</Trans>
            </ItemTitle>
          </ItemContent>
          <ItemActions>
            <Checkbox checked={voice.autoGainControl} />
          </ItemActions>
        </Item>
      </ItemGroup>
    </Column>
  );
}
