import {
  Hct,
  SchemeContent,
  SchemeExpressive,
  SchemeFidelity,
  SchemeFruitSalad,
  SchemeMonochrome,
  SchemeNeutral,
  SchemeRainbow,
  SchemeTonalSpot,
  SchemeVibrant,
  argbFromHex,
  hexFromArgb,
} from "@material/material-color-utilities";

import { SelectedTheme, TypeTheme } from "@revolt/state/stores/Theme";

/**
 * Generate the Material variables from the given properties
 *
 * Currently only generates color keys
 */
export function createMaterialColourVariables<P extends string>(
  theme: SelectedTheme,
  prefix: P,
): addPrefixToObject<MaterialColours, P> {
  switch (theme.preset) {
    case "you": {
      const colours =
        theme.palette === "material-you"
          ? generateMaterialYouScheme(
              theme.accent,
              theme.darkMode,
              theme.contrast,
              theme.variant,
            )
          : theme.darkMode
            ? CAMPFIRE_DARK
            : CAMPFIRE_LIGHT;
      return Object.entries(colours).reduce(
        (d, [key, value]) => ({
          ...d,
          [`${prefix}${key}`]: value,
        }),
        {} as addPrefixToObject<MaterialColours, P>,
      );
    }
    default:
      return {} as never;
  }
}

/**
 * Luma dark palette — cool zinc neutrals with warm amber primary.
 * Mapped from shadcn Luma oklch values onto MD3 token slots.
 */
const CAMPFIRE_DARK: MaterialColours = {
  primary: "#9C4F22",
  "on-primary": "#FBF7E8",
  "primary-container": "#C26420",
  "on-primary-container": "#FBF7E8",

  secondary: "#27272A",
  "on-secondary": "#FAFAFA",
  "secondary-container": "#27272A",
  "on-secondary-container": "#FAFAFA",

  tertiary: "#C26420",
  "on-tertiary": "#FBF7E8",
  "tertiary-container": "#27272A",
  "on-tertiary-container": "#FAFAFA",

  error: "#EE5F4F",
  "on-error": "#FAFAFA",
  "error-container": "#5C2418",
  "on-error-container": "#FBE9E5",

  "primary-fixed": "#C26420",
  "primary-fixed-dim": "#9C4F22",
  "on-primary-fixed": "#FBF7E8",
  "on-primary-fixed-variant": "#FBF7E8",
  "secondary-fixed": "#27272A",
  "secondary-fixed-dim": "#3F3F46",
  "on-secondary-fixed": "#FAFAFA",
  "on-secondary-fixed-variant": "#FAFAFA",
  "tertiary-fixed": "#27272A",
  "tertiary-fixed-dim": "#C26420",
  "on-tertiary-fixed": "#FAFAFA",
  "on-tertiary-fixed-variant": "#FAFAFA",

  "surface-dim": "#09090B",
  surface: "#18181B",
  "surface-bright": "#27272A",

  "surface-container-lowest": "#09090B",
  "surface-container-low": "#18181B",
  "surface-container": "#18181B",
  "surface-container-high": "#27272A",
  "surface-container-highest": "#3F3F46",

  "on-surface": "#FAFAFA",
  "on-surface-variant": "#A1A1AA",
  outline: "#3F3F46",
  "outline-variant": "#27272A",

  "inverse-surface": "#FAFAFA",
  "inverse-on-surface": "#18181B",
  "inverse-primary": "#9C4F22",

  scrim: "#000000",
  shadow: "#000000",
};

/**
 * Luma light palette — white surfaces, zinc dividers, amber primary.
 */
const CAMPFIRE_LIGHT: MaterialColours = {
  primary: "#C26420",
  "on-primary": "#FBF7E8",
  "primary-container": "#E5BA72",
  "on-primary-container": "#18181B",

  secondary: "#F4F4F5",
  "on-secondary": "#18181B",
  "secondary-container": "#F4F4F5",
  "on-secondary-container": "#18181B",

  tertiary: "#C26420",
  "on-tertiary": "#FBF7E8",
  "tertiary-container": "#F4F4F5",
  "on-tertiary-container": "#18181B",

  error: "#DC2626",
  "on-error": "#FAFAFA",
  "error-container": "#FCE8E8",
  "on-error-container": "#5C0F0F",

  "primary-fixed": "#E5BA72",
  "primary-fixed-dim": "#C26420",
  "on-primary-fixed": "#18181B",
  "on-primary-fixed-variant": "#18181B",
  "secondary-fixed": "#F4F4F5",
  "secondary-fixed-dim": "#E4E4E7",
  "on-secondary-fixed": "#18181B",
  "on-secondary-fixed-variant": "#18181B",
  "tertiary-fixed": "#F4F4F5",
  "tertiary-fixed-dim": "#C26420",
  "on-tertiary-fixed": "#18181B",
  "on-tertiary-fixed-variant": "#18181B",

  "surface-dim": "#FAFAFA",
  surface: "#FFFFFF",
  "surface-bright": "#FFFFFF",

  "surface-container-lowest": "#FFFFFF",
  "surface-container-low": "#FAFAFA",
  "surface-container": "#F4F4F5",
  "surface-container-high": "#E4E4E7",
  "surface-container-highest": "#D4D4D8",

  "on-surface": "#18181B",
  "on-surface-variant": "#71717A",
  outline: "#E4E4E7",
  "outline-variant": "#F4F4F5",

  "inverse-surface": "#18181B",
  "inverse-on-surface": "#FAFAFA",
  "inverse-primary": "#C26420",

  scrim: "#000000",
  shadow: "#000000",
};

/**
 * Create R,G,B triplets for MDUI variables
 */
export function createMduiColourTriplets<P extends string>(
  theme: SelectedTheme,
  prefix: P,
): addPrefixToObject<MaterialColours, P> {
  const variables = createMaterialColourVariables(theme, prefix);

  for (const key in variables) {
    const [_, r, g, b] = /#([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})/i.exec(
      variables[key as keyof typeof variables] as string,
    )!;

    variables[key as keyof typeof variables] =
      `${parseInt(r, 16)}, ${parseInt(g, 16)}, ${parseInt(b, 16)}` as never;
  }

  return variables;
}

type addPrefixToObject<T, P extends string> = {
  [K in keyof T as K extends string ? `${P}${K}` : never]: T[K];
};

type _addSuffixToObject<T, S extends string> = {
  [K in keyof T as K extends string ? `${K}${S}` : never]: T[K];
};

type MaterialColours = {
  primary: string;
  "on-primary": string;
  "primary-container": string;
  "on-primary-container": string;
  secondary: string;
  "on-secondary": string;
  "secondary-container": string;
  "on-secondary-container": string;
  tertiary: string;
  "on-tertiary": string;
  "tertiary-container": string;
  "on-tertiary-container": string;
  error: string;
  "on-error": string;
  "error-container": string;
  "on-error-container": string;

  "primary-fixed": string;
  "primary-fixed-dim": string;
  "on-primary-fixed": string;
  "on-primary-fixed-variant": string;
  "secondary-fixed": string;
  "secondary-fixed-dim": string;
  "on-secondary-fixed": string;
  "on-secondary-fixed-variant": string;
  "tertiary-fixed": string;
  "tertiary-fixed-dim": string;
  "on-tertiary-fixed": string;
  "on-tertiary-fixed-variant": string;

  "surface-dim": string;
  surface: string;
  "surface-bright": string;

  "surface-container-lowest": string;
  "surface-container-low": string;
  "surface-container": string;
  "surface-container-high": string;
  "surface-container-highest": string;

  "on-surface": string;
  "on-surface-variant": string;
  outline: string;
  "outline-variant": string;

  "inverse-surface": string;
  "inverse-on-surface": string;
  "inverse-primary": string;

  scrim: string;
  shadow: string;
};

/**
 * Generate a Material You colour scheme
 * @param accent Accent colour in hex format
 * @param darkMode Dark mode
 * @param constrat Constrast level
 * @returns Material colours
 */
function generateMaterialYouScheme(
  accent: string,
  darkMode: boolean,
  contrast: number,
  variant: TypeTheme["m3Variant"],
): MaterialColours {
  const hct = Hct.fromInt(argbFromHex(accent));

  let scheme;
  switch (variant) {
    case "content":
      scheme = new SchemeContent(hct, darkMode, contrast);
      break;
    case "expressive":
      scheme = new SchemeExpressive(hct, darkMode, contrast);
      break;
    case "fidelity":
      scheme = new SchemeFidelity(hct, darkMode, contrast);
      break;
    case "fruit_salad":
      scheme = new SchemeFruitSalad(hct, darkMode, contrast);
      break;
    case "monochrome":
      scheme = new SchemeMonochrome(hct, darkMode, contrast);
      break;
    case "neutral":
      scheme = new SchemeNeutral(hct, darkMode, contrast);
      break;
    case "rainbow":
      scheme = new SchemeRainbow(hct, darkMode, contrast);
      break;
    case "vibrant":
      scheme = new SchemeVibrant(hct, darkMode, contrast);
      break;
    case "tonal_spot":
    default:
      scheme = new SchemeTonalSpot(hct, darkMode, contrast);
      break;
  }

  return {
    primary: hexFromArgb(scheme.primary),
    "on-primary": hexFromArgb(scheme.onPrimary),
    "primary-container": hexFromArgb(scheme.primaryContainer),
    "on-primary-container": hexFromArgb(scheme.onPrimaryContainer),
    secondary: hexFromArgb(scheme.secondary),
    "on-secondary": hexFromArgb(scheme.onSecondary),
    "secondary-container": hexFromArgb(scheme.secondaryContainer),
    "on-secondary-container": hexFromArgb(scheme.onSecondaryContainer),
    tertiary: hexFromArgb(scheme.tertiary),
    "on-tertiary": hexFromArgb(scheme.onTertiary),
    "tertiary-container": hexFromArgb(scheme.tertiaryContainer),
    "on-tertiary-container": hexFromArgb(scheme.onTertiaryContainer),
    error: hexFromArgb(scheme.error),
    "on-error": hexFromArgb(scheme.onError),
    "error-container": hexFromArgb(scheme.errorContainer),
    "on-error-container": hexFromArgb(scheme.onErrorContainer),

    "primary-fixed": hexFromArgb(scheme.primaryFixed),
    "primary-fixed-dim": hexFromArgb(scheme.primaryFixedDim),
    "on-primary-fixed": hexFromArgb(scheme.onPrimaryFixed),
    "on-primary-fixed-variant": hexFromArgb(scheme.onPrimaryFixedVariant),
    "secondary-fixed": hexFromArgb(scheme.secondaryFixed),
    "secondary-fixed-dim": hexFromArgb(scheme.onSecondaryFixed),
    "on-secondary-fixed": hexFromArgb(scheme.onSecondaryFixed),
    "on-secondary-fixed-variant": hexFromArgb(scheme.onSecondaryFixedVariant),
    "tertiary-fixed": hexFromArgb(scheme.tertiaryFixed),
    "tertiary-fixed-dim": hexFromArgb(scheme.tertiaryFixedDim),
    "on-tertiary-fixed": hexFromArgb(scheme.onTertiaryFixed),
    "on-tertiary-fixed-variant": hexFromArgb(scheme.onTertiaryFixedVariant),

    "surface-dim": hexFromArgb(scheme.surfaceDim),
    surface: hexFromArgb(scheme.surface),
    "surface-bright": hexFromArgb(scheme.surfaceBright),

    "surface-container-lowest": hexFromArgb(scheme.surfaceContainerLowest),
    "surface-container-low": hexFromArgb(scheme.surfaceContainerLow),
    "surface-container": hexFromArgb(scheme.surfaceContainer),
    "surface-container-high": hexFromArgb(scheme.surfaceContainerHigh),
    "surface-container-highest": hexFromArgb(scheme.surfaceContainerHighest),

    "on-surface": hexFromArgb(scheme.onSurface),
    "on-surface-variant": hexFromArgb(scheme.onSurfaceVariant),
    outline: hexFromArgb(scheme.outline),
    "outline-variant": hexFromArgb(scheme.outlineVariant),

    "inverse-surface": hexFromArgb(scheme.inverseSurface),
    "inverse-on-surface": hexFromArgb(scheme.inverseOnSurface),
    "inverse-primary": hexFromArgb(scheme.inversePrimary),

    scrim: hexFromArgb(scheme.scrim),
    shadow: hexFromArgb(scheme.shadow),
  };
}
