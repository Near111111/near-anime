"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, Menu, X } from "lucide-react";

export default function Navbar() {
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?keyword=${encodeURIComponent(query.trim())}`);
      setQuery("");
      setMenuOpen(false);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-1 group flex-shrink-0"
          >
            <span
              className="font-black text-2xl tracking-tight"
              style={{
                fontFamily: "'Rajdhani', sans-serif",
                background: "linear-gradient(135deg, #e91e8c, #ff6ec7)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              NEAR
            </span>
            <span
              className="font-bold text-2xl tracking-tight text-[var(--text-primary)]"
              style={{ fontFamily: "'Rajdhani', sans-serif" }}
            >
              ANIME
            </span>
          </Link>

          {/* Search */}
          <form
            onSubmit={handleSearch}
            className="hidden sm:flex items-center flex-1 max-w-sm mx-6"
          >
            <div
              className={`relative w-full transition-all duration-200 ${focused ? "scale-[1.02]" : ""}`}
            >
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="Search anime..."
                className="w-full h-8 pl-9 pr-4 rounded-full text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: focused
                    ? "1px solid var(--accent)"
                    : "1px solid rgba(255,255,255,0.08)",
                  boxShadow: focused
                    ? "0 0 12px rgba(233,30,140,0.15)"
                    : "none",
                }}
              />
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-secondary)]" />
            </div>
          </form>

          {/* Mobile toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors p-1"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="md:hidden border-t border-white/5 px-4 py-3 space-y-3"
          style={{ background: "rgba(13,13,24,0.98)" }}
        >
          <form onSubmit={handleSearch}>
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search anime..."
                className="w-full h-10 pl-10 pr-4 rounded-lg bg-[var(--bg-secondary)] border border-white/5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent)]/50"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
            </div>
          </form>
          {[["Home", "/"]].map(([label, href]) => (
            <Link
              key={label}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="block text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--accent)] uppercase tracking-wider"
              style={{ fontFamily: "'Rajdhani', sans-serif" }}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
