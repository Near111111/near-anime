"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { searchAnime } from "@/lib/api";
import AnimeCard from "@/components/AnimeCard";
import { SearchSkeleton } from "@/components/Skeletons";
import { SearchX, ChevronLeft, ChevronRight } from "lucide-react";
import type { Anime } from "@/types/anime";

function SearchResults() {
  const searchParams = useSearchParams();
  const keyword = searchParams.get("keyword") || "";
  const [results, setResults] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!keyword) return;

    const fetchResults = async () => {
      setLoading(true);
      try {
        const data = await searchAnime(keyword, page);
        setResults(data?.data || []);
        setTotalPages(data?.totalPage || 1);
      } catch {
        // handle error
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [keyword, page]);

  if (loading) return <SearchSkeleton />;

  if (!results.length) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <SearchX className="w-16 h-16 text-[var(--text-secondary)]" />
        <p className="text-[var(--text-secondary)]">
          No results for &quot;{keyword}&quot;
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {results.map((anime, i) => (
          <div
            key={anime.id || i}
            className="animate-fade-in-up opacity-0"
            style={{ animationDelay: `${i * 0.04}s` }}
          >
            <AnimeCard anime={anime} />
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-9 h-9 rounded flex items-center justify-center text-sm font-bold disabled:opacity-30 transition-all"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
            }}
          >
            <ChevronLeft size={15} />
          </button>
          {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className="w-9 h-9 rounded text-sm font-bold transition-all"
              style={{
                background: page === i + 1 ? "var(--accent)" : "var(--bg-card)",
                border:
                  page === i + 1
                    ? "1px solid var(--accent)"
                    : "1px solid var(--border)",
                color: page === i + 1 ? "white" : "var(--text-secondary)",
                fontFamily: "'Rajdhani', sans-serif",
              }}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="w-9 h-9 rounded flex items-center justify-center text-sm font-bold disabled:opacity-30 transition-all"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
            }}
          >
            <ChevronRight size={15} />
          </button>
        </div>
      )}
    </>
  );
}

// Inner component that uses useSearchParams — must be inside Suspense
function SearchPageContent() {
  const searchParams = useSearchParams();
  const keyword = searchParams.get("keyword") || "";

  return (
    <div className="min-h-screen pt-20 pb-16 px-4 sm:px-6 max-w-[1400px] mx-auto">
      <div className="mb-6">
        <div className="section-title">Search Results</div>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Showing results for{" "}
          <span style={{ color: "var(--accent)" }}>&quot;{keyword}&quot;</span>
        </p>
      </div>
      <Suspense fallback={<SearchSkeleton />}>
        <SearchResults />
      </Suspense>
    </div>
  );
}

// Outer page just wraps everything in Suspense
export default function SearchPage() {
  return (
    <Suspense fallback={<SearchSkeleton />}>
      <SearchPageContent />
    </Suspense>
  );
}
