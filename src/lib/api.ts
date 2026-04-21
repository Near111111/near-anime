import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4444/api";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
});

export async function getHome() {
  const { data } = await api.get("/");
  return data.results;
}

export async function getAnimeInfo(id: string) {
  const { data } = await api.get(`/info?id=${id}`);
  return data.results;
}

export async function getEpisodes(id: string) {
  try {
    const { data } = await api.get(
      `/episodes/gogo?slug=${encodeURIComponent(id)}`,
    );
    if (data.results?.totalEpisodes > 0) return data.results;
  } catch (_) {}
  const { data } = await api.get(`/episodes/${id}`);
  return data.results;
}

export async function getServers(episodeUrl: string) {
  try {
    const { data } = await api.get(
      `/servers/gogo?url=${encodeURIComponent(episodeUrl)}`,
    );
    return data.results;
  } catch (_) {
    const { data } = await api.get(`/servers/${episodeUrl}`);
    return data.results;
  }
}

export async function getStream(
  id: string,
  server: string = "fast",
  type: string = "sub",
) {
  // Construct full gogoanime URL if only slug is passed
  const episodeUrl = id.startsWith("http")
    ? id
    : `https://gogoanime.by/${id.replace(/^\//, "").replace(/\/$/, "")}/`;

  const serversToTry =
    server === "fast"
      ? ["fast", "hd", "megacloud", "vidsrc"]
      : [server, "fast", "hd", "megacloud", "vidsrc"];

  for (const s of serversToTry) {
    try {
      const { data } = await api.get(
        `/stream/gogo?url=${encodeURIComponent(episodeUrl)}&server=${s}&type=${type}`,
      );
      const file = data?.results?.link?.file;
      if (file) return data.results;
    } catch (_) {}
  }

  return null;
}

export async function searchAnime(keyword: string, page: number = 1) {
  const { data } = await api.get(
    `/search?keyword=${encodeURIComponent(keyword)}&page=${page}`,
  );
  return data.results;
}

export async function getTopTen() {
  const { data } = await api.get("/top-ten");
  return data.results;
}

export async function getSchedule() {
  const { data } = await api.get("/schedule");
  return data.results;
}

export async function getRandom() {
  const { data } = await api.get("/random");
  return data.results;
}

export default api;
