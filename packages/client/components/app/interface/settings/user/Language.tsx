import { Trans, useLingui } from "@lingui-solid/solid/macro";

import { Language, Languages, browserPreferredLanguage } from "@revolt/i18n";
import { timeLocale } from "@revolt/i18n/dayjs";
import { UnicodeEmoji } from "@revolt/markdown/emoji";
import { useState } from "@revolt/state";
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
  Select,
  Time,
  iconSize,
} from "@revolt/ui";

import MdErrorFill from "@material-design-icons/svg/filled/error.svg?component-solid";
import MdVerifiedFill from "@material-design-icons/svg/filled/verified.svg?component-solid";
import MdCalendarMonth from "@material-design-icons/svg/outlined/calendar_month.svg?component-solid";
import MdLanguage from "@material-design-icons/svg/outlined/language.svg?component-solid";
import MdOpenInNew from "@material-design-icons/svg/outlined/open_in_new.svg?component-solid";
import MdSchedule from "@material-design-icons/svg/outlined/schedule.svg?component-solid";
import MdTranslate from "@material-design-icons/svg/outlined/translate.svg?component-solid";

/**
 * Language
 */
export function LanguageSettings() {
  return (
    <Column gap="lg">
      <ItemGroup>
        <PickLanguage />
      </ItemGroup>
      <ItemGroup>
        <PickDateFormat />
        <PickTimeFormat />
      </ItemGroup>
      <ItemGroup>
        <ContributeLanguageLink />
      </ItemGroup>
    </Column>
  );
}

const RE_LANG = /_/g;

/**
 * Pick user's preferred language
 */
function PickLanguage() {
  const { locale } = useState();
  const { i18n } = useLingui();

  const langIds = Object.keys(Languages) as Language[];

  const prefLang = browserPreferredLanguage();
  if (prefLang) {
    const prefIdx = langIds.findIndex(
      (id) => id.replace(RE_LANG, "-") === prefLang,
    );
    if (prefIdx !== -1) langIds.unshift(langIds.splice(prefIdx, 1)[0]);
  }

  const options = langIds.map((id) => {
    const lang = Languages[id];
    return {
      value: id,
      label: () => (
        <Row align>
          <UnicodeEmoji emoji={lang.emoji} />
          {lang.display}
          {lang.verified && (
            <MdVerifiedFill
              {...iconSize(16)}
              fill="var(--md-sys-color-on-surface)"
            />
          )}
          {lang.incomplete && (
            <MdErrorFill
              {...iconSize(16)}
              fill="var(--md-sys-color-on-surface)"
            />
          )}
        </Row>
      ),
    };
  });

  return (
    <Item>
      <ItemMedia>
        <MdLanguage {...iconSize(22)} />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>
          <Trans>Language</Trans>
        </ItemTitle>
      </ItemContent>
      <ItemActions>
        <Select
          value={i18n().locale as Language}
          options={options}
          onChange={(id) => locale.switch(id as Language)}
        />
      </ItemActions>
    </Item>
  );
}

/**
 * Pick user's preferred date format
 */
function PickDateFormat() {
  const { locale } = useState();
  const LastWeek = new Date();
  LastWeek.setDate(LastWeek.getDate() - 7);

  return (
    <Item>
      <ItemMedia>
        <MdCalendarMonth {...iconSize(22)} />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>
          <Trans>Date format</Trans>
        </ItemTitle>
        <ItemDescription>
          <Time format="date" value={LastWeek} />
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <Select
          value={timeLocale()[1].formats.L}
          onChange={(f) => locale.setDateFormat(f)}
          options={[
            { value: "DD/MM/YYYY", label: () => <Trans>Traditional (DD/MM/YYYY)</Trans> },
            { value: "MM/DD/YYYY", label: () => <Trans>American (MM/DD/YYYY)</Trans> },
            { value: "YYYY-MM-DD", label: () => <Trans>ISO Standard (YYYY-MM-DD)</Trans> },
          ]}
        />
      </ItemActions>
    </Item>
  );
}

/**
 * Pick user's preferred time format
 */
function PickTimeFormat() {
  const { locale } = useState();

  return (
    <Item>
      <ItemMedia>
        <MdSchedule {...iconSize(22)} />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>
          <Trans>Time format</Trans>
        </ItemTitle>
        <ItemDescription>
          <Time format={timeLocale()[1].formats.LT === "HH:mm" ? "time24" : "time12"} value={new Date()} />
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <Select
          value={timeLocale()[1].formats.LT}
          onChange={(f) => locale.setTimeFormat(f)}
          options={[
            { value: "HH:mm", label: () => <Trans>24 hours</Trans> },
            { value: "h:mm A", label: () => <Trans>12 hours</Trans> },
          ]}
        />
      </ItemActions>
    </Item>
  );
}

/**
 * Language contribution link
 */
function ContributeLanguageLink() {
  return (
    <a
      href="https://weblate.insrt.uk/engage/revolt/"
      target="_blank"
      style={{ "text-decoration": "none", color: "inherit" }}
    >
      <Item interactive>
        <ItemMedia>
          <MdTranslate {...iconSize(22)} />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>
            <Trans>Contribute a language</Trans>
          </ItemTitle>
          <ItemDescription>
            <Trans>Help contribute to an existing or new language</Trans>
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <MdOpenInNew {...iconSize(20)} />
        </ItemActions>
      </Item>
    </a>
  );
}
