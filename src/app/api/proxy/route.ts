// /api/proxy/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) return new NextResponse("Missing url", { status: 400 });

  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Referer: "https://megacloud.blog/",
      Origin: "https://megacloud.blog",
      Accept: "*/*",
      "Accept-Language": "en-US,en;q=0.9",
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "cross-site",
    },
  });

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
      return new NextResponse("Stream blocked", { status: 403 });
    }

    const base = url.substring(0, url.lastIndexOf("/") + 1);

    const rewritten = text
      .split("\n")
      .map((line) => {
        const trimmed = line.trim();
        if (!trimmed) return line;

        if (trimmed.startsWith("#") && trimmed.includes('URI="')) {
          return line.replace(/URI="([^"]+)"/g, (_, uri) => {
            const absolute = uri.startsWith("http")
              ? uri
              : new URL(uri, base).toString();
            return `URI="/api/proxy?url=${encodeURIComponent(absolute)}"`;
          });
        }

        if (trimmed.startsWith("#")) return line;

        if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
          return `/api/proxy?url=${encodeURIComponent(trimmed)}`;
        }

        const absolute = new URL(trimmed, base).toString();
        return `/api/proxy?url=${encodeURIComponent(absolute)}`;
      })
      .join("\n");

    return new NextResponse(rewritten, {
      headers: {
        "Content-Type": "application/vnd.apple.mpegurl",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  // ✅ Binary segments — gamitin arrayBuffer, hindi text!
  const buffer = await response.arrayBuffer();
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "video/mp2t",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
