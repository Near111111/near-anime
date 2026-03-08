"use client";

import Link from "next/link";
import { Github, Facebook, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer
      style={{
        background: "var(--bg-secondary)",
        borderTop: "1px solid var(--border)",
      }}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10 py-8 sm:py-10">
        {/* Top row: Logo + Nav + Socials */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-8">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-1 group flex-shrink-0"
          >
            <span
              className="font-black text-3xl tracking-tight"
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
              className="font-bold text-3xl tracking-tight text-[var(--text-primary)]"
              style={{ fontFamily: "'Rajdhani', sans-serif" }}
            >
              ANIME
            </span>
          </Link>

          {/* Social Icons */}
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/Near111111"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.border = "1px solid rgba(233,30,140,0.5)";
                e.currentTarget.style.boxShadow =
                  "0 0 12px rgba(233,30,140,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.border = "1px solid var(--border)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <Github size={18} style={{ color: "var(--text-secondary)" }} />
            </a>
            <a
              href="https://www.facebook.com/miduking1"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.border = "1px solid rgba(233,30,140,0.5)";
                e.currentTarget.style.boxShadow =
                  "0 0 12px rgba(233,30,140,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.border = "1px solid var(--border)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <Facebook size={18} style={{ color: "var(--text-secondary)" }} />
            </a>
            <a
              href="https://www.tiktok.com/@im.nearr"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.border = "1px solid rgba(233,30,140,0.5)";
                e.currentTarget.style.boxShadow =
                  "0 0 12px rgba(233,30,140,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.border = "1px solid var(--border)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--text-secondary)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
              </svg>
            </a>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: "1px", background: "var(--border)" }} />

        {/* Bottom row: Disclaimer + Copyright */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mt-6">
          <div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-md">
              NearAnime does not store any files on our server, we only link to
              the media which is hosted on 3rd party services.
            </p>
          </div>
          <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5 flex-shrink-0 flex-wrap">
            © NEARANIME All rights reserved.{" "}
          </p>
        </div>
      </div>
    </footer>
  );
}
