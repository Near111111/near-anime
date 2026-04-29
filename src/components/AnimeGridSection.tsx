"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Anime } from "@/types/anime";

function AnimeListItem({ anime }: { anime: Anime }) {
  return (
    <Link
      href={`/anime/${anime.id}`}
      className="flex items-center gap-3 group py-3 transition-colors rounded-lg hover:bg-[var(--bg-hover)] px-1 sm:px-3 sm:-mx-3"
    >
      <div className="relative flex-shrink-0 w-[50px] h-[68px] sm:w-[60px] sm:h-[80px] rounded-md overflow-hidden bg-[var(--bg-card)]">
        <Image
          src={anime.poster}
          alt={anime.title}
          fill
          sizes="60px"
          className="object-cover"
        />
      </div>
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

interface Top10Data {
  today?: Anime[];
  week?: Anime[];
  month?: Anime[];
  Today?: Anime[];
  Week?: Anime[];
  Month?: Anime[];
}

function Top10Item({ anime, rank }: { anime: Anime; rank: number }) {
  const isTop3 = rank <= 3;
  return (
    <Link
      href={`/anime/${anime.id}`}
      className="flex items-center gap-3 group py-3 px-3 transition-all duration-200 hover:bg-[var(--bg-hover)] rounded-lg"
    >
      <span
        className="flex-shrink-0 font-black text-center"
        style={{
          fontFamily: "'Rajdhani', sans-serif",
          fontSize: isTop3 ? "1.6rem" : "1.25rem",
          width: "28px",
          lineHeight: 1,
          color: isTop3 ? "var(--accent)" : "var(--text-secondary)",
          textShadow: isTop3 ? "0 0 20px var(--accent-glow)" : "none",
        }}
      >
        {rank}
      </span>
      <div
        className="relative flex-shrink-0 rounded-md overflow-hidden"
        style={{
          width: "48px",
          height: "64px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
        }}
      >
        <Image
          src={anime.poster}
          alt={anime.title}
          fill
          sizes="48px"
          className="object-cover"
        />
      </div>
      <div className="min-w-0 flex-1">
        <h4
          className="font-bold text-[var(--text-primary)] line-clamp-2 group-hover:text-[var(--accent)] transition-colors leading-snug"
          style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "13px" }}
        >
          {anime.title}
        </h4>
        <div className="flex items-center gap-1 mt-1 flex-wrap">
          {anime.tvInfo?.sub && (
            <span className="badge-sub flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold">
              <span style={{ fontSize: "8px" }}>CC</span>
              <span>{anime.tvInfo.sub}</span>
            </span>
          )}
          {anime.tvInfo?.dub && (
            <span className="badge-dub flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold">
              <span style={{ fontSize: "8px" }}>🎙</span>
              <span>{anime.tvInfo.dub}</span>
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function Top10Sidebar({ top10 }: { top10: Top10Data | Anime[] }) {
  const [activeTab, setActiveTab] = useState<"today" | "week" | "month">(
    "today",
  );

  const tabs = [
    { key: "today" as const, label: "Today" },
    { key: "week" as const, label: "Week" },
    { key: "month" as const, label: "Month" },
  ];

  let listsByTab: Record<string, Anime[]> = { today: [], week: [], month: [] };

  if (Array.isArray(top10)) {
    listsByTab = { today: top10, week: top10, month: top10 };
  } else if (top10 && typeof top10 === "object") {
    listsByTab = {
      today: top10.today || top10.Today || [],
      week: top10.week || top10.Week || [],
      month: top10.month || top10.Month || [],
    };
  }

  const activeList = listsByTab[activeTab] || [];

  return (
    <div
      className="rounded-xl flex flex-col"
      style={{
        background: "var(--bg-secondary)",
        border: "1px solid var(--border)",
        maxHeight: "570px",
        overflow: "hidden",
      }}
    >
      {/* Header + tabs */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <h3
          className="font-black uppercase tracking-wider"
          style={{
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: "18px",
            color: "var(--accent)",
          }}
        >
          Top 10
        </h3>
        <div
          className="flex rounded-lg overflow-hidden"
          style={{ border: "1px solid var(--border)" }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all duration-200"
              style={{
                background:
                  activeTab === tab.key ? "var(--accent)" : "transparent",
                color: activeTab === tab.key ? "#fff" : "var(--text-secondary)",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable list */}
      <div
        className="overflow-y-auto flex-1 px-1 py-1"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "var(--border) transparent",
        }}
      >
        {activeList.slice(0, 10).map((anime, i) => (
          <div key={anime.id}>
            <Top10Item anime={anime} rank={i + 1} />
            {i < Math.min(activeList.length, 10) - 1 && (
              <div
                className="mx-3"
                style={{ borderBottom: "1px solid var(--border)" }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AnimeGridSection({
  topAiring,
  trending,
  favorite,
  completed,
  top10,
}: {
  topAiring?: Anime[];
  trending?: Anime[];
  favorite?: Anime[];
  completed?: Anime[];
  top10?: Top10Data | Anime[] | null;
}) {
  const columns = [
    { title: "Top Airing Animes", data: topAiring },
    { title: "Trending Animes", data: trending },
    { title: "Favorite Animes", data: favorite },
    { title: "Completed Animes", data: completed },
  ].filter((col) => col.data && col.data.length > 0);

  if (columns.length === 0) return null;

  const hasTop10 = top10 != null;

  return (
    <section className="px-4 sm:px-6 md:px-10 py-6 sm:py-8 overflow-hidden">
      <div className="flex gap-6 lg:gap-8 items-start">
        {/* Left: anime columns grid */}
        <div className="flex-1 min-w-0">
          <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {columns.map((col) => (
              <div key={col.title} className="min-w-0 overflow-hidden">
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
                <div className="flex flex-col divide-y divide-[var(--border)]">
                  {col.data!.slice(0, 5).map((anime) => (
                    <AnimeListItem key={anime.id} anime={anime} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Top 10 sidebar — desktop only */}
        {hasTop10 && (
          <div
            className="hidden lg:block flex-shrink-0 self-start sticky top-[72px]"
            style={{ width: "300px" }}
          >
            <Top10Sidebar top10={top10!} />
          </div>
        )}
      </div>

      {/* Mobile: Top 10 shown below */}
      {hasTop10 && (
        <div className="lg:hidden mt-6">
          <Top10Sidebar top10={top10!} />
        </div>
      )}
    </section>
  );
}
