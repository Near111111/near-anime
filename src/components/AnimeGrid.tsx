"use client";

import Link from "next/link";
import Image from "next/image";
import type { Anime } from "@/types/anime";

function GridCard({ anime }: { anime: Anime }) {
  return (
    <Link href={`/anime/${anime.id}`} className="anime-card block group">
      <div className="relative aspect-[2/3] rounded-md overflow-hidden bg-[var(--bg-card)]">
        <Image
          src={anime.poster}
          alt={anime.title}
          fill
          sizes="(max-width: 640px) 33vw, 16vw"
          className="object-cover card-image transition-all duration-300"
        />

        {/* Type badge top-left */}
        {anime.tvInfo?.showType && (
          <div
            className="absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider text-white"
            style={{ background: "var(--accent)" }}
          >
            {anime.tvInfo.showType}
            {anime.tvInfo.eps ? ` (${anime.tvInfo.eps} EPS)` : ""}
          </div>
        )}

        {/* Sub badge bottom-right */}
        <div className="absolute bottom-2 right-2 flex flex-col gap-1">
          {anime.tvInfo?.sub && (
            <div className="badge-sub flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold">
              <span style={{ fontSize: "8px" }}>CC</span>
              <span>{anime.tvInfo.sub}</span>
            </div>
          )}
        </div>

        {/* Hover overlay */}
        <div
          className="card-overlay absolute inset-0 opacity-0 transition-opacity duration-200 flex items-center justify-center"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)",
          }}
        />
      </div>

      {/* Title + meta below */}
      <div className="mt-2 px-0.5">
        <h3
          className="font-bold text-[var(--text-primary)] line-clamp-2 group-hover:text-[var(--accent)] transition-colors leading-snug"
          style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "14px" }}
        >
          {anime.title}
        </h3>
        <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[var(--text-secondary)]">
          {anime.tvInfo?.showType && <span>{anime.tvInfo.showType}</span>}
          {anime.duration && (
            <>
              <span>·</span>
              <span>{anime.duration}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function AnimeGrid({
  title,
  anime,
}: {
  title: string;
  anime: Anime[];
}) {
  if (!anime?.length) return null;

  return (
    <div>
      {/* Section title */}
      <div className="section-title mb-4">{title}</div>

      {/* 6-col grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
        {anime.slice(0, 12).map((item) => (
          <GridCard key={item.id} anime={item} />
        ))}
      </div>
    </div>
  );
}
