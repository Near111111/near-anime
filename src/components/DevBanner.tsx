"use client";

import { Github, Facebook } from "lucide-react";

export default function DevBanner() {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: "var(--bg-secondary)",
        borderTop: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-10">
        {/* Desktop: horizontal row */}
        <div className="hidden sm:flex items-center gap-0 min-h-[240px]">
          {/* GIF character */}
          <div
            className="relative flex-shrink-0 self-end"
            style={{ width: "230px" }}
          >
            <img
              src="/wlc.gif"
              alt="Welcome"
              className="w-full h-auto object-contain"
              style={{
                filter: "drop-shadow(0 0 24px rgba(233,30,140,0.25))",
                maxHeight: "260px",
              }}
            />
          </div>

          {/* Branding */}
          <div className="flex-shrink-0 py-8 pl-5 pr-8">
            <div className="flex items-center gap-1.5">
              <span
                className="font-black text-3xl sm:text-4xl tracking-tight"
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
                className="font-bold text-3xl sm:text-4xl tracking-tight text-[var(--text-primary)]"
                style={{ fontFamily: "'Rajdhani', sans-serif" }}
              >
                Anime News!
              </span>
            </div>
            <p className="text-base text-[var(--text-secondary)] mt-2">
              Please follow my socials if you like the site -{" "}
              <span style={{ color: "var(--accent)" }} className="font-bold">
                Developer
              </span>
            </p>
          </div>

          {/* Desktop Social Cards */}
          <div className="flex-1 flex items-center justify-end gap-5 py-8">
            {[
              {
                label: "GITHUB",
                icon: <Github size={26} style={{ color: "var(--accent)" }} />,
                href: "https://github.com/Near111111",
                name: "Near111111",
              },
              {
                label: "FACEBOOK",
                icon: <Facebook size={26} style={{ color: "var(--accent)" }} />,
                href: "https://www.facebook.com/miduking1",
                name: "Jomar DC Aniñon",
              },
              {
                label: "TIKTOK",
                icon: (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                  </svg>
                ),
                href: "https://www.tiktok.com/@im.nearr",
                name: "@im.nearr",
              },
            ].map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group hidden md:block"
                style={{ textDecoration: "none" }}
              >
                <div
                  className="rounded-xl px-8 py-6 text-center transition-all duration-300 group-hover:scale-[1.03]"
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    minWidth: "180px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.border =
                      "1px solid rgba(233,30,140,0.4)";
                    e.currentTarget.style.boxShadow =
                      "0 0 20px rgba(233,30,140,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.border = "1px solid var(--border)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <p
                    className="text-sm font-bold uppercase tracking-widest mb-4"
                    style={{
                      fontFamily: "'Rajdhani', sans-serif",
                      color: "var(--accent)",
                    }}
                  >
                    {social.label}
                  </p>
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
                    style={{
                      background: "var(--accent-dim)",
                      border: "2px solid rgba(233,30,140,0.3)",
                    }}
                  >
                    {social.icon}
                  </div>
                  <p className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                    {social.name}
                  </p>
                </div>
              </a>
            ))}

            {/* Tablet: compact icons when cards don't fit */}
            <div className="flex md:hidden gap-3">
              {[
                {
                  href: "https://github.com/Near111111",
                  icon: <Github size={22} style={{ color: "var(--accent)" }} />,
                },
                {
                  href: "https://www.facebook.com/miduking1",
                  icon: (
                    <Facebook size={22} style={{ color: "var(--accent)" }} />
                  ),
                },
                {
                  href: "https://www.tiktok.com/@im.nearr",
                  icon: (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--accent)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                    </svg>
                  ),
                },
              ].map((s, i) => (
                <a
                  key={i}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110"
                  style={{
                    background: "var(--accent-dim)",
                    border: "2px solid rgba(233,30,140,0.3)",
                  }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile: vertical stacked layout */}
        <div className="sm:hidden py-6">
          <div className="flex items-center gap-4 mb-5">
            {/* Small GIF */}
            <div className="w-20 h-20 flex-shrink-0">
              <img
                src="/wlc.gif"
                alt="Welcome"
                className="w-full h-full object-contain"
                style={{
                  filter: "drop-shadow(0 0 16px rgba(233,30,140,0.25))",
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span
                  className="font-black text-xl tracking-tight"
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
                  className="font-bold text-xl tracking-tight text-[var(--text-primary)]"
                  style={{ fontFamily: "'Rajdhani', sans-serif" }}
                >
                  Anime News!
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Still Under Construction! –{" "}
                <span style={{ color: "var(--accent)" }} className="font-bold">
                  Developer
                </span>
              </p>
            </div>
          </div>

          {/* Mobile social icons row */}
          <div className="flex gap-3 justify-center">
            {[
              {
                href: "https://github.com/Near111111",
                icon: <Github size={20} style={{ color: "var(--accent)" }} />,
                name: "GitHub",
              },
              {
                href: "https://www.facebook.com/miduking1",
                icon: <Facebook size={20} style={{ color: "var(--accent)" }} />,
                name: "Facebook",
              },
              {
                href: "https://www.tiktok.com/@im.nearr",
                icon: (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                  </svg>
                ),
                name: "TikTok",
              },
            ].map((s, i) => (
              <a
                key={i}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex flex-col items-center gap-2 py-3 rounded-xl transition-all active:scale-95"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{
                    background: "var(--accent-dim)",
                    border: "2px solid rgba(233,30,140,0.3)",
                  }}
                >
                  {s.icon}
                </div>
                <span
                  className="text-xs font-bold text-[var(--text-secondary)]"
                  style={{ fontFamily: "'Rajdhani', sans-serif" }}
                >
                  {s.name}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
