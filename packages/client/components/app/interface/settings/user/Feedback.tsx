import { Trans } from "@lingui-solid/solid/macro";

import { CategoryButton, Column } from "@revolt/ui";

/**
 * Feedback
 */
export function Feedback() {
  return (
    <Column gap="lg">
      <CategoryButton.Group>
        <CategoryButton onClick={() => void 0}>
          <Trans>Feedback channels coming soon.</Trans>
        </CategoryButton>
      </CategoryButton.Group>
    </Column>
  );
}
