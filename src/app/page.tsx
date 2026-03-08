"use client";

import { useEffect, useState } from "react";
import { getHome, getTopTen } from "@/lib/api";
import HeroSpotlight from "@/components/HeroSpotlight";
import AnimeRow from "@/components/AnimeRow";
import AnimeGridSection from "@/components/AnimeGridSection";
import AnimeGrid from "@/components/AnimeGrid";
import Top10Section from "@/components/Top10Section";
import DevBanner from "@/components/DevBanner";
import { HomePageSkeleton } from "@/components/Skeletons";
import type { HomeData, Anime } from "@/types/anime";

export default function HomePage() {
  const [data, setData] = useState<HomeData | null>(null);
  const [top10Data, setTop10Data] = useState<
    { today?: Anime[]; week?: Anime[]; month?: Anime[] } | Anime[] | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Main data — required for the page
    getHome()
      .then((homeRes) => {
        setData(homeRes);
        setLoading(false);
      })
      .catch(() => {
        setError(
          "Failed to load. Make sure the anime API is running on port 4444.",
        );
        setLoading(false);
      });

    // Top 10 — background fetch, won't block page
    getTopTen()
      .then((res) => {
        if (res) setTop10Data(res);
      })
      .catch(() => {});
  }, []);

  if (loading) return <HomePageSkeleton />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 px-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto text-2xl"
            style={{
              background: "rgba(255,68,102,0.1)",
              border: "1px solid rgba(255,68,102,0.2)",
            }}
          >
            ⚠️
          </div>
          <p
            className="text-lg font-black"
            style={{
              fontFamily: "'Rajdhani', sans-serif",
              color: "var(--danger)",
            }}
          >
            Connection Error
          </p>
          <p className="text-sm text-[var(--text-secondary)] max-w-sm">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 rounded-full font-bold text-sm text-white transition-all hover:scale-105"
            style={{ background: "var(--accent)" }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="pb-16">
      {data.spotlights && <HeroSpotlight spotlights={data.spotlights} />}

      <div className="space-y-1 mt-2">
        {/* Trending row */}
        {data.trending && (
          <AnimeRow title="Trending" anime={data.trending} showRank />
        )}

        {/* Dev Banner Section */}
        <DevBanner />

        {/* 4-column grid section */}
        <AnimeGridSection
          topAiring={data.topAiring}
          trending={data.mostPopular}
          favorite={data.mostFavorite}
          completed={data.latestCompleted}
        />

        {/* Latest Episodes grid + Top 10 sidebar */}
        <section className="px-4 sm:px-6 md:px-10 py-6">
          <div className="flex gap-6 lg:gap-8">
            {/* Left: grids */}
            <div className="flex-1 min-w-0 space-y-8">
              {data.latestEpisode && (
                <AnimeGrid
                  title="Latest Episodes Animes"
                  anime={data.latestEpisode}
                />
              )}
              {data.topUpcoming && (
                <AnimeGrid
                  title="Top Upcoming Animes"
                  anime={data.topUpcoming}
                />
              )}

              {/* Mobile: Top 10 shown inline */}
              {(top10Data || data.top10) && (
                <div className="lg:hidden">
                  <Top10Section top10={top10Data || data.top10!} />
                </div>
              )}
            </div>

            {/* Right: Top 10 sidebar — desktop only */}
            {(top10Data || data.top10) && (
              <div
                className="hidden lg:block flex-shrink-0"
                style={{ width: "320px" }}
              >
                <div className="sticky top-[72px]">
                  <Top10Section top10={top10Data || data.top10!} />
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
