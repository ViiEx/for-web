import {
  Match,
  Show,
  Suspense,
  Switch,
  createContext,
  createMemo,
  createSignal,
  useContext,
} from "solid-js";

import { Trans } from "@lingui-solid/solid/macro";
import { VirtualContainer } from "@minht11/solid-virtual-container";
import { useQuery } from "@tanstack/solid-query";
import { styled } from "styled-system/jsx";

import { useClient } from "@revolt/client";
import env from "@revolt/common/lib/env";
import {
  CircularProgress,
  TextField,
  typography,
} from "@revolt/ui/components/design";

import { CompositionMediaPickerContext } from "./CompositionMediaPicker";

type GifCategory = { title: string; image: string };

type GifResult = {
  url: string;
  media_formats: Record<"webm" | "tinywebm", { url: string }>;
};

type GiphyImage = { url: string; mp4?: string; webp?: string };
type GiphyGif = {
  url: string;
  images: {
    original: GiphyImage;
    original_mp4?: GiphyImage;
    fixed_width: GiphyImage;
    fixed_width_small?: GiphyImage;
    fixed_height_small?: GiphyImage;
    preview?: GiphyImage;
  };
};

const useGiphy = () => !!env.GIPHY_API_KEY;

/**
 * Normalize a Giphy gif into our internal GifResult shape.
 * Per Giphy best practices: MP4 for previews, full-quality rendition for the sent message.
 * URLs are preserved verbatim — no query-param stripping.
 */
function fromGiphy(g: GiphyGif): GifResult {
  const previewMp4 =
    g.images.fixed_height_small?.mp4 ??
    g.images.fixed_width_small?.mp4 ??
    g.images.fixed_width.mp4 ??
    g.images.preview?.mp4;
  const previewFallback =
    g.images.fixed_height_small?.url ??
    g.images.fixed_width_small?.url ??
    g.images.fixed_width.url;
  const sendUrl = g.images.original.url;
  return {
    url: sendUrl,
    media_formats: {
      webm: { url: sendUrl },
      tinywebm: { url: previewMp4 ?? previewFallback },
    },
  };
}

async function giphyFetch(path: string, params: Record<string, string>) {
  const qs = new URLSearchParams({
    api_key: env.GIPHY_API_KEY,
    ...params,
  });
  const resp = await fetch(`https://api.giphy.com/v1/gifs/${path}?${qs}`);
  return resp.json();
}

const FilterContext = createContext<(value: string) => void>();

export function GifPicker() {
  const [filter, setFilter] = createSignal("");

  const fliterLowercase = () => filter().toLowerCase();

  return (
    <Stack>
      <TextField
        autoFocus
        variant="filled"
        placeholder="Search for GIFs..."
        value={filter()}
        onMouseDown={(e) => {
          e.stopPropagation();
          e.stopImmediatePropagation();
        }}
        onInput={(e) => setFilter(e.currentTarget.value)}
      />
      <Suspense fallback={<CircularProgress />}>
        <Switch
          fallback={
            <FilterContext.Provider value={setFilter}>
              <Categories />
            </FilterContext.Provider>
          }
        >
          <Match when={fliterLowercase()}>
            <GifSearch query={fliterLowercase()} />
          </Match>
        </Switch>
      </Suspense>
      <Show when={useGiphy()}>
        <Attribution>Powered by GIPHY</Attribution>
      </Show>
    </Stack>
  );
}

const Attribution = styled("div", {
  base: {
    ...typography.raw({ class: "label", size: "small" }),
    padding: "var(--gap-sm) var(--gap-md)",
    color: "var(--md-sys-color-on-surface-variant)",
    textAlign: "center",
    flexShrink: 0,
  },
});

const Stack = styled("div", {
  base: {
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
  },
});

type CategoryItem =
  | {
      /**
       * Category entry
       */
      t: 0;
      category: GifCategory;
    }
  | {
      /**
       * Trending entry
       */
      t: 1;
      gif: GifResult | null;
    };

function Categories() {
  let targetElement!: HTMLDivElement;

  const client = useClient();

  const trendingCategories = useQuery<GifCategory[]>(() => ({
    queryKey: ["trendingGifCategories", useGiphy()],
    queryFn: async () => {
      if (useGiphy()) {
        const resp = await giphyFetch("categories", {});
        return (resp.data ?? []).map(
          (c: { name: string; gif: GiphyGif }): GifCategory => ({
            title: c.name,
            image:
              c.gif.images.fixed_width.webp ?? c.gif.images.fixed_width.url,
          }),
        );
      }

      const [authHeader, authHeaderValue] = client()!.authenticationHeader;
      return fetch(`${env.DEFAULT_GIFBOX_URL}/categories?locale=en_US`, {
        headers: {
          [authHeader]: authHeaderValue,
        },
      }).then((r) => r.json());
    },
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    staleTime: useGiphy() ? 0 : Infinity,
    gcTime: useGiphy() ? 60_000 : undefined,
  }));

  const trendingGif = useQuery<GifResult | null>(() => ({
    queryKey: ["trendingGif1", useGiphy()],
    queryFn: async () => {
      if (useGiphy()) {
        const resp = await giphyFetch("trending", { limit: "1" });
        const first: GiphyGif | undefined = resp.data?.[0];
        return first ? fromGiphy(first) : null;
      }

      const [authHeader, authHeaderValue] = client()!.authenticationHeader;
      return fetch(`${env.DEFAULT_GIFBOX_URL}/trending?locale=en_US&limit=1`, {
        headers: {
          [authHeader]: authHeaderValue,
        },
      })
        .then((r) => r.json())
        .then((resp) => resp.results[0]);
    },
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    initialData: null,
    staleTime: useGiphy() ? 0 : Infinity,
    gcTime: useGiphy() ? 60_000 : undefined,
  }));

  const items = createMemo(() => {
    return [
      {
        t: 1,
        gif: trendingGif.data,
      },
      ...(trendingCategories.data?.map((category) => ({ t: 0, category })) ??
        []),
    ] as CategoryItem[];
  });

  return (
    <div ref={targetElement} use:invisibleScrollable>
      <VirtualContainer
        items={items()}
        scrollTarget={targetElement}
        itemSize={{ height: 120, width: 200 }}
        crossAxisCount={(measurements) =>
          Math.floor(measurements.container.cross / measurements.itemSize.cross)
        }
      >
        {CategoryItem}
      </VirtualContainer>
    </div>
  );
}

const CategoryItem = (props: {
  style: unknown;
  tabIndex: number;
  item: CategoryItem;
}) => {
  const setFilter = useContext(FilterContext);

  return (
    <Category
      style={{
        ...(props.style as object),
        "background-image": `linear-gradient(to right, #0006, #0006), url("${props.item.t === 0 ? props.item.category.image : props.item.gif?.url}")`,
      }}
      tabIndex={props.tabIndex}
      role="listitem"
      onClick={() =>
        setFilter!(props.item.t === 0 ? props.item.category.title : "trending")
      }
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
      }}
    >
      <Switch fallback={<Trans>Trending GIFs</Trans>}>
        <Match when={props.item.t === 0}>
          {(props.item as CategoryItem & { t: 0 }).category.title}
        </Match>
      </Switch>
    </Category>
  );
};

const Category = styled("div", {
  base: {
    ...typography.raw({ class: "title", size: "small" }),

    width: "200px",
    height: "120px",
    backgroundSize: "cover",
    backgroundPosition: "center",

    color: "white",
    display: "flex",
    padding: "var(--gap-md)",

    alignItems: "end",
    justifyContent: "end",

    cursor: "pointer",
  },
});

function GifSearch(props: { query: string }) {
  let targetElement!: HTMLDivElement;

  const client = useClient();

  const search = useQuery<GifResult[]>(() => ({
    queryKey: ["gifs", props.query, useGiphy()],
    queryFn: async () => {
      if (useGiphy()) {
        const resp = await giphyFetch(
          props.query === "trending" ? "trending" : "search",
          props.query === "trending"
            ? { limit: "50" }
            : { q: props.query, limit: "50" },
        );
        return (resp.data ?? []).map(fromGiphy);
      }

      const [authHeader, authHeaderValue] = client()!.authenticationHeader;
      return fetch(
        `${env.DEFAULT_GIFBOX_URL}/` +
          (props.query === "trending"
            ? `trending?locale=en_US`
            : `search?locale=en_US&query=${encodeURIComponent(props.query)}`),
        {
          headers: {
            [authHeader]: authHeaderValue,
          },
        },
      )
        .then((r) => r.json())
        .then((resp) => resp.results);
    },
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    staleTime: useGiphy() ? 0 : Infinity,
    gcTime: useGiphy() ? 60_000 : undefined,
  }));

  return (
    <div ref={targetElement} use:invisibleScrollable>
      <VirtualContainer
        items={search.data as never /* resource */}
        scrollTarget={targetElement}
        itemSize={{ height: 120, width: 200 }}
        crossAxisCount={(measurements) =>
          Math.floor(measurements.container.cross / measurements.itemSize.cross)
        }
      >
        {GifItem}
      </VirtualContainer>
    </div>
  );
}

const GifItem = (props: {
  style: unknown;
  tabIndex: number;
  item: GifResult;
}) => {
  const { onMessage } = useContext(CompositionMediaPickerContext);

  const src = () => props.item.media_formats.tinywebm.url;
  const isVideo = () => /\.(webm|mp4)(\?|$)/i.test(src());

  return (
    <Switch>
      <Match when={isVideo()}>
        <GifVideo
          loop
          autoplay
          muted
          preload="auto"
          role="listitem"
          style={props.style as string}
          tabIndex={props.tabIndex}
          src={src()}
          onClick={() => onMessage(`![gif](${props.item.url})`)}
        />
      </Match>
      <Match when={!isVideo()}>
        <GifImage
          role="listitem"
          style={props.style as string}
          tabIndex={props.tabIndex}
          src={src()}
          onClick={() => onMessage(`![gif](${props.item.url})`)}
        />
      </Match>
    </Switch>
  );
};

const GifVideo = styled("video", {
  base: {
    width: "200px",
    height: "120px",
    cursor: "pointer",
    objectFit: "cover",
  },
});

const GifImage = styled("img", {
  base: {
    width: "200px",
    height: "120px",
    cursor: "pointer",
    objectFit: "cover",
  },
});
