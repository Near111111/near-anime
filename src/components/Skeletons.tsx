"use client";

// Base shimmer skeleton block
function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-shimmer rounded-lg ${className}`}
      style={{
        background:
          "linear-gradient(90deg, #16162a 25%, #1e1e3a 50%, #16162a 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.8s ease-in-out infinite",
      }}
    />
  );
}

export function AnimeCardSkeleton() {
  return (
    <div className="block">
      <div className="relative aspect-[3/4] rounded-xl overflow-hidden">
        <Skeleton className="w-full h-full rounded-xl" />
        <div className="absolute top-2 left-2">
          <Skeleton className="w-10 h-4 rounded-md" />
        </div>
      </div>
      <div className="mt-2 px-0.5 space-y-1.5">
        <Skeleton className="w-full h-3.5 rounded" />
        <Skeleton className="w-2/3 h-3.5 rounded" />
        <Skeleton className="w-1/3 h-3 rounded mt-1" />
      </div>
    </div>
  );
}

export function AnimeRowSkeleton({ title }: { title?: string }) {
  return (
    <section className="relative py-6">
      <div className="flex items-center justify-between mb-4 px-4 sm:px-6 max-w-[1400px] mx-auto">
        {title ? (
          <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
            {title}
          </h2>
        ) : (
          <Skeleton className="w-40 h-6 rounded-lg" />
        )}
        <div className="flex gap-1.5">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <Skeleton className="w-8 h-8 rounded-lg" />
        </div>
      </div>
      <div className="flex gap-4 overflow-hidden px-4 sm:px-6 max-w-[1400px] mx-auto">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-[160px] sm:w-[180px]"
            style={{ opacity: 1 - i * 0.1 }}
          >
            <AnimeCardSkeleton />
          </div>
        ))}
      </div>
    </section>
  );
}

export function HeroSkeleton() {
  return (
    <div className="relative w-full h-[70vh] min-h-[500px] max-h-[750px] overflow-hidden">
      <Skeleton className="absolute inset-0 rounded-none" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, var(--bg-primary) 0%, var(--bg-primary)/80 50%, transparent 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, var(--bg-primary) 0%, transparent 60%)",
        }}
      />
      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 h-full flex items-center">
        <div className="max-w-xl space-y-5">
          <Skeleton className="w-28 h-6 rounded-full" />
          <div className="space-y-3">
            <Skeleton className="w-full h-12 rounded-xl" />
            <Skeleton className="w-3/4 h-12 rounded-xl" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="w-16 h-7 rounded-lg" />
            <Skeleton className="w-20 h-7 rounded-lg" />
            <Skeleton className="w-16 h-7 rounded-lg" />
          </div>
          <div className="space-y-2">
            <Skeleton className="w-full h-4 rounded" />
            <Skeleton className="w-full h-4 rounded" />
            <Skeleton className="w-2/3 h-4 rounded" />
          </div>
          <div className="flex gap-3 pt-2">
            <Skeleton className="w-36 h-12 rounded-xl" />
            <Skeleton className="w-32 h-12 rounded-xl" />
          </div>
        </div>
      </div>
      <div className="absolute bottom-8 right-8 z-20 flex items-center gap-2">
        <Skeleton className="w-10 h-10 rounded-full" />
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="flex gap-1.5 ml-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton
              key={i}
              className={`h-1.5 rounded-full ${i === 0 ? "w-6" : "w-1.5"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function HomePageSkeleton() {
  return (
    <div className="pb-16">
      <HeroSkeleton />
      <div className="space-y-2 mt-4">
        <AnimeRowSkeleton title="Trending Now" />
        <AnimeRowSkeleton title="Top Airing" />
        <AnimeRowSkeleton title="Most Popular" />
        <AnimeRowSkeleton />
      </div>
    </div>
  );
}

export function AnimeDetailSkeleton() {
  return (
    <div className="min-h-screen pt-16">
      <div className="relative h-[45vh] overflow-hidden">
        <Skeleton className="absolute inset-0 rounded-none" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, var(--bg-primary) 0%, transparent 60%)",
          }}
        />
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 -mt-48 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-shrink-0">
            <Skeleton className="w-48 sm:w-56 aspect-[3/4] rounded-xl" />
          </div>

          <div className="flex-1 space-y-4 pt-4 md:pt-16">
            <Skeleton className="w-3/4 h-10 rounded-xl" />
            <Skeleton className="w-1/3 h-4 rounded" />

            {/* Tags - fixed: removed style prop, use static Tailwind classes */}
            <div className="flex gap-2 flex-wrap">
              {["w-20", "w-24", "w-20", "w-20"].map((w, i) => (
                <Skeleton key={i} className={`${w} h-7 rounded-lg`} />
              ))}
            </div>

            <div className="space-y-2 max-w-2xl">
              <Skeleton className="w-full h-4 rounded" />
              <Skeleton className="w-full h-4 rounded" />
              <Skeleton className="w-full h-4 rounded" />
              <Skeleton className="w-2/3 h-4 rounded" />
            </div>

            <Skeleton className="w-44 h-12 rounded-xl" />
          </div>
        </div>

        {/* Episodes - fixed: removed style prop, use opacity classes */}
        <div className="mt-12">
          <div className="flex items-center gap-3 mb-4">
            <Skeleton className="w-32 h-7 rounded-lg" />
            <Skeleton className="w-16 h-5 rounded" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {Array.from({ length: 24 }).map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
      <div className="h-20" />
    </div>
  );
}

export function SearchSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: 18 }).map((_, i) => (
        <div key={i} style={{ opacity: 1 - i * 0.04 }}>
          <AnimeCardSkeleton />
        </div>
      ))}
    </div>
  );
}

export function WatchPageSkeleton() {
  return (
    <div className="min-h-screen pt-16 bg-black">
      <div className="w-full max-w-[1200px] mx-auto">
        <div className="relative aspect-video bg-[#0a0a12] rounded-b-xl overflow-hidden">
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <div
              className="w-16 h-16 rounded-full border-2 border-[var(--accent)]/30 flex items-center justify-center"
              style={{ animation: "pulse-glow 2s ease-in-out infinite" }}
            >
              <div
                className="w-0 h-0 ml-1.5"
                style={{
                  borderTop: "10px solid transparent",
                  borderBottom: "10px solid transparent",
                  borderLeft: "18px solid rgba(0,212,170,0.4)",
                }}
              />
            </div>
            <Skeleton className="w-48 h-3 rounded-full" />
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#16162a] overflow-hidden">
              <div
                className="h-full bg-[var(--accent)]/30"
                style={{
                  width: "30%",
                  animation: "shimmer 2s ease-in-out infinite",
                  background:
                    "linear-gradient(90deg, transparent, rgba(0,212,170,0.4), transparent)",
                  backgroundSize: "200% 100%",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 py-6 space-y-6">
        {["SUB", "DUB"].map((label) => (
          <div key={label} className="space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="w-4 h-4 rounded" />
              <Skeleton className="w-10 h-4 rounded" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="w-20 h-9 rounded-lg" />
              <Skeleton className="w-20 h-9 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
