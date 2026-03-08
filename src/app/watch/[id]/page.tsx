"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getStream, getAnimeInfo, getEpisodes, getHome } from "@/lib/api";
import {
  AlertCircle,
  Captions,
  Mic,
  MonitorPlay,
  Github,
  Star,
  ChevronRight,
  Search,
  SkipForward,
} from "lucide-react";
import { WatchPageSkeleton } from "@/components/Skeletons";
import AnimeGrid from "@/components/AnimeGrid";
import type { Anime } from "@/types/anime";
import Hls from "hls.js";

interface StreamData {
  link: string;
  tracks?: { file: string; label: string; kind: string }[];
}
interface ServerItem {
  type: string;
  data_id: string;
  server_id: string;
  serverName: string;
}
interface Episode {
  id: string; // e.g. "bleach-806?ep=13793"
  episode_no: number;
  title: string | null;
  isFiller?: boolean;
  filler?: boolean;
}
interface AnimeDetail {
  title: string;
  poster: string;
  description?: string;
  rating?: string;
  type?: string;
  duration?: string;
  episodes?: { sub?: number; dub?: number };
  seasons?: {
    id: string;
    title: string;
    isCurrent: boolean;
    poster?: string;
  }[];
}

const EPISODES_PER_PAGE = 50;
const GITHUB_USERNAME = "Near111111";

export default function WatchPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const routeId = params.id as string;
  const ep = searchParams.get("ep"); // this is the episode data_id e.g. "13793"
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  // fullEpisodeId = "bleach-806?ep=13793" — what the stream API expects
  const fullEpisodeId = ep ? `${routeId}?ep=${ep}` : routeId;

  const [stream, setStream] = useState<StreamData | null>(null);
  const [servers, setServers] = useState<ServerItem[]>([]);
  const [activeServer, setActiveServer] = useState("hd-1");
  const [activeType, setActiveType] = useState("sub");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [animeInfo, setAnimeInfo] = useState<AnimeDetail | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [epRange, setEpRange] = useState(0);
  const [epSearch, setEpSearch] = useState("");

  const [latestEpisode, setLatestEpisode] = useState<Anime[]>([]);
  const [topUpcoming, setTopUpcoming] = useState<Anime[]>([]);
  const [recoLoaded, setRecoLoaded] = useState(false);
  const [followed, setFollowed] = useState(false);

  // animeId = the slug without query string e.g. "bleach-806"
  const animeId = routeId.replace(/\?.*$/, "");

  // currentEpisode = find by matching ep data_id in episode.id
  const currentEpisode = episodes.find((e) =>
    ep ? e.id.includes(`ep=${ep}`) : false,
  );
  const currentEpNo = currentEpisode?.episode_no;

  // Next episode
  const nextEpisode = currentEpisode
    ? episodes.find((e) => e.episode_no === currentEpisode.episode_no + 1)
    : null;

  const fetchStream = useCallback(
    async (server: string, type: string) => {
      setLoading(true);
      setError("");
      try {
        const result = await getStream(fullEpisodeId, server, type);
        const rawLink = result?.streamingLink?.link;
        const streamUrl = typeof rawLink === "string" ? rawLink : rawLink?.file;
        if (streamUrl) {
          setStream({ ...result.streamingLink, link: streamUrl });
          setServers(result.servers || []);
        } else {
          setError("No stream available. Try another server.");
        }
      } catch {
        setError("Failed to load stream. Try a different server.");
      }
      setLoading(false);
    },
    [fullEpisodeId],
  );

  // Fetch stream on episode change
  useEffect(() => {
    if (fullEpisodeId) fetchStream(activeServer, activeType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullEpisodeId]);

  // Fetch anime info + episodes
  useEffect(() => {
    if (!animeId) return;
    getAnimeInfo(animeId)
      .then((res) => {
        if (res?.data) setAnimeInfo(res.data);
      })
      .catch(() => {});
    getEpisodes(animeId)
      .then((res) => {
        if (res?.episodes) setEpisodes(res.episodes);
      })
      .catch(() => {});
  }, [animeId]);

  // Auto-scroll episode list to current episode
  useEffect(() => {
    if (!currentEpisode || episodes.length === 0) return;
    const pageIndex = Math.floor(
      (currentEpisode.episode_no - 1) / EPISODES_PER_PAGE,
    );
    setEpRange(pageIndex);
  }, [currentEpisode, episodes.length]);

  // Fetch recommendations lazily (after main content loads)
  useEffect(() => {
    if (recoLoaded) return;
    const timer = setTimeout(() => {
      getHome()
        .then((homeData) => {
          if (homeData) {
            setLatestEpisode(homeData.latestEpisode || []);
            setTopUpcoming(homeData.topUpcoming || []);
          }
          setRecoLoaded(true);
        })
        .catch(() => {
          setRecoLoaded(true);
        });
    }, 800); // slight delay so player loads first
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // HLS player setup
  useEffect(() => {
    if (!stream?.link || !videoRef.current) return;
    const video = videoRef.current;

    // Destroy previous instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({ maxBufferLength: 30, maxMaxBufferLength: 60 });
      hlsRef.current = hls;
      hls.loadSource(`/api/proxy?url=${encodeURIComponent(stream.link)}`);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });

      // Auto-next: when video ends, navigate to next episode
      const handleEnded = () => {
        if (nextEpisode) {
          router.push(`/watch/${nextEpisode.id}`);
        }
      };
      video.addEventListener("ended", handleEnded);

      // Add subtitle tracks
      // Remove old tracks first
      Array.from(video.querySelectorAll("track")).forEach((t) => t.remove());
      if (stream.tracks) {
        stream.tracks.forEach((track) => {
          if (track.kind === "captions" || track.kind === "subtitles") {
            const trackEl = document.createElement("track");
            trackEl.kind = "subtitles";
            trackEl.label = track.label;
            trackEl.src = track.file;
            trackEl.default = track.label.toLowerCase().includes("english");
            video.appendChild(trackEl);
          }
        });
      }

      return () => {
        video.removeEventListener("ended", handleEnded);
        hls.destroy();
        hlsRef.current = null;
      };
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = stream.link;
      video.play().catch(() => {});
    }
  }, [stream, nextEpisode, router]);

  const handleServerChange = (server: string, type: string) => {
    setActiveServer(server);
    setActiveType(type);
    fetchStream(server, type);
  };

  const subServers = servers.filter((s) => s.type === "sub");
  const dubServers = servers.filter((s) => s.type === "dub");
  const rawServers = servers.filter((s) => s.type === "raw");

  const totalPages = Math.ceil(episodes.length / EPISODES_PER_PAGE);
  const filteredEpisodes = epSearch
    ? episodes.filter((e) => e.episode_no.toString().includes(epSearch))
    : episodes.slice(
        epRange * EPISODES_PER_PAGE,
        (epRange + 1) * EPISODES_PER_PAGE,
      );

  // Episode title: prefer title, fallback to "Episode N"
  const episodeTitle = currentEpisode?.title
    ? currentEpisode.title
    : currentEpNo
      ? `Episode ${currentEpNo}`
      : "";

  const isInitialLoad = loading && servers.length === 0;
  if (isInitialLoad) return <WatchPageSkeleton />;

  return (
    <div
      className="min-h-screen pt-14 w-full"
      style={{ background: "var(--bg-primary)" }}
    >
      {/* Breadcrumb */}
      <div
        className="w-full px-3 sm:px-6 py-2 flex items-center gap-2 text-xs overflow-x-auto no-scrollbar"
        style={{
          color: "var(--text-secondary)",
          fontFamily: "'Rajdhani', sans-serif",
        }}
      >
        <Link href="/" className="hover:text-white transition-colors">
          Home
        </Link>
        <ChevronRight size={12} />
        <span>TV</span>
        <ChevronRight size={12} />
        {animeInfo && (
          <span style={{ color: "var(--text-primary)" }}>
            Watching {animeInfo.title}
            {episodeTitle && ` · ${episodeTitle}`}
          </span>
        )}
      </div>

      {/* ── 3-column layout ── */}
      <div className="w-full px-3 sm:px-6 pb-8 flex gap-5 items-start">
        {/* ── LEFT SIDEBAR ── */}
        <div
          className="hidden lg:flex flex-col flex-shrink-0 gap-3"
          style={{
            width: "280px",
            position: "sticky",
            top: "80px",
            maxHeight: "calc(100vh - 96px)",
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          {/* Episode list */}
          <div
            className="flex flex-col rounded-xl overflow-hidden"
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border)",
              flex: "1 1 auto",
              minHeight: "120px",
            }}
          >
            <div
              className="p-3 border-b flex-shrink-0"
              style={{ borderColor: "var(--border)" }}
            >
              <div
                className="text-xs font-bold uppercase tracking-widest mb-2"
                style={{
                  color: "var(--text-secondary)",
                  fontFamily: "'Rajdhani', sans-serif",
                }}
              >
                List of episodes:
              </div>
              <div className="relative">
                <Search
                  size={12}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-secondary)" }}
                />
                <input
                  type="text"
                  placeholder="Number of Ep"
                  value={epSearch}
                  onChange={(e) => setEpSearch(e.target.value)}
                  className="w-full text-xs pl-7 pr-3 py-1.5 rounded outline-none"
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    color: "var(--text-primary)",
                    fontFamily: "'Rajdhani', sans-serif",
                  }}
                />
              </div>
            </div>

            {totalPages > 1 && !epSearch && (
              <div
                className="flex flex-wrap gap-1 p-2 border-b flex-shrink-0"
                style={{ borderColor: "var(--border)" }}
              >
                {Array.from({ length: totalPages }, (_, i) => {
                  const start = i * EPISODES_PER_PAGE + 1;
                  const end = Math.min(
                    (i + 1) * EPISODES_PER_PAGE,
                    episodes.length,
                  );
                  return (
                    <button
                      key={i}
                      onClick={() => setEpRange(i)}
                      className="text-xs px-2 py-0.5 rounded transition-all"
                      style={{
                        fontFamily: "'Rajdhani', sans-serif",
                        background:
                          epRange === i ? "var(--accent)" : "var(--bg-card)",
                        color:
                          epRange === i ? "white" : "var(--text-secondary)",
                        border:
                          "1px solid " +
                          (epRange === i ? "var(--accent)" : "var(--border)"),
                      }}
                    >
                      {start}-{end}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="overflow-y-auto p-2" style={{ flex: 1 }}>
              <div className="grid grid-cols-5 gap-1">
                {filteredEpisodes.map((epItem) => {
                  // Match by ep data_id embedded in episode.id
                  const isCurrent = ep ? epItem.id.includes(`ep=${ep}`) : false;
                  const isFiller = epItem.isFiller || epItem.filler;
                  return (
                    <Link
                      key={epItem.id}
                      href={`/watch/${epItem.id}`}
                      title={epItem.title || `Episode ${epItem.episode_no}`}
                      className="flex items-center justify-center h-8 rounded text-xs font-bold transition-all hover:scale-105"
                      style={{
                        fontFamily: "'Rajdhani', sans-serif",
                        background: isCurrent
                          ? "var(--accent)"
                          : isFiller
                            ? "rgba(255,170,0,0.1)"
                            : "var(--bg-card)",
                        border:
                          "1px solid " +
                          (isCurrent
                            ? "var(--accent)"
                            : isFiller
                              ? "rgba(255,170,0,0.3)"
                              : "var(--border)"),
                        color: isCurrent
                          ? "white"
                          : isFiller
                            ? "var(--warning)"
                            : "var(--text-secondary)",
                        boxShadow: isCurrent
                          ? "0 0 10px var(--accent-glow)"
                          : "none",
                      }}
                    >
                      {epItem.episode_no}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Now watching notice */}
          <div
            className="flex items-start gap-3 p-3 rounded-xl flex-shrink-0"
            style={{
              background: "rgba(233,30,140,0.06)",
              border: "1px solid rgba(233,30,140,0.15)",
              fontFamily: "'Rajdhani', sans-serif",
            }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 animate-pulse"
              style={{ background: "var(--accent)" }}
            />
            <div className="min-w-0">
              <div
                className="font-bold text-sm truncate"
                style={{ color: "var(--text-primary)" }}
              >
                {episodeTitle || "Loading..."}
              </div>
              <div
                className="text-xs mt-0.5"
                style={{ color: "var(--text-secondary)" }}
              >
                If current server doesn&apos;t work please try other servers
                beside.
              </div>
            </div>
          </div>

          {/* Server selection */}
          <div
            className="rounded-xl p-4 space-y-4 flex-shrink-0"
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border)",
            }}
          >
            {subServers.length > 0 && (
              <div className="space-y-2">
                <div
                  className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
                  style={{
                    color: "var(--sub-color)",
                    fontFamily: "'Rajdhani', sans-serif",
                  }}
                >
                  <Captions size={13} /> SUB:
                </div>
                <div className="flex flex-wrap gap-2">
                  {subServers.map((s) => {
                    const isActive =
                      activeServer === s.serverName.toLowerCase() &&
                      activeType === "sub";
                    return (
                      <button
                        key={`sub-${s.serverName}`}
                        onClick={() =>
                          handleServerChange(s.serverName.toLowerCase(), "sub")
                        }
                        className="px-3 py-1.5 rounded text-sm font-bold transition-all"
                        style={{
                          fontFamily: "'Rajdhani', sans-serif",
                          background: isActive
                            ? "var(--accent)"
                            : "var(--bg-card)",
                          border:
                            "1px solid " +
                            (isActive ? "var(--accent)" : "var(--border)"),
                          color: isActive ? "white" : "var(--text-secondary)",
                          boxShadow: isActive
                            ? "0 0 12px rgba(233,30,140,0.3)"
                            : "none",
                        }}
                      >
                        {s.serverName}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            {dubServers.length > 0 && (
              <div className="space-y-2">
                <div
                  className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
                  style={{
                    color: "var(--warning)",
                    fontFamily: "'Rajdhani', sans-serif",
                  }}
                >
                  <Mic size={13} /> DUB:
                </div>
                <div className="flex flex-wrap gap-2">
                  {dubServers.map((s) => {
                    const isActive =
                      activeServer === s.serverName.toLowerCase() &&
                      activeType === "dub";
                    return (
                      <button
                        key={`dub-${s.serverName}`}
                        onClick={() =>
                          handleServerChange(s.serverName.toLowerCase(), "dub")
                        }
                        className="px-3 py-1.5 rounded text-sm font-bold transition-all"
                        style={{
                          fontFamily: "'Rajdhani', sans-serif",
                          background: isActive
                            ? "var(--warning)"
                            : "var(--bg-card)",
                          border:
                            "1px solid " +
                            (isActive ? "var(--warning)" : "var(--border)"),
                          color: isActive ? "#000" : "var(--text-secondary)",
                        }}
                      >
                        {s.serverName}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            {rawServers.length > 0 && (
              <div className="space-y-2">
                <div
                  className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
                  style={{
                    color: "var(--text-secondary)",
                    fontFamily: "'Rajdhani', sans-serif",
                  }}
                >
                  <MonitorPlay size={13} /> RAW:
                </div>
                <div className="flex flex-wrap gap-2">
                  {rawServers.map((s) => {
                    const isActive =
                      activeServer === s.serverName.toLowerCase() &&
                      activeType === "raw";
                    return (
                      <button
                        key={`raw-${s.serverName}`}
                        onClick={() =>
                          handleServerChange(s.serverName.toLowerCase(), "raw")
                        }
                        className="px-3 py-1.5 rounded text-sm font-bold transition-all"
                        style={{
                          fontFamily: "'Rajdhani', sans-serif",
                          background: isActive
                            ? "rgba(255,255,255,0.15)"
                            : "var(--bg-card)",
                          border:
                            "1px solid " +
                            (isActive
                              ? "rgba(255,255,255,0.3)"
                              : "var(--border)"),
                          color: isActive ? "white" : "var(--text-secondary)",
                        }}
                      >
                        {s.serverName}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── CENTER + RIGHT ── */}
        <div className="flex flex-1 min-w-0 gap-5 items-start">
          {/* ── CENTER: Player ── */}
          <div className="flex-1 min-w-0 flex flex-col">
            <div
              className="relative overflow-hidden w-full"
              style={{
                background: "#000",
                borderRadius: "12px",
                aspectRatio: "16/9",
                border: "1px solid rgba(233,30,140,0.15)",
              }}
            >
              {loading && (
                <div
                  className="absolute inset-0 flex items-center justify-center z-10"
                  style={{ background: "rgba(0,0,0,0.85)" }}
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative w-12 h-12">
                      <div
                        className="absolute inset-0 rounded-full"
                        style={{ border: "2px solid rgba(233,30,140,0.15)" }}
                      />
                      <div
                        className="absolute inset-0 rounded-full"
                        style={{
                          border: "2px solid transparent",
                          borderTopColor: "var(--accent)",
                          animation: "spin 0.8s linear infinite",
                        }}
                      />
                    </div>
                    <p
                      className="text-xs font-bold uppercase tracking-widest"
                      style={{
                        color: "var(--text-secondary)",
                        fontFamily: "'Rajdhani', sans-serif",
                      }}
                    >
                      Loading Stream...
                    </p>
                  </div>
                </div>
              )}
              {error && !loading && (
                <div
                  className="absolute inset-0 flex items-center justify-center z-10"
                  style={{ background: "rgba(0,0,0,0.9)" }}
                >
                  <div className="text-center space-y-3 px-4">
                    <AlertCircle
                      className="w-10 h-10 mx-auto"
                      style={{ color: "var(--danger)" }}
                    />
                    <p
                      className="text-sm"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {error}
                    </p>
                  </div>
                </div>
              )}
              <video
                ref={videoRef}
                controls
                className="w-full h-full"
                crossOrigin="anonymous"
              />
            </div>

            {/* Next episode button */}
            {nextEpisode && (
              <div className="mt-3 flex justify-end">
                <Link
                  href={`/watch/${nextEpisode.id}`}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all hover:scale-[1.02]"
                  style={{
                    fontFamily: "'Rajdhani', sans-serif",
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border)",
                    color: "var(--text-secondary)",
                  }}
                >
                  <span className="truncate max-w-[200px]">
                    Next:{" "}
                    {nextEpisode.title || `Episode ${nextEpisode.episode_no}`}
                  </span>
                  <SkipForward
                    size={15}
                    style={{ color: "var(--accent)", flexShrink: 0 }}
                  />
                </Link>
              </div>
            )}
            {/* Episode Info Panel */}
            {animeInfo && (
              <div
                className="mt-4 rounded-xl p-4 flex gap-4 items-start"
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                }}
              >
                {/* Poster */}
                <div
                  className="relative flex-shrink-0 overflow-hidden rounded-lg"
                  style={{ width: "80px", height: "110px" }}
                >
                  <Image
                    src={animeInfo.poster}
                    alt={animeInfo.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>

                {/* Info */}
                <div className="flex flex-col gap-2 flex-1 min-w-0">
                  <h3
                    className="text-lg font-black leading-tight"
                    style={{
                      fontFamily: "'Rajdhani', sans-serif",
                      color: "var(--text-primary)",
                    }}
                  >
                    {animeInfo.title}
                  </h3>

                  <p
                    className="text-sm font-bold"
                    style={{
                      color: "var(--accent)",
                      fontFamily: "'Rajdhani', sans-serif",
                    }}
                  >
                    {episodeTitle}
                  </p>

                  {animeInfo.description && (
                    <p
                      className="text-xs leading-relaxed line-clamp-2"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {animeInfo.description}
                    </p>
                  )}

                  {/* Quick actions */}
                  <div className="flex gap-2 mt-1">
                    <Link
                      href={`/anime/${animeId}`}
                      className="px-3 py-1.5 text-xs rounded font-bold"
                      style={{
                        background: "var(--bg-card)",
                        border: "1px solid var(--border)",
                        color: "var(--text-secondary)",
                        fontFamily: "'Rajdhani', sans-serif",
                      }}
                    >
                      View Details
                    </Link>

                    <button
                      className="px-3 py-1.5 text-xs rounded font-bold"
                      style={{
                        background: "var(--accent)",
                        color: "white",
                        fontFamily: "'Rajdhani', sans-serif",
                      }}
                    >
                      Add to Watchlist
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Mobile: Now watching + servers + episodes */}
            <div className="lg:hidden mt-3 space-y-3">
              <div
                className="flex items-start gap-3 p-3 rounded-xl"
                style={{
                  background: "rgba(233,30,140,0.06)",
                  border: "1px solid rgba(233,30,140,0.15)",
                  fontFamily: "'Rajdhani', sans-serif",
                }}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 animate-pulse"
                  style={{ background: "var(--accent)" }}
                />
                <div>
                  <div
                    className="font-bold text-sm"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {episodeTitle || "Loading..."}
                  </div>
                  <div
                    className="text-xs mt-0.5"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    If current server doesn&apos;t work please try other servers
                    beside.
                  </div>
                </div>
              </div>
              <div
                className="rounded-xl p-4 space-y-3"
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                }}
              >
                {subServers.length > 0 && (
                  <div className="space-y-2">
                    <div
                      className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
                      style={{
                        color: "var(--sub-color)",
                        fontFamily: "'Rajdhani', sans-serif",
                      }}
                    >
                      <Captions size={13} /> SUB:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {subServers.map((s) => {
                        const isActive =
                          activeServer === s.serverName.toLowerCase() &&
                          activeType === "sub";
                        return (
                          <button
                            key={`sub-${s.serverName}`}
                            onClick={() =>
                              handleServerChange(
                                s.serverName.toLowerCase(),
                                "sub",
                              )
                            }
                            className="px-3 py-1.5 rounded text-sm font-bold"
                            style={{
                              fontFamily: "'Rajdhani', sans-serif",
                              background: isActive
                                ? "var(--accent)"
                                : "var(--bg-card)",
                              border:
                                "1px solid " +
                                (isActive ? "var(--accent)" : "var(--border)"),
                              color: isActive
                                ? "white"
                                : "var(--text-secondary)",
                            }}
                          >
                            {s.serverName}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                {dubServers.length > 0 && (
                  <div className="space-y-2">
                    <div
                      className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
                      style={{
                        color: "var(--warning)",
                        fontFamily: "'Rajdhani', sans-serif",
                      }}
                    >
                      <Mic size={13} /> DUB:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {dubServers.map((s) => {
                        const isActive =
                          activeServer === s.serverName.toLowerCase() &&
                          activeType === "dub";
                        return (
                          <button
                            key={`dub-${s.serverName}`}
                            onClick={() =>
                              handleServerChange(
                                s.serverName.toLowerCase(),
                                "dub",
                              )
                            }
                            className="px-3 py-1.5 rounded text-sm font-bold"
                            style={{
                              fontFamily: "'Rajdhani', sans-serif",
                              background: isActive
                                ? "var(--warning)"
                                : "var(--bg-card)",
                              border:
                                "1px solid " +
                                (isActive ? "var(--warning)" : "var(--border)"),
                              color: isActive
                                ? "#000"
                                : "var(--text-secondary)",
                            }}
                          >
                            {s.serverName}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              {episodes.length > 0 && (
                <div>
                  <div className="section-title mb-3">Episodes</div>
                  <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-1.5">
                    {filteredEpisodes.map((epItem) => {
                      const isCurrent = ep
                        ? epItem.id.includes(`ep=${ep}`)
                        : false;
                      const isFiller = epItem.isFiller || epItem.filler;
                      return (
                        <Link
                          key={epItem.id}
                          href={`/watch/${epItem.id}`}
                          className="flex items-center justify-center h-9 rounded text-xs font-bold transition-all hover:scale-105"
                          style={{
                            fontFamily: "'Rajdhani', sans-serif",
                            background: isCurrent
                              ? "var(--accent)"
                              : isFiller
                                ? "rgba(255,170,0,0.1)"
                                : "var(--bg-card)",
                            border:
                              "1px solid " +
                              (isCurrent
                                ? "var(--accent)"
                                : isFiller
                                  ? "rgba(255,170,0,0.3)"
                                  : "var(--border)"),
                            color: isCurrent
                              ? "white"
                              : isFiller
                                ? "var(--warning)"
                                : "var(--text-secondary)",
                          }}
                        >
                          {epItem.episode_no}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <div
            className="hidden lg:flex flex-col flex-shrink-0 gap-3"
            style={{ width: "320px", position: "sticky", top: "80px" }}
          >
            {animeInfo && (
              <div
                className="rounded-xl overflow-hidden"
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                }}
              >
                <div className="relative w-full" style={{ aspectRatio: "3/4" }}>
                  <Image
                    src={animeInfo.poster}
                    alt={animeInfo.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to top, var(--bg-secondary) 0%, transparent 60%)",
                    }}
                  />
                </div>
                <div className="p-4 -mt-10 relative space-y-3">
                  <h2
                    className="text-lg font-black leading-tight"
                    style={{
                      fontFamily: "'Rajdhani', sans-serif",
                      color: "var(--text-primary)",
                    }}
                  >
                    {animeInfo.title}
                  </h2>
                  <div className="flex flex-wrap gap-1.5">
                    {animeInfo.rating && (
                      <span
                        className="text-xs px-2 py-0.5 rounded font-bold"
                        style={{
                          background: "var(--bg-card)",
                          border: "1px solid var(--border)",
                          color: "var(--text-secondary)",
                          fontFamily: "'Rajdhani', sans-serif",
                        }}
                      >
                        {animeInfo.rating}
                      </span>
                    )}
                    <span
                      className="text-xs px-2 py-0.5 rounded font-bold"
                      style={{
                        background: "rgba(0,212,170,0.1)",
                        border: "1px solid rgba(0,212,170,0.3)",
                        color: "var(--sub-color)",
                        fontFamily: "'Rajdhani', sans-serif",
                      }}
                    >
                      HD
                    </span>
                    {(animeInfo.episodes?.sub ?? episodes.length) > 0 && (
                      <span
                        className="badge-sub text-xs px-2 py-0.5 rounded font-bold"
                        style={{ fontFamily: "'Rajdhani', sans-serif" }}
                      >
                        ⊕ {animeInfo.episodes?.sub ?? episodes.length}
                      </span>
                    )}
                    {animeInfo.type && (
                      <span
                        className="text-xs px-2 py-0.5 rounded font-bold"
                        style={{
                          background: "var(--bg-card)",
                          border: "1px solid var(--border)",
                          color: "var(--text-secondary)",
                          fontFamily: "'Rajdhani', sans-serif",
                        }}
                      >
                        {animeInfo.type}
                      </span>
                    )}
                    {animeInfo.duration && (
                      <span
                        className="text-xs px-2 py-0.5 rounded font-bold"
                        style={{
                          background: "var(--bg-card)",
                          border: "1px solid var(--border)",
                          color: "var(--text-secondary)",
                          fontFamily: "'Rajdhani', sans-serif",
                        }}
                      >
                        {animeInfo.duration}
                      </span>
                    )}
                  </div>
                  {animeInfo.description && (
                    <p
                      className="text-xs leading-relaxed line-clamp-4"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {animeInfo.description}
                    </p>
                  )}
                  <Link
                    href={`/anime/${animeId}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold transition-colors hover:text-white"
                    style={{
                      color: "var(--accent)",
                      fontFamily: "'Rajdhani', sans-serif",
                    }}
                  >
                    View detail <ChevronRight size={12} />
                  </Link>
                </div>
              </div>
            )}

            {/* GitHub Follow Card */}
            <div
              className="rounded-xl p-5 space-y-4"
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={12}
                    fill={i < 4 ? "var(--warning)" : "none"}
                    style={{ color: "var(--warning)" }}
                  />
                ))}
                <span
                  className="text-xs ml-1 font-bold"
                  style={{
                    color: "var(--warning)",
                    fontFamily: "'Rajdhani', sans-serif",
                  }}
                >
                  Show Love
                </span>
              </div>
              <div>
                <p
                  className="font-black text-base leading-tight"
                  style={{
                    fontFamily: "'Rajdhani', sans-serif",
                    color: "var(--text-primary)",
                  }}
                >
                  Enjoying the site?
                </p>
                <p
                  className="text-xs mt-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Follow the developer on GitHub and support the project!
                </p>
              </div>
              <div
                className="flex items-center gap-3 p-3 rounded-lg"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "rgba(233,30,140,0.15)",
                    border: "1px solid rgba(233,30,140,0.3)",
                  }}
                >
                  <Github size={20} style={{ color: "var(--accent)" }} />
                </div>
                <div className="min-w-0">
                  <div
                    className="font-bold text-sm truncate"
                    style={{
                      fontFamily: "'Rajdhani', sans-serif",
                      color: "var(--text-primary)",
                    }}
                  >
                    {GITHUB_USERNAME}
                  </div>
                  <div
                    className="text-xs truncate"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    github.com/{GITHUB_USERNAME}
                  </div>
                </div>
              </div>
              <a
                href={`https://github.com/${GITHUB_USERNAME}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setFollowed(true)}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  fontFamily: "'Rajdhani', sans-serif",
                  background: followed
                    ? "rgba(0,212,170,0.15)"
                    : "linear-gradient(135deg, var(--accent), #6366f1)",
                  border: followed ? "1px solid rgba(0,212,170,0.4)" : "none",
                  color: followed ? "var(--sub-color)" : "white",
                  boxShadow: followed
                    ? "none"
                    : "0 4px 20px rgba(233,30,140,0.35)",
                  letterSpacing: "0.05em",
                }}
              >
                <Github size={16} />
                {followed ? "✓ Following" : "Follow on GitHub"}
              </a>
            </div>

            {/* More Seasons */}
            {animeInfo?.seasons && animeInfo.seasons.length > 1 && (
              <div
                className="rounded-xl p-4 space-y-3"
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                }}
              >
                <div className="section-title">More Seasons</div>
                <div className="space-y-2">
                  {animeInfo.seasons.map((season) => (
                    <Link
                      key={season.id}
                      href={`/anime/${season.id}`}
                      className="flex items-center gap-2 p-2 rounded-lg transition-all hover:scale-[1.01]"
                      style={{
                        background: season.isCurrent
                          ? "var(--accent-dim)"
                          : "var(--bg-card)",
                        border:
                          "1px solid " +
                          (season.isCurrent
                            ? "rgba(233,30,140,0.3)"
                            : "var(--border)"),
                      }}
                    >
                      <span
                        className="text-xs font-bold line-clamp-2 flex-1"
                        style={{
                          fontFamily: "'Rajdhani', sans-serif",
                          color: season.isCurrent
                            ? "var(--accent)"
                            : "var(--text-secondary)",
                        }}
                      >
                        {season.title}
                      </span>
                      {season.isCurrent && (
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded font-bold flex-shrink-0"
                          style={{
                            background: "var(--accent)",
                            color: "white",
                            fontFamily: "'Rajdhani', sans-serif",
                          }}
                        >
                          NOW
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── BOTTOM: Recommendations ── */}
      {(latestEpisode.length > 0 || topUpcoming.length > 0) && (
        <div className="w-full px-3 sm:px-6 py-6 space-y-8">
          {latestEpisode.length > 0 && (
            <AnimeGrid title="Latest Episodes Animes" anime={latestEpisode} />
          )}
          {topUpcoming.length > 0 && (
            <AnimeGrid title="Top Upcoming Animes" anime={topUpcoming} />
          )}
        </div>
      )}

      <div className="h-20" />
    </div>
  );
}
