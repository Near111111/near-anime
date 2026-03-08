"use client";

import Link from "next/link";
import Image from "next/image";
import { Play } from "lucide-react";
import type { Anime } from "@/types/anime";

export default function AnimeCard({
  anime,
  rank,
}: {
  anime: Anime;
  rank?: number;
}) {
  const isTrending = rank !== undefined;

  return (
    <Link href={`/anime/${anime.id}`} className="anime-card block group">
      {isTrending ? (
        /* ── Trending layout: vertical title outside left + poster ── */
        <div>
          <div className="flex" style={{ height: "220px" }}>
            {/* Vertical title strip with rank at top */}
            <div
              className="flex-shrink-0 flex items-center justify-center relative overflow-hidden"
              style={{ width: "34px", height: "220px" }}
            >
              <span
                className="leading-none"
                style={{
                  fontFamily: "'Rajdhani', sans-serif",
                  writingMode: "vertical-rl",
                  textOrientation: "mixed",
                  transform: "rotate(180deg)",
                  fontSize: "16px",
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  color: "rgba(255,255,255,1)",
                  height: "210px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  display: "block",
                  lineHeight: "34px",
                }}
              >
                <span
                  style={{
                    color: "var(--accent)",
                    fontWeight: 800,
                    fontSize: "18px",
                  }}
                >
                  {String(rank).padStart(2, "0")}
                </span>
                {"  "}
                {anime.title.length > 20
                  ? anime.title.slice(0, 20) + " ..."
                  : anime.title}
              </span>
            </div>

            {/* Poster */}
            <div
              className="relative flex-1 rounded-md overflow-hidden bg-[var(--bg-card)]"
              style={{ height: "220px" }}
            >
              <Image
                src={anime.poster}
                alt={anime.title}
                fill
                sizes="(max-width: 640px) 50vw, 20vw"
                className="object-cover card-image transition-all duration-300"
              />
              {/* Hover overlay */}
              <div
                className="card-overlay absolute inset-0 opacity-0 transition-opacity duration-200 flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{
                    background: "var(--accent)",
                    boxShadow: "0 0 18px var(--accent-glow)",
                  }}
                >
                  <Play size={14} fill="white" className="ml-0.5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── Normal layout: poster + title below ── */
        <div>
          <div className="relative aspect-[2/3] rounded-md overflow-hidden bg-[var(--bg-card)]">
            <Image
              src={anime.poster}
              alt={anime.title}
              fill
              sizes="(max-width: 640px) 50vw, 20vw"
              className="object-cover card-image transition-all duration-300"
            />
            {/* Hover overlay */}
            <div
              className="card-overlay absolute inset-0 opacity-0 transition-opacity duration-200 flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)",
              }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  background: "var(--accent)",
                  boxShadow: "0 0 18px var(--accent-glow)",
                }}
              >
                <Play size={14} fill="white" className="ml-0.5" />
              </div>
            </div>

            {/* Type badge */}
            {anime.tvInfo?.showType && (
              <div
                className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider text-white"
                style={{ background: "var(--accent)" }}
              >
                {anime.tvInfo.showType}
              </div>
            )}

            {/* Sub/Dub badges */}
            <div className="absolute bottom-1.5 right-1.5 flex flex-col gap-1">
              {anime.tvInfo?.sub && (
                <div className="badge-sub flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold">
                  <span style={{ fontSize: "8px" }}>CC</span>
                  <span>{anime.tvInfo.sub}</span>
                </div>
              )}
              {anime.tvInfo?.dub && (
                <div className="badge-dub flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold">
                  <span style={{ fontSize: "8px" }}>🎙</span>
                  <span>{anime.tvInfo.dub}</span>
                </div>
              )}
            </div>
          </div>

          {/* Title below */}
          <div className="mt-1.5 px-0.5">
            <h3
              className="text-xs font-bold text-[var(--text-primary)] line-clamp-2 group-hover:text-[var(--accent)] transition-colors"
              style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: "0.82rem",
              }}
            >
              {anime.title}
            </h3>
          </div>
        </div>
      )}
    </Link>
  );
}
