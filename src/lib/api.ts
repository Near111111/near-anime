import axios from "axios";

// Flask AnimeKAI API running on port 5000
const FLASK_BASE = process.env.NEXT_PUBLIC_FLASK_URL || "http://localhost:5000";

const flask = axios.create({
  baseURL: FLASK_BASE,
  timeout: 20000,
});

// AnimeKAI backend returns numeric keys for server types
// "1" = sub, "2" = dub, "3" = raw
const SERVER_TYPE_MAP: Record<string, string> = {
  "1": "sub",
  "2": "dub",
  "3": "raw",
};

// ─── Type helpers ─────────────────────────────────────────────────────────────

interface KaiAnime {
  slug: string;
  title: string;
  japanese_title?: string;
  poster: string;
  type?: string;
  year?: string;
  rating?: string;
  sub_episodes?: string;
  dub_episodes?: string;
  total_episodes?: string;
}

interface KaiBannerItem {
  title: string;
  japanese_title?: string;
  description?: string;
  poster: string;
  url: string;
  sub_episodes?: string;
  dub_episodes?: string;
  type?: string;
  rating?: string;
}

interface KaiTrendingItem {
  rank?: string;
  title: string;
  japanese_title?: string;
  poster: string;
  url: string;
  sub_episodes?: string;
  dub_episodes?: string;
  type?: string;
}

interface KaiEpisode {
  number: string;
  slug: string;
  title: string;
  japanese_title?: string;
  token: string;
  has_sub: boolean;
  has_dub: boolean;
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

function slugFromUrl(url: string): string {
  // https://anikai.to/watch/bleach-re3j → bleach-re3j
  return url.replace(/.*\/watch\//, "").replace(/\/$/, "");
}

function mapKaiAnime(item: KaiAnime) {
  return {
    id: item.slug,
    title: item.title,
    japanese_title: item.japanese_title || "",
    poster: item.poster,
    tvInfo: {
      showType: item.type || "",
      rating: item.rating || "",
      sub: item.sub_episodes ? parseInt(item.sub_episodes) : undefined,
      dub: item.dub_episodes ? parseInt(item.dub_episodes) : undefined,
      eps: item.total_episodes ? parseInt(item.total_episodes) : undefined,
    },
  };
}

function mapBannerToSpotlight(item: KaiBannerItem, index: number) {
  return {
    id: slugFromUrl(item.url),
    rank: index + 1,
    title: item.title,
    japanese_title: item.japanese_title || "",
    poster: item.poster,
    description: item.description || "",
    tvInfo: {
      showType: item.type || "",
      rating: item.rating || "",
      sub: item.sub_episodes ? parseInt(item.sub_episodes) : undefined,
      dub: item.dub_episodes ? parseInt(item.dub_episodes) : undefined,
    },
  };
}

function mapTrending(item: KaiTrendingItem) {
  return {
    id: slugFromUrl(item.url),
    title: item.title,
    japanese_title: item.japanese_title || "",
    poster: item.poster,
    tvInfo: {
      showType: item.type || "",
      sub: item.sub_episodes ? parseInt(item.sub_episodes) : undefined,
      dub: item.dub_episodes ? parseInt(item.dub_episodes) : undefined,
    },
  };
}

// ─── API functions ────────────────────────────────────────────────────────────

export async function getHome() {
  const { data } = await flask.get("/api/home");

  const banner: KaiBannerItem[] = data.banner || [];
  const latest: KaiAnime[] = data.latest_updates || [];
  const trending: {
    NOW?: KaiTrendingItem[];
    DAY?: KaiTrendingItem[];
    WEEK?: KaiTrendingItem[];
    MONTH?: KaiTrendingItem[];
  } = data.top_trending || {};

  return {
    spotlights: banner.slice(0, 5).map(mapBannerToSpotlight),
    trending: (trending.NOW || []).map(mapTrending),
    topAiring: (trending.DAY || []).map(mapTrending),
    mostPopular: (trending.WEEK || []).map(mapTrending),
    mostFavorite: (trending.MONTH || []).map(mapTrending),
    latestEpisode: latest.map(mapKaiAnime),
    topUpcoming: [],
    latestCompleted: [],
    top10: {
      today: (trending.NOW || []).slice(0, 10).map(mapTrending),
      week: (trending.WEEK || []).slice(0, 10).map(mapTrending),
      month: (trending.MONTH || []).slice(0, 10).map(mapTrending),
    },
  };
}

export async function getAnimeInfo(slug: string) {
  const { data } = await flask.get(`/api/anime/${slug}`);

  return {
    data: {
      id: slug,
      title: data.title || "",
      japanese_title: data.japanese_title || "",
      poster: data.poster || "",
      showType: data.type || "",
      description: data.description || "",
      animeInfo: {
        Overview: data.description || "",
        tvInfo: {
          showType: data.type || "",
          rating: data.rating || "",
          sub: data.sub_episodes || "",
          dub: data.dub_episodes || "",
        },
        Aired: data.detail?.date_aired || "",
        Status: data.detail?.status || "",
        Studios: data.detail?.studios?.join(", ") || "",
        Genres: data.detail?.genres || [],
        "MAL score": data.mal_score || "",
      },
      recommended_data: [],
    },
    seasons: (data.seasons || []).map(
      (s: { url: string; title: string; poster: string; active: boolean }) => ({
        id: slugFromUrl(s.url),
        title: s.title,
        season_poster: s.poster,
        isCurrent: s.active,
      }),
    ),
  };
}

export async function getEpisodes(slug: string) {
  // Step 1: get ani_id from anime info
  const { data: info } = await flask.get(`/api/anime/${slug}`);
  const ani_id = info.ani_id;
  if (!ani_id) return { episodes: [] };

  // Step 2: get episodes using ani_id
  const { data } = await flask.get(`/api/episodes/${ani_id}`);
  const episodes: KaiEpisode[] = data.episodes || [];

  return {
    episodes: episodes.map((ep) => ({
      // id format: slug/ani_id/token — used to reconstruct watch URL
      id: `${slug}?ani_id=${ani_id}&ep=${ep.number}&token=${ep.token}`,
      episode_no: parseInt(ep.number),
      title: ep.title || `Episode ${ep.number}`,
      isFiller: false,
    })),
    totalEpisodes: episodes.length,
  };
}

export async function getServers(episodeParam: string) {
  const [slug, queryString] = episodeParam.split("?");
  const params = new URLSearchParams(queryString || "");
  let token = params.get("token");

  if (!token) {
    const ep = params.get("ep");
    if (slug && ep) {
      const epData = await getEpisodes(slug);
      const found = epData.episodes.find((e) => e.episode_no === parseInt(ep));
      if (found) {
        const foundParams = new URLSearchParams(found.id.split("?")[1] || "");
        token = foundParams.get("token");
      }
    }
  }

  if (!token) return [];

  const { data } = await flask.get(`/api/servers/${token}`);
  const servers = data.servers || {};
  const result: {
    type: string;
    serverName: string;
    data_id: string;
    server_id: string;
  }[] = [];

  for (const [key, list] of Object.entries(servers)) {
    const type = SERVER_TYPE_MAP[key] || key;
    for (const s of list as {
      name: string;
      link_id: string;
      server_id: string;
    }[]) {
      result.push({
        type,
        serverName: s.name,
        data_id: s.link_id,
        server_id: s.server_id,
      });
    }
  }
  return result;
}

export async function getStream(
  episodeId: string,
  _server: string = "Server 1",
  type: string = "sub",
) {
  const [slug, queryString] = episodeId.split("?");
  const params = new URLSearchParams(queryString || "");
  let token = params.get("token");

  if (!token) {
    const ep = params.get("ep");
    if (slug && ep) {
      const epData = await getEpisodes(slug);
      const found = epData.episodes.find((e) => e.episode_no === parseInt(ep));
      if (found) {
        const foundParams = new URLSearchParams(found.id.split("?")[1] || "");
        token = foundParams.get("token");
      }
    }
  }

  if (!token) return null;

  const { data: serverData } = await flask.get(`/api/servers/${token}`);
  const servers = serverData.servers || {};

  // Map numeric keys to type names: "1"=sub, "2"=dub, "3"=raw
  const mappedServers: Record<string, { link_id: string; name: string }[]> = {};
  for (const [key, list] of Object.entries(servers)) {
    const typeName = SERVER_TYPE_MAP[key] || key;
    mappedServers[typeName] = list as { link_id: string; name: string }[];
  }

  const typeServers: { link_id: string; name: string }[] =
    mappedServers[type] || mappedServers["sub"] || [];

  if (!typeServers.length) return null;

  // Build full server list for the sidebar
  const allServers: {
    type: string;
    serverName: string;
    data_id: string;
    server_id: string;
  }[] = [];
  for (const [t, list] of Object.entries(mappedServers)) {
    for (const s of list as {
      link_id: string;
      name: string;
      server_id?: string;
    }[]) {
      allServers.push({
        type: t,
        serverName: s.name,
        data_id: s.link_id,
        server_id: s.server_id || "",
      });
    }
  }

  for (const server of typeServers) {
    try {
      const { data } = await flask.get(`/api/source/${server.link_id}`);
      const sources: { file: string }[] = data.sources || [];
      const m3u8 = sources[0]?.file;
      if (m3u8) {
        return {
          streamingLink: {
            link: m3u8,
            tracks: data.tracks || [],
            intro: data.skip?.intro || null,
            outro: data.skip?.outro || null,
          },
          servers: allServers,
        };
      }
    } catch (_) {
      continue;
    }
  }
  return null;
}

export async function searchAnime(keyword: string, _page: number = 1) {
  const { data } = await flask.get("/api/search", {
    params: { keyword },
  });

  const results: KaiAnime[] = data.results || [];

  return {
    data: results.map(mapKaiAnime),
    totalPage: 1,
  };
}

export async function getTopTen() {
  const { data } = await flask.get("/api/home");
  const trending = data.top_trending || {};

  return {
    today: (trending.NOW || []).slice(0, 10).map(mapTrending),
    week: (trending.WEEK || []).slice(0, 10).map(mapTrending),
    month: (trending.MONTH || []).slice(0, 10).map(mapTrending),
  };
}

export async function getSchedule() {
  // AnimeKAI doesn't have schedule — return empty
  return [];
}

export async function getRandom() {
  // AnimeKAI doesn't have random — return null
  return null;
}

export default flask;
