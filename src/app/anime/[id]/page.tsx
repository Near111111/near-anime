"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getAnimeInfo, getEpisodes, getTopTen, getHome } from "@/lib/api";
import { Play, Star, Captions, Mic } from "lucide-react";
import { AnimeDetailSkeleton } from "@/components/Skeletons";
import AnimeGrid from "@/components/AnimeGrid";
import Top10Section from "@/components/Top10Section";
import type { Anime, HomeData } from "@/types/anime";

interface AnimeDetail {
  adultContent?: boolean;
  data_id?: string;
  id?: string;
  anilistId?: string | null;
  malId?: string | null;
  title: string;
  japanese_title?: string;
  synonyms?: string;
  poster: string;
  showType?: string;
  animeInfo?: {
    Overview?: string;
    tvInfo?: {
      showType?: string;
      rating?: string;
      quality?: string;
      sub?: string | number;
      dub?: string | number;
      eps?: string | number;
      duration?: string;
    };
    Genres?: string[];
    Producers?: string[];
    Japanese?: string;
    Synonyms?: string;
    Aired?: string;
    Premiered?: string;
    Duration?: string;
    Status?: string;
    "MAL score"?: string;
    Studios?: string;
    [key: string]: unknown;
  };
  recommended_data?: { id: string; title: string; poster: string }[];
  related_data?: { id: string; title: string; poster: string }[];
}

interface Season {
  id: string;
  title: string;
  season_poster?: string;
  data_number?: number;
  data_id?: number;
  isCurrent?: boolean;
}

interface Episode {
  id: string;
  episode_no: number;
  title: string;
  isFiller?: boolean;
  filler?: boolean;
}

interface Top10Data {
  today?: Anime[];
  week?: Anime[];
  month?: Anime[];
  Today?: Anime[];
  Week?: Anime[];
  Month?: Anime[];
}

const EPISODES_PER_PAGE = 100;

export default function AnimeDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [info, setInfo] = useState<AnimeDetail | null>(null);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [epRange, setEpRange] = useState(0);
  const [top10Data, setTop10Data] = useState<Top10Data | Anime[] | null>(null);
  const [homeData, setHomeData] = useState<HomeData | null>(null);

  useEffect(() => {
    if (!id) return;

    Promise.all([getAnimeInfo(id), getEpisodes(id)])
      .then(([infoData, epData]) => {
        setInfo(infoData?.data);
        setSeasons(infoData?.seasons || []);
        setEpisodes(epData?.episodes || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // Background fetch — won't block page
    getTopTen()
      .then((res) => {
        if (res) setTop10Data(res);
      })
      .catch(() => {});

    // Fetch home data for latest episodes + top upcoming
    getHome()
      .then((res) => {
        if (res) setHomeData(res);
      })
      .catch(() => {});
  }, [id]);

  if (loading) return <AnimeDetailSkeleton />;

  if (!info) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <p className="text-[var(--text-secondary)]">Anime not found</p>
      </div>
    );
  }

  const totalPages = Math.ceil(episodes.length / EPISODES_PER_PAGE);
  const currentEpisodes = episodes.slice(
    epRange * EPISODES_PER_PAGE,
    (epRange + 1) * EPISODES_PER_PAGE,
  );

  const animeInfo = info.animeInfo || {};
  const tvInfo = animeInfo.tvInfo || {};
  const description = animeInfo.Overview || "";

  // Helper to un-dash values from backend (backend does .split(" ").join("-"))
  const undash = (val: string) => val.replace(/-/g, " ");

  // Build moreInfo entries for sidebar (exclude internal fields)
  const SKIP_KEYS = new Set([
    "tvInfo",
    "Overview",
    "trailers",
    "Genres",
    "Producers",
    "Synonyms",
    "Japanese",
  ]);
  const SIDEBAR_ORDER = [
    "Japanese",
    "Synonyms",
    "Aired",
    "Premiered",
    "Duration",
    "Status",
    "MAL Score",
    "MAL score",
    "Studios",
  ];

  // Get all valid string entries
  const rawEntries = Object.entries(animeInfo).filter(
    ([key, val]) => !SKIP_KEYS.has(key) && typeof val === "string" && val,
  ) as [string, string][];

  // Sort by preferred order, rest alphabetically
  const moreInfoEntries: [string, string][] = [
    // Japanese and Synonyms first (special handling)
    ...(info.japanese_title || (animeInfo.Japanese as string)
      ? [
          [
            "Japanese",
            (animeInfo.Japanese as string) || info.japanese_title || "",
          ] as [string, string],
        ]
      : []),
    ...(animeInfo.Synonyms && typeof animeInfo.Synonyms === "string"
      ? [["Synonyms", animeInfo.Synonyms as string] as [string, string]]
      : []),
    // Then ordered keys
    ...(SIDEBAR_ORDER.map((k) => rawEntries.find(([key]) => key === k)).filter(
      Boolean,
    ) as [string, string][]),
    // Then remaining
    ...rawEntries.filter(([key]) => !SIDEBAR_ORDER.includes(key)),
  ].filter(([, val]) => !!val);

  const genres: string[] = Array.isArray(animeInfo.Genres)
    ? (animeInfo.Genres as string[]).map((g) => undash(g))
    : typeof animeInfo.Genres === "string"
      ? (animeInfo.Genres as string)
          .split(",")
          .map((g) => undash(g.trim()))
          .filter(Boolean)
      : [];

  const recommendedAnime = info.recommended_data || [];
  const hasSidebar = moreInfoEntries.length > 0 || !!description;

  return (
    <div className="min-h-screen pt-14">
      {/* Banner — taller, more dramatic */}
      <div className="relative h-[40vh] sm:h-[55vh] overflow-hidden">
        <Image
          src={info.poster}
          alt={info.title}
          fill
          className="object-cover blur-sm scale-110 opacity-30"
          priority
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, var(--bg-primary) 10%, rgba(13,13,24,0.4) 60%, rgba(13,13,24,0.2) 100%)",
          }}
        />
      </div>

      {/* Content - full-width layout matching home page */}
      <div className="px-4 sm:px-6 md:px-10 -mt-[25vh] sm:-mt-[38vh] relative z-10">
        <div className="flex gap-10">
          {/* Left: main content + episodes */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col md:flex-row gap-6 sm:gap-8 items-center md:items-start">
              {/* Poster */}
              <div className="flex-shrink-0 mt-4">
                <div
                  className="w-40 sm:w-48 md:w-56 aspect-[3/4] rounded-xl overflow-hidden"
                  style={{
                    boxShadow: "0 25px 70px rgba(0,0,0,0.7)",
                    border: "2px solid rgba(233,30,140,0.25)",
                  }}
                >
                  <Image
                    src={info.poster}
                    alt={info.title}
                    width={224}
                    height={336}
                    className="object-cover w-full h-full"
                    priority
                  />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 space-y-4 pt-2 md:pt-20 text-center md:text-left">
                <h1
                  className="text-2xl sm:text-4xl md:text-5xl font-black leading-tight drop-shadow-lg"
                  style={{ fontFamily: "'Rajdhani', sans-serif" }}
                >
                  {info.title}
                </h1>

                {/* Tags */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                  {tvInfo?.rating && (
                    <span
                      className="px-3 py-1 rounded text-xs font-bold"
                      style={{
                        background: "var(--bg-card)",
                        border: "1px solid var(--border)",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {tvInfo.rating}
                    </span>
                  )}
                  {(tvInfo?.showType || info.showType) && (
                    <span
                      className="px-3 py-1 rounded text-xs font-bold uppercase tracking-wider text-white"
                      style={{ background: "var(--accent)" }}
                    >
                      {tvInfo.showType || info.showType}
                    </span>
                  )}
                  {tvInfo?.sub && (
                    <span className="badge-sub flex items-center gap-1 px-3 py-1 rounded text-xs font-bold">
                      <Captions size={11} /> {tvInfo.sub}
                    </span>
                  )}
                  {tvInfo?.dub && (
                    <span className="badge-dub flex items-center gap-1 px-3 py-1 rounded text-xs font-bold">
                      <Mic size={11} /> {tvInfo.dub}
                    </span>
                  )}
                </div>

                {description && (
                  <p
                    className="text-sm leading-relaxed max-w-2xl"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {description}
                  </p>
                )}

                {episodes.length > 0 && (
                  <Link
                    href={`/watch/${episodes[0].id}`}
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-bold text-sm text-white transition-all hover:scale-105 hover:brightness-110"
                    style={{
                      background: "var(--accent)",
                      boxShadow: "0 0 24px rgba(233,30,140,0.4)",
                    }}
                  >
                    <Play size={16} fill="white" />
                    Start Watching
                  </Link>
                )}
              </div>
            </div>

            {/* Episodes with pagination */}
            {episodes.length > 0 && (
              <div className="mt-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="section-title">
                    Episodes
                    <span
                      className="text-[var(--text-secondary)] text-sm font-normal ml-2"
                      style={{ fontFamily: "'Nunito', sans-serif" }}
                    >
                      ({episodes.length})
                    </span>
                  </div>
                  {totalPages > 1 && (
                    <select
                      value={epRange}
                      onChange={(e) => setEpRange(Number(e.target.value))}
                      className="text-sm font-bold rounded-lg px-3 py-1.5 outline-none cursor-pointer"
                      style={{
                        background: "var(--bg-card)",
                        border: "1px solid var(--border)",
                        color: "var(--text-primary)",
                        fontFamily: "'Rajdhani', sans-serif",
                      }}
                    >
                      {Array.from({ length: totalPages }, (_, i) => {
                        const start = i * EPISODES_PER_PAGE + 1;
                        const end = Math.min(
                          (i + 1) * EPISODES_PER_PAGE,
                          episodes.length,
                        );
                        return (
                          <option key={i} value={i}>
                            {start}-{end}
                          </option>
                        );
                      })}
                    </select>
                  )}
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2">
                  {currentEpisodes.map((ep) => (
                    <Link
                      key={ep.id}
                      href={`/watch/${ep.id}`}
                      className="flex items-center justify-center h-10 rounded text-xs font-bold transition-all hover:scale-105"
                      style={{
                        background:
                          ep.isFiller || ep.filler
                            ? "rgba(255,170,0,0.1)"
                            : "var(--bg-card)",
                        border:
                          ep.isFiller || ep.filler
                            ? "1px solid rgba(255,170,0,0.2)"
                            : "1px solid var(--border)",
                        color:
                          ep.isFiller || ep.filler
                            ? "var(--warning)"
                            : "var(--text-secondary)",
                        fontFamily: "'Rajdhani', sans-serif",
                        fontSize: "0.85rem",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "var(--accent-dim)";
                        e.currentTarget.style.borderColor = "var(--accent)";
                        e.currentTarget.style.color = "var(--accent)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background =
                          ep.isFiller || ep.filler
                            ? "rgba(255,170,0,0.1)"
                            : "var(--bg-card)";
                        e.currentTarget.style.borderColor =
                          ep.isFiller || ep.filler
                            ? "rgba(255,170,0,0.2)"
                            : "var(--border)";
                        e.currentTarget.style.color =
                          ep.isFiller || ep.filler
                            ? "var(--warning)"
                            : "var(--text-secondary)";
                      }}
                    >
                      {ep.episode_no}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Seasons — portrait poster cards */}
            {seasons && seasons.length > 0 && (
              <div className="mt-10 pb-8">
                <div className="section-title mb-4">Seasons</div>
                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                  {seasons.map((season) => (
                    <Link
                      key={season.id}
                      href={`/anime/${season.id}`}
                      className="flex-shrink-0 group"
                    >
                      <div
                        className="w-32 sm:w-36 rounded-xl overflow-hidden transition-all duration-200 group-hover:scale-105"
                        style={{
                          border: season.isCurrent
                            ? "2px solid var(--accent)"
                            : "2px solid rgba(255,255,255,0.08)",
                          boxShadow: season.isCurrent
                            ? "0 0 16px rgba(233,30,140,0.3)"
                            : "0 4px 16px rgba(0,0,0,0.4)",
                        }}
                      >
                        <div className="relative aspect-[3/4] bg-[var(--bg-card)]">
                          <Image
                            src={season.season_poster || info.poster}
                            alt={season.title}
                            fill
                            className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                          />
                          <div
                            className="absolute inset-0"
                            style={{
                              background:
                                "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 60%)",
                            }}
                          />
                          {season.isCurrent && (
                            <div
                              className="absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider text-white"
                              style={{ background: "var(--accent)" }}
                            >
                              Current
                            </div>
                          )}
                        </div>
                        <div
                          className="px-2 py-2"
                          style={{ background: "var(--bg-card)" }}
                        >
                          <p
                            className="text-[11px] font-bold leading-tight line-clamp-2"
                            style={{
                              fontFamily: "'Rajdhani', sans-serif",
                              color: season.isCurrent
                                ? "var(--accent)"
                                : "var(--text-primary)",
                            }}
                          >
                            {season.title}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right sidebar: Info only */}
          {hasSidebar && (
            <div
              className="hidden xl:block flex-shrink-0"
              style={{ width: "260px" }}
            >
              <div className="sticky top-[72px] pt-20 space-y-3">
                {moreInfoEntries.map(([key, value]) => (
                  <div key={key}>
                    <span
                      className="text-[13px] font-bold"
                      style={{
                        color: "var(--text-primary)",
                        fontFamily: "'Rajdhani', sans-serif",
                      }}
                    >
                      {key} :{" "}
                    </span>
                    <span className="text-[13px] text-[var(--text-secondary)]">
                      {undash(value)}
                    </span>
                  </div>
                ))}

                {genres.length > 0 && (
                  <div className="pt-1">
                    <span
                      className="text-[13px] font-bold block mb-2"
                      style={{
                        color: "var(--text-primary)",
                        fontFamily: "'Rajdhani', sans-serif",
                      }}
                    >
                      Genres :
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {genres.map((genre) => (
                        <span
                          key={genre}
                          className="px-3 py-1 rounded-full text-[11px] font-semibold transition-colors hover:bg-[var(--accent)] hover:text-white cursor-pointer"
                          style={{
                            border: "1px solid var(--border)",
                            color: "var(--text-secondary)",
                          }}
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom sections — exact same layout as home page ── */}
      {(recommendedAnime?.length > 0 ||
        homeData?.latestEpisode ||
        homeData?.topUpcoming) && (
        <section className="px-4 sm:px-6 md:px-10 py-6">
          <div className="flex gap-8">
            {/* Left: all grids stacked */}
            <div className="flex-1 min-w-0 space-y-8">
              {recommendedAnime && recommendedAnime.length > 0 && (
                <AnimeGrid
                  title="Recommended Animes"
                  anime={recommendedAnime as Anime[]}
                />
              )}
              {homeData?.latestEpisode && (
                <AnimeGrid
                  title="Latest Episodes Animes"
                  anime={homeData.latestEpisode}
                />
              )}
              {homeData?.topUpcoming && (
                <AnimeGrid
                  title="Top Upcoming Animes"
                  anime={homeData.topUpcoming}
                />
              )}
            </div>

            {/* Right: Top 10 sidebar — sticky like home page */}
            {top10Data && (
              <div
                className="hidden lg:block flex-shrink-0"
                style={{ width: "320px" }}
              >
                <div className="sticky top-[72px]">
                  <Top10Section top10={top10Data} />
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      <div className="h-20" />
    </div>
  );
}
