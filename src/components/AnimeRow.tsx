"use client";

import { useRef } from "react";
import AnimeCard from "./AnimeCard";
import type { Anime } from "@/types/anime";

export default function AnimeRow({
  title,
  anime,
  showRank = false,
}: {
  title: string;
  anime: Anime[];
  showRank?: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!anime?.length) return null;

  return (
    <section className="py-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-4 sm:px-8">
        <div className="section-title">{title}</div>
      </div>

      {/* Cards row */}
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto no-scrollbar px-4 sm:px-8"
      >
        {anime.map((item, i) => (
          <div key={item.id || i} className="flex-1 min-w-[110px]">
            <AnimeCard anime={item} rank={showRank ? i + 1 : undefined} />
          </div>
        ))}
      </div>
    </section>
  );
}
