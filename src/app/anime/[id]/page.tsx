"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getAnimeInfo, getEpisodes, getTopTen, getHome } from "@/lib/api";
import { Play, Star, Captions, Mic, ChevronDown } from "lucide-react";
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

    getTopTen()
      .then((res) => {
        if (res) setTop10Data(res);
      })
      .catch(() => {});

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

  const undash = (val: string) => val.replace(/-/g, " ");

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

  const rawEntries = Object.entries(animeInfo).filter(
    ([key, val]) => !SKIP_KEYS.has(key) && typeof val === "string" && val,
  ) as [string, string][];

  const moreInfoEntries: [string, string][] = [
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
    ...(SIDEBAR_ORDER.map((k) => rawEntries.find(([key]) => key === k)).filter(
      Boolean,
    ) as [string, string][]),
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

  return (
    <div className="min-h-screen pt-14">
      {/* HERO BANNER */}
      <div className="relative h-[320px] sm:h-[400px] overflow-hidden">
        <Image
          src={info.poster}
          alt={info.title}
          fill
          className="object-cover blur-md scale-110 opacity-25"
          priority
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(13,13,24,0.3) 0%, rgba(13,13,24,0.6) 50%, var(--bg-primary) 100%)",
          }}
        />
      </div>

      {/* MAIN CONTENT */}
      <div className="px-4 sm:px-6 md:px-10 -mt-[240px] sm:-mt-[300px] relative z-10">
        {/* Top row: poster + info + sidebar */}
        <div className="flex gap-6 lg:gap-8 items-start">
          {/* Poster */}
          <div className="flex-shrink-0 hidden sm:block">
            <div
              className="w-40 md:w-52 aspect-[3/4] rounded-xl overflow-hidden"
              style={{
                boxShadow: "0 20px 60px rgba(0,0,0,0.8)",
                border: "2px solid rgba(233,30,140,0.3)",
              }}
            >
              <Image
                src={info.poster}
                alt={info.title}
                width={208}
                height={312}
                className="object-cover w-full h-full"
                priority
              />
            </div>
          </div>

          {/* Center: title + meta + description */}
          <div className="flex-1 min-w-0 pt-2 sm:pt-28">
            <h1
              className="text-2xl sm:text-3xl md:text-4xl font-black leading-tight mb-3"
              style={{ fontFamily: "'Rajdhani', sans-serif" }}
            >
              {info.title}
            </h1>

            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {tvInfo?.rating && (
                <span
                  className="px-2.5 py-0.5 rounded text-xs font-bold"
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
                  className="px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider text-white"
                  style={{ background: "var(--accent)" }}
                >
                  {tvInfo.showType || info.showType}
                </span>
              )}
              {tvInfo?.sub && (
                <span className="badge-sub flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold">
                  <Captions size={10} /> {tvInfo.sub}
                </span>
              )}
              {tvInfo?.dub && (
                <span className="badge-dub flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold">
                  <Mic size={10} /> {tvInfo.dub}
                </span>
              )}
              {animeInfo["MAL score"] && (
                <span
                  className="flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold"
                  style={{
                    background: "rgba(255,200,0,0.12)",
                    border: "1px solid rgba(255,200,0,0.25)",
                    color: "#f5c518",
                  }}
                >
                  <Star size={10} fill="currentColor" />{" "}
                  {animeInfo["MAL score"]}
                </span>
              )}
            </div>

            {description && (
              <p
                className="text-sm leading-relaxed mb-5"
                style={{ color: "var(--text-secondary)", maxWidth: "640px" }}
              >
                {description}
              </p>
            )}

            {episodes.length > 0 && (
              <Link
                href={`/watch/${episodes[0].id}`}
                className="inline-flex items-center gap-2 px-7 py-2.5 rounded-full font-bold text-sm text-white transition-all hover:scale-105 hover:brightness-110"
                style={{
                  background: "var(--accent)",
                  boxShadow: "0 0 24px rgba(233,30,140,0.35)",
                }}
              >
                <Play size={15} fill="white" />
                Start Watching
              </Link>
            )}
          </div>

          {/* Right sidebar info panel */}
          {moreInfoEntries.length > 0 && (
            <div
              className="hidden lg:block flex-shrink-0 pt-2 sm:pt-28"
              style={{ width: "220px" }}
            >
              <div
                className="rounded-xl p-4 space-y-2.5"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                }}
              >
                {moreInfoEntries.map(([key, value]) => (
                  <div key={key} className="flex flex-col gap-0.5">
                    <span
                      className="text-[11px] font-black uppercase tracking-widest"
                      style={{
                        color: "var(--accent)",
                        fontFamily: "'Rajdhani', sans-serif",
                      }}
                    >
                      {key}
                    </span>
                    <span
                      className="text-[12px] leading-snug"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {undash(value)}
                    </span>
                  </div>
                ))}

                {genres.length > 0 && (
                  <div className="pt-1">
                    <span
                      className="text-[11px] font-black uppercase tracking-widest block mb-1.5"
                      style={{
                        color: "var(--accent)",
                        fontFamily: "'Rajdhani', sans-serif",
                      }}
                    >
                      Genres
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {genres.map((genre) => (
                        <span
                          key={genre}
                          className="px-2 py-0.5 rounded text-[10px] font-semibold"
                          style={{
                            background: "rgba(233,30,140,0.1)",
                            border: "1px solid rgba(233,30,140,0.2)",
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

        {/* MOBILE: inline info */}
        <div className="sm:hidden mt-4 flex flex-wrap gap-x-4 gap-y-1.5">
          {moreInfoEntries.slice(0, 4).map(([key, value]) => (
            <div
              key={key}
              className="flex items-center gap-1 text-xs"
              style={{ color: "var(--text-secondary)" }}
            >
              <span
                className="font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                {key}:
              </span>
              <span>{undash(value)}</span>
            </div>
          ))}
        </div>

        {/* EPISODES */}
        {episodes.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
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
                <div className="relative">
                  <select
                    value={epRange}
                    onChange={(e) => setEpRange(Number(e.target.value))}
                    className="appearance-none text-sm font-bold rounded-lg pl-3 pr-8 py-1.5 outline-none cursor-pointer"
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
                          {start}–{end}
                        </option>
                      );
                    })}
                  </select>
                  <ChevronDown
                    size={13}
                    className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: "var(--text-secondary)" }}
                  />
                </div>
              )}
            </div>

            <div
              className="rounded-xl p-4"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-1.5">
                {currentEpisodes.map((ep) => {
                  const isFiller = ep.isFiller || ep.filler;
                  return (
                    <Link
                      key={ep.id}
                      href={`/watch/${ep.id}`}
                      title={ep.title || `Episode ${ep.episode_no}`}
                      className="flex items-center justify-center h-9 rounded-lg text-xs font-bold transition-all duration-150 hover:scale-105"
                      style={{
                        background: isFiller
                          ? "rgba(255,170,0,0.08)"
                          : "rgba(255,255,255,0.04)",
                        border: isFiller
                          ? "1px solid rgba(255,170,0,0.2)"
                          : "1px solid rgba(255,255,255,0.06)",
                        color: isFiller ? "#f5a623" : "var(--text-secondary)",
                        fontFamily: "'Rajdhani', sans-serif",
                        fontSize: "0.8rem",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "var(--accent-dim)";
                        e.currentTarget.style.borderColor = "var(--accent)";
                        e.currentTarget.style.color = "var(--accent)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = isFiller
                          ? "rgba(255,170,0,0.08)"
                          : "rgba(255,255,255,0.04)";
                        e.currentTarget.style.borderColor = isFiller
                          ? "rgba(255,170,0,0.2)"
                          : "rgba(255,255,255,0.06)";
                        e.currentTarget.style.color = isFiller
                          ? "#f5a623"
                          : "var(--text-secondary)";
                      }}
                    >
                      {ep.episode_no}
                    </Link>
                  );
                })}
              </div>

              <div
                className="flex items-center gap-4 mt-3 pt-3"
                style={{ borderTop: "1px solid var(--border)" }}
              >
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-3 h-3 rounded"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  />
                  <span
                    className="text-[11px]"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Episode
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-3 h-3 rounded"
                    style={{
                      background: "rgba(255,170,0,0.08)",
                      border: "1px solid rgba(255,170,0,0.2)",
                    }}
                  />
                  <span
                    className="text-[11px]"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Filler
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SEASONS */}
        {seasons && seasons.length > 0 && (
          <div className="mt-8 pb-4">
            <div className="section-title mb-3">Seasons</div>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
              {seasons.map((season) => (
                <Link
                  key={season.id}
                  href={`/anime/${season.id}`}
                  className="flex-shrink-0 group"
                >
                  <div
                    className="w-28 sm:w-32 rounded-xl overflow-hidden transition-all duration-200 group-hover:scale-105"
                    style={{
                      border: season.isCurrent
                        ? "2px solid var(--accent)"
                        : "2px solid rgba(255,255,255,0.07)",
                      boxShadow: season.isCurrent
                        ? "0 0 16px rgba(233,30,140,0.3)"
                        : "0 4px 16px rgba(0,0,0,0.4)",
                    }}
                  >
                    <div
                      className="relative aspect-[3/4]"
                      style={{ background: "var(--bg-card)" }}
                    >
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
                          className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider text-white"
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

      {/* BOTTOM SECTIONS */}
      {(recommendedAnime?.length > 0 ||
        homeData?.latestEpisode ||
        homeData?.topUpcoming) && (
        <section className="px-4 sm:px-6 md:px-10 py-6">
          <div className="flex gap-8">
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

      <div className="h-16" />
    </div>
  );
}
