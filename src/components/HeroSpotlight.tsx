"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Tv, Clock, CalendarDays } from "lucide-react";
import type { SpotlightAnime } from "@/types/anime";

export default function HeroSpotlight({
  spotlights,
}: {
  spotlights: SpotlightAnime[];
}) {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % spotlights.length);
        setIsTransitioning(false);
      }, 400);
    }, 7000);
    return () => clearInterval(timer);
  }, [spotlights.length]);

  if (!spotlights?.length) return null;
  const anime = spotlights[current];

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        height: "calc(100vh - 56px)",
        maxHeight: "720px",
        minHeight: "320px",
        background: "var(--bg-primary)",
      }}
    >
      {/* ── Artwork — right 65% on desktop, full width on mobile ── */}
      <div className="absolute top-0 right-0 bottom-0 w-full sm:w-[70%]">
        <div
          className="relative w-full h-full"
          style={{
            opacity: isTransitioning ? 0 : 1,
            transition: "opacity 0.4s ease",
          }}
        >
          <Image
            src={anime.poster}
            alt={anime.title}
            fill
            priority
            className="object-cover object-top"
            sizes="70vw"
          />
        </div>

        {/* Left fade */}
        <div
          className="absolute inset-0 pointer-events-none hidden sm:block"
          style={{
            background:
              "linear-gradient(to right, rgba(13,13,24,1) 0%, rgba(13,13,24,0.85) 15%, rgba(13,13,24,0.4) 40%, transparent 65%)",
          }}
        />
        {/* Mobile: full overlay for readability */}
        <div
          className="absolute inset-0 pointer-events-none sm:hidden"
          style={{
            background:
              "linear-gradient(to top, rgba(13,13,24,1) 0%, rgba(13,13,24,0.85) 30%, rgba(13,13,24,0.5) 60%, rgba(13,13,24,0.3) 100%)",
          }}
        />
        {/* Bottom fade */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, rgba(13,13,24,0.95) 0%, rgba(13,13,24,0.3) 20%, transparent 45%)",
          }}
        />
        {/* Top fade for navbar blend */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, rgba(13,13,24,0.4) 0%, transparent 15%)",
          }}
        />
      </div>

      {/* ── Full-width bottom fade into page bg ── */}
      <div
        className="absolute bottom-0 left-0 right-0 z-[5] pointer-events-none"
        style={{
          height: "180px",
          background:
            "linear-gradient(to top, rgba(13,13,24,1) 0%, rgba(13,13,24,0.6) 40%, transparent 100%)",
        }}
      />

      {/* ── Left content ── */}
      <div className="relative z-10 h-full flex items-end sm:items-start pb-20 sm:pb-0 pt-0 sm:pt-[8%] px-4 sm:px-8 md:px-10 lg:px-12">
        <div
          className="max-w-xl flex flex-col gap-2 sm:gap-3"
          style={{
            opacity: isTransitioning ? 0 : 1,
            transform: isTransitioning ? "translateY(10px)" : "translateY(0)",
            transition: "opacity 0.4s ease, transform 0.4s ease",
          }}
        >
          {/* Rank badge */}
          {anime.rank && (
            <span
              className="inline-block w-fit text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
              style={{
                color: "var(--accent)",
                background: "var(--accent-dim)",
                border: "1px solid rgba(233, 30, 140, 0.25)",
              }}
            >
              #{anime.rank} Spotlight
            </span>
          )}

          {/* Title */}
          <h1
            className="font-black leading-[1.08]"
            style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: "clamp(1.8rem, 5vw, 4rem)",
              textShadow: "0 4px 30px rgba(0,0,0,0.6)",
              color: "var(--text-primary)",
            }}
          >
            {anime.title}
          </h1>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {anime.tvInfo?.showType && (
              <span className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
                <Tv size={14} className="text-[var(--accent)]" />
                {anime.tvInfo.showType}
              </span>
            )}
            {anime.duration && (
              <span className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
                <Clock size={14} />
                {anime.duration}
              </span>
            )}
            {anime.otherInfo && anime.otherInfo.length > 0 && (
              <span className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
                <CalendarDays size={14} />
                {anime.otherInfo[0]}
              </span>
            )}

            {/* Rating badge */}
            {anime.tvInfo?.rating && (
              <span
                className="px-2.5 py-0.5 rounded text-[10px] font-extrabold tracking-wider uppercase"
                style={{ background: "var(--accent)", color: "#fff" }}
              >
                {anime.tvInfo.rating}
              </span>
            )}

            {/* Sub / Dub */}
            {anime.tvInfo?.sub && (
              <span className="badge-sub flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold">
                <span>CC</span>
                <span>{anime.tvInfo.sub}</span>
              </span>
            )}
            {anime.tvInfo?.dub && (
              <span className="badge-dub flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold">
                <span>🎙</span>
                <span>{anime.tvInfo.dub}</span>
              </span>
            )}
          </div>

          {/* Description - hidden on very small screens */}
          {anime.description && (
            <p
              className="hidden sm:block text-sm leading-relaxed line-clamp-3 max-w-lg"
              style={{ color: "var(--text-secondary)" }}
            >
              {anime.description}
            </p>
          )}

          {/* Watch Now */}
          <div className="pt-1">
            <Link
              href={`/anime/${anime.id}`}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full font-bold text-sm text-white transition-all duration-200 hover:scale-105 hover:brightness-110"
              style={{
                background: "var(--accent)",
                boxShadow:
                  "0 0 24px var(--accent-glow), 0 4px 16px rgba(0,0,0,0.3)",
              }}
            >
              <Play size={16} fill="white" />
              Watch Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
