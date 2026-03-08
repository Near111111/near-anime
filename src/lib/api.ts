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
  const { data } = await api.get(`/episodes/${id}`);
  return data.results;
}

export async function getServers(episodeId: string) {
  const { data } = await api.get(`/servers/${episodeId}`);
  return data.results;
}

export async function getStream(
  id: string,
  server: string = "hd-1",
  type: string = "sub",
) {
  try {
    // Try normal stream first
    const { data } = await api.get(
      `/stream?id=${encodeURIComponent(id)}&server=${server}&type=${type}`,
    );

    const file =
      data?.results?.streamingLink?.link?.file ??
      data?.results?.streamingLink?.link;

    // If no stream link, try fallback
    if (!file) {
      const { data: fallbackData } = await api.get(
        `/stream/fallback?id=${encodeURIComponent(id)}&server=${server}&type=${type}`,
      );
      return fallbackData.results;
    }

    return data.results;
  } catch {
    // If normal fails, use fallback
    const { data: fallbackData } = await api.get(
      `/stream/fallback?id=${encodeURIComponent(id)}&server=${server}&type=${type}`,
    );
    return fallbackData.results;
  }
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
