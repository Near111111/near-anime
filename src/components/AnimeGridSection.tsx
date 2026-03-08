"use client";

import Link from "next/link";
import Image from "next/image";
import type { Anime } from "@/types/anime";

function AnimeListItem({ anime }: { anime: Anime }) {
  return (
    <Link
      href={`/anime/${anime.id}`}
      className="flex items-center gap-3 group py-3 transition-colors rounded-lg hover:bg-[var(--bg-hover)] px-1 sm:px-3 sm:-mx-3"
    >
      {/* Poster */}
      <div className="relative flex-shrink-0 w-[50px] h-[68px] sm:w-[60px] sm:h-[80px] rounded-md overflow-hidden bg-[var(--bg-card)]">
        <Image
          src={anime.poster}
          alt={anime.title}
          fill
          sizes="60px"
          className="object-cover"
        />
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <h4
          className="font-bold text-[var(--text-primary)] line-clamp-2 group-hover:text-[var(--accent)] transition-colors leading-snug"
          style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "15px" }}
        >
          {anime.title}
        </h4>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {anime.tvInfo?.sub && (
            <span className="badge-sub flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold">
              <span style={{ fontSize: "9px" }}>CC</span>
              <span>{anime.tvInfo.sub}</span>
            </span>
          )}
          {anime.tvInfo?.dub && (
            <span className="badge-dub flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold">
              <span style={{ fontSize: "9px" }}>🎙</span>
              <span>{anime.tvInfo.dub}</span>
            </span>
          )}
          {anime.tvInfo?.showType && (
            <>
              <span className="text-[10px] text-[var(--text-secondary)]">
                ·
              </span>
              <span className="text-[12px] text-[var(--text-secondary)]">
                {anime.tvInfo.showType}
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function AnimeGridSection({
  topAiring,
  trending,
  favorite,
  completed,
}: {
  topAiring?: Anime[];
  trending?: Anime[];
  favorite?: Anime[];
  completed?: Anime[];
}) {
  const columns = [
    { title: "Top Airing Animes", data: topAiring },
    { title: "Trending Animes", data: trending },
    { title: "Favorite Animes", data: favorite },
    { title: "Completed Animes", data: completed },
  ].filter((col) => col.data && col.data.length > 0);

  if (columns.length === 0) return null;

  return (
    <section className="px-4 sm:px-6 md:px-10 py-6 sm:py-8 overflow-hidden">
      <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {columns.map((col) => (
          <div key={col.title} className="min-w-0 overflow-hidden">
            {/* Column header */}
            <h3
              className="font-black uppercase tracking-wider mb-5"
              style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: "18px",
                color: "var(--accent)",
              }}
            >
              {col.title}
            </h3>

            {/* List */}
            <div className="flex flex-col divide-y divide-[var(--border)]">
              {col.data!.slice(0, 5).map((anime) => (
                <AnimeListItem key={anime.id} anime={anime} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
