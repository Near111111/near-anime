"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Anime } from "@/types/anime";

function Top10Item({ anime, rank }: { anime: Anime; rank: number }) {
  const isTop3 = rank <= 3;

  return (
    <Link
      href={`/anime/${anime.id}`}
      className="flex items-center gap-4 group py-3.5 px-3 transition-all duration-200 hover:bg-[var(--bg-hover)] rounded-lg"
    >
      {/* Rank number */}
      <span
        className="flex-shrink-0 font-black text-center"
        style={{
          fontFamily: "'Rajdhani', sans-serif",
          fontSize: isTop3 ? "1.8rem" : "1.4rem",
          width: "32px",
          lineHeight: 1,
          color: isTop3 ? "var(--accent)" : "var(--text-secondary)",
          textShadow: isTop3 ? "0 0 20px var(--accent-glow)" : "none",
          WebkitTextStroke: isTop3 ? "none" : "0.5px rgba(255,255,255,0.15)",
        }}
      >
        {rank}
      </span>

      {/* Poster */}
      <div
        className="relative flex-shrink-0 rounded-md overflow-hidden"
        style={{
          width: "55px",
          height: "72px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
        }}
      >
        <Image
          src={anime.poster}
          alt={anime.title}
          fill
          sizes="55px"
          className="object-cover"
        />
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <h4
          className="font-bold text-[var(--text-primary)] line-clamp-2 group-hover:text-[var(--accent)] transition-colors leading-snug"
          style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "14px" }}
        >
          {anime.title}
        </h4>
        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
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

interface Top10Data {
  today?: Anime[];
  week?: Anime[];
  month?: Anime[];
  Today?: Anime[];
  Week?: Anime[];
  Month?: Anime[];
}

export default function Top10Section({
  top10,
}: {
  top10: Top10Data | Anime[];
}) {
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

  if (!activeList.length) {
    const firstNonEmpty = Object.entries(listsByTab).find(
      ([, v]) => v.length > 0,
    );
    if (!firstNonEmpty) return null;
  }

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: "var(--bg-secondary)",
        border: "1px solid var(--border)",
      }}
    >
      {/* Header + tabs */}
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{
          borderBottom: "1px solid var(--border)",
        }}
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
              className="px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all duration-200"
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

      {/* List */}
      <div className="px-2 py-1">
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
