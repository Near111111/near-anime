// /api/proxy/route.ts
import { NextRequest, NextResponse } from "next/server";

// MegaUp CDN domains — these need megaup.nl as referer
const MEGAUP_CDN_PATTERNS = [
  "net22lab.site",
  "code29wave.site",
  "hub26link.site",
];

// Kwik/AnimePahe CDN domains — these need kwik.cx as referer
const KWIK_CDN_PATTERNS = [
  "uwucdn.top",
  "owocdn.top",
  "vault-",
  "luf-y.cc",
  "luf-n.cc",
];

function isMegaUpCdn(url: string): boolean {
  return MEGAUP_CDN_PATTERNS.some((p) => url.includes(p));
}

function isKwikCdn(url: string): boolean {
  return KWIK_CDN_PATTERNS.some((p) => url.includes(p));
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  const referer = req.nextUrl.searchParams.get("referer");

  if (!url) return new NextResponse("Missing url", { status: 400 });

  let videoHost = "";
  try {
    videoHost = new URL(url).origin;
  } catch {
    return new NextResponse("Invalid url", { status: 400 });
  }

  // Determine correct referer based on CDN
  const resolvedReferer = isMegaUpCdn(url)
    ? "https://megaup.nl/"
    : isKwikCdn(url)
      ? "https://kwik.cx/"
      : referer || videoHost + "/";

  const resolvedOrigin = (() => {
    try {
      return new URL(resolvedReferer).origin;
    } catch {
      return videoHost;
    }
  })();

  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Referer: resolvedReferer,
        Origin: resolvedOrigin,
        Accept: "*/*",
        "Accept-Language": "en-US,en;q=0.9",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "cross-site",
      },
    });
  } catch (err) {
    console.error("[PROXY] Fetch error:", err);
    return new NextResponse("Fetch failed", { status: 502 });
  }

  if (!response.ok) {
    console.error(`[PROXY] Upstream returned ${response.status} for: ${url}`);
    return new NextResponse(`Upstream error: ${response.status}`, {
      status: response.status,
    });
  }

  const contentType = response.headers.get("content-type") || "";

  const isM3u8 =
    url.includes(".m3u8") ||
    contentType.includes("mpegurl") ||
    contentType.includes("x-mpegURL");

  if (isM3u8) {
    const text = await response.text();

    // If blocked, return 403
    if (
      text.trimStart().startsWith("<!DOCTYPE") ||
      text.trimStart().startsWith("<html")
    ) {
      console.error("[PROXY] Got HTML instead of m3u8 — stream is blocked");
      return new NextResponse("Stream blocked", { status: 403 });
    }

    const base = url.substring(0, url.lastIndexOf("/") + 1);

    // Pass kwik.cx as referer for all downstream segment requests
    const segmentReferer = encodeURIComponent(
      isKwikCdn(url) ? "https://kwik.cx/" : videoHost + "/",
    );

    const rewritten = text
      .split("\n")
      .map((line) => {
        const trimmed = line.trim();
        if (!trimmed) return line;

        // Rewrite URI= inside tags (e.g. #EXT-X-KEY URI="...")
        if (trimmed.startsWith("#") && trimmed.includes('URI="')) {
          return line.replace(/URI="([^"]+)"/g, (_, uri) => {
            const absolute = uri.startsWith("http")
              ? uri
              : new URL(uri, base).toString();
            return `URI="/api/proxy?url=${encodeURIComponent(absolute)}&referer=${segmentReferer}"`;
          });
        }

        // Keep all other # lines as-is
        if (trimmed.startsWith("#")) return line;

        // Absolute URLs
        if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
          return `/api/proxy?url=${encodeURIComponent(trimmed)}&referer=${segmentReferer}`;
        }

        // Relative URLs — resolve against base
        try {
          const absolute = new URL(trimmed, base).toString();
          return `/api/proxy?url=${encodeURIComponent(absolute)}&referer=${segmentReferer}`;
        } catch {
          return line;
        }
      })
      .join("\n");

    return new NextResponse(rewritten, {
      headers: {
        "Content-Type": "application/vnd.apple.mpegurl",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-cache",
      },
    });
  }

  // Binary segments (.ts files, encryption keys, etc.)
  const buffer = await response.arrayBuffer();

  // Detect content type properly
  const isKey = url.includes(".key") || url.includes("enc.key");
  const outputContentType = isKey
    ? "application/octet-stream"
    : contentType || "video/mp2t";

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": outputContentType,
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-cache",
    },
  });
}
