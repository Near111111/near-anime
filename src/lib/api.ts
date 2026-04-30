import axios from "axios";

// AnimePahe API running on port 3000
const ANIMEPAHE_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: ANIMEPAHE_BASE,
  timeout: 30000,
});

// ─── Type helpers ─────────────────────────────────────────────────────────────

interface PaheAiringItem {
  id: number;
  anime_id: number;
  title: string;
  episode: number;
  image: string;
  session: string;
  link: string;
  fansub?: string;
  created_at?: string;
}

interface PaheSearchItem {
  id: number;
  title: string;
  status: string;
  type: string;
  episodes: number;
  score: number;
  year: number;
  season: string;
  poster: string;
  session: string;
  link: string;
}

interface PaheAnimeInfo {
  ids: {
    animepahe_id: string;
    mal_id?: string;
    anilist_id?: string;
    ann_id?: string;
    kitsu?: string;
  };
  title: string;
  image: string;
  preview?: string;
  synopsis: string;
  synonym?: string;
  japanese?: string;
  type: string;
  episodes: string;
  status: string;
  duration: string;
  aired: string;
  season: string;
  studio?: string;
  themes?: string[];
  demographic?: string[];
  genre?: string[];
  relations?: Record<
    string,
    {
      title: string;
      session: string;
      image: string;
      type: string;
      episodes: string;
      status: string;
      season: string;
    }[]
  >;
  recommendations?: {
    title: string;
    url: string;
    image: string;
    type: string;
    episodes: string;
    status: string;
    season: string;
  }[];
}

interface PaheEpisode {
  id: number;
  anime_id: number;
  episode: number;
  snapshot: string;
  session: string;
  link: string;
  filler?: boolean;
  disc?: string;
  audio?: string;
  duration?: string;
}

interface PaheStreamSource {
  url: string;
  resolution: string;
  isM3U8: boolean;
  isDub: boolean;
  fanSub: string;
}

interface PaheStreamResponse {
  ids: Record<string, string>;
  session: string;
  episode: string;
  anime_title: string;
  provider: string;
  sources: PaheStreamSource[];
  downloads: unknown[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resolutionToNumber(res: string): number {
  return parseInt(res.replace("p", "")) || 0;
}

// ─── API functions ────────────────────────────────────────────────────────────

export async function getHome() {
  const { data } = await api.get("/api/airing");
  const items: PaheAiringItem[] = data.data || [];

  const spotlights = items.slice(0, 5).map((item, index) => ({
    id: item.session,
    rank: index + 1,
    title: item.title,
    japanese_title: "",
    poster: item.image,
    description: `Episode ${item.episode} — Fansub: ${item.fansub || "N/A"}`,
    tvInfo: {
      showType: "TV",
      rating: "",
      sub: item.episode,
      dub: undefined,
    },
  }));

  const latestEpisode = items.map((item) => ({
    id: item.session,
    title: item.title,
    japanese_title: "",
    poster: item.image,
    tvInfo: {
      showType: "TV",
      rating: "",
      eps: item.episode,
    },
  }));

  return {
    spotlights,
    trending: latestEpisode.slice(0, 12),
    topAiring: latestEpisode.slice(0, 12),
    mostPopular: latestEpisode.slice(0, 12),
    mostFavorite: latestEpisode.slice(0, 12),
    latestEpisode,
    latestCompleted: [],
    topUpcoming: [],
    top10: {
      today: latestEpisode.slice(0, 10),
      week: latestEpisode.slice(0, 10),
      month: latestEpisode.slice(0, 10),
    },
  };
}

export async function getAnimeInfo(session: string) {
  const { data }: { data: PaheAnimeInfo } = await api.get(`/api/${session}`);

  return {
    data: {
      id: session,
      title: data.title || "",
      japanese_title: data.japanese || "",
      poster: data.image || "",
      showType: data.type || "",
      description: data.synopsis || "",
      animeInfo: {
        Overview: data.synopsis || "",
        tvInfo: {
          showType: data.type || "",
          rating: "",
          sub: data.episodes || "",
          dub: "",
        },
        Aired: data.aired || "",
        Status: data.status || "",
        Studios: data.studio || "",
        Duration: data.duration || "",
        Season: data.season || "",
        Genres: data.genre || [],
        "MAL score": "",
      },
      recommended_data: (data.recommendations || []).map((rec) => ({
        id: rec.url.replace("/anime/", ""),
        title: rec.title,
        poster: rec.image,
      })),
    },
    seasons: [],
  };
}

export async function getEpisodes(session: string) {
  const allEpisodes: PaheEpisode[] = [];
  let lastPage = 1;

  // Fetch first page to get pagination info
  const firstRes = await api.get(`/api/${session}/releases`, {
    params: { sort: "episode_asc", page: 1 },
  });
  const firstData = firstRes.data;
  lastPage = firstData.paginationInfo?.lastPage || 1;
  allEpisodes.push(...(firstData.data || []));

  // Fetch remaining pages (cap at 10 pages to avoid timeout)
  const maxPages = Math.min(lastPage, 10);
  const remainingPages = Array.from({ length: maxPages - 1 }, (_, i) => i + 2);

  await Promise.all(
    remainingPages.map(async (p) => {
      try {
        const { data } = await api.get(`/api/${session}/releases`, {
          params: { sort: "episode_asc", page: p },
        });
        allEpisodes.push(...(data.data || []));
      } catch {
        // ignore failed pages
      }
    }),
  );

  // Sort by episode number
  allEpisodes.sort((a, b) => a.episode - b.episode);

  return {
    episodes: allEpisodes.map((ep) => ({
      // id format: animeSession___episodeSession
      id: `${session}___${ep.session}`,
      episode_no: ep.episode,
      title: `Episode ${ep.episode}`,
      isFiller: ep.filler || false,
    })),
    totalEpisodes: allEpisodes.length,
  };
}

export async function getServers(episodeId: string) {
  const parts = episodeId.split("___");
  if (parts.length < 2) return [];
  const animeSession = parts[0];

  return [
    {
      type: "sub",
      serverName: "Kwik",
      data_id: episodeId,
      server_id: animeSession,
    },
  ];
}

export async function getStream(
  episodeId: string,
  _server: string = "kwik",
  _type: string = "sub",
) {
  // episodeId can be:
  //   "animeSession___episodeSession"           (initial load, pick best)
  //   "animeSession___episodeSession|||index"   (user picked a quality)
  const [baseId, indexStr] = episodeId.split("|||");
  const pickedIndex = indexStr !== undefined ? parseInt(indexStr) : -1;

  const parts = baseId.split("___");
  if (parts.length < 2) return null;

  const animeSession = parts[0];
  const episodeSession = parts[1];

  try {
    const { data }: { data: PaheStreamResponse } = await api.get(
      `/api/play/${animeSession}`,
      {
        params: { episodeId: episodeSession, downloads: false },
      },
    );

    const sources: PaheStreamSource[] = data.sources || [];
    if (!sources.length) return null;

    // Sort highest quality first
    const sorted = [...sources].sort(
      (a, b) =>
        resolutionToNumber(b.resolution) - resolutionToNumber(a.resolution),
    );

    // Use picked index if valid, otherwise best quality
    const chosen =
      pickedIndex >= 0 && pickedIndex < sorted.length
        ? sorted[pickedIndex]
        : sorted[0];

    // Build server list — one entry per quality
    const allServers = sorted.map((src, i) => ({
      type: src.isDub ? "dub" : "sub",
      serverName: `Kwik ${src.resolution}`,
      data_id: `${baseId}|||${i}`,
      server_id: animeSession,
    }));

    return {
      streamingLink: {
        link: chosen.url,
        tracks: [],
        intro: null,
        outro: null,
      },
      servers: allServers,
    };
  } catch {
    return null;
  }
}

export async function searchAnime(keyword: string, _page: number = 1) {
  const { data } = await api.get("/api/search", {
    params: { q: keyword },
  });

  const results: PaheSearchItem[] = data.data || [];

  return {
    data: results.map((item) => ({
      id: item.session,
      title: item.title,
      japanese_title: "",
      poster: item.poster,
      tvInfo: {
        showType: item.type || "TV",
        rating: item.score ? `${item.score}` : "",
        sub: item.episodes || undefined,
        dub: undefined,
        eps: item.episodes || undefined,
      },
    })),
    totalPage: 1,
  };
}

export async function getTopTen() {
  const { data } = await api.get("/api/airing");
  const items: PaheAiringItem[] = data.data || [];

  const mapped = items.slice(0, 10).map((item) => ({
    id: item.session,
    title: item.title,
    japanese_title: "",
    poster: item.image,
    tvInfo: { showType: "TV", eps: item.episode },
  }));

  return {
    today: mapped,
    week: mapped,
    month: mapped,
  };
}

export async function getSchedule() {
  return [];
}

export async function getRandom() {
  return null;
}

export default api;
