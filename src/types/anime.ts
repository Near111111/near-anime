export interface Anime {
  id: string;
  data_id?: string;
  title: string;
  japanese_title?: string;
  poster: string;
  duration?: string;
  description?: string;
  tvInfo?: {
    showType?: string;
    rating?: string;
    sub?: number;
    dub?: number;
    eps?: number;
  };
}

export interface SpotlightAnime extends Anime {
  rank?: number;
  otherInfo?: string[];
  description?: string;
}

export interface HomeData {
  spotlights?: SpotlightAnime[];
  trending?: Anime[];
  topAiring?: Anime[];
  mostPopular?: Anime[];
  mostFavorite?: Anime[];
  latestEpisode?: Anime[];
  latestCompleted?: Anime[];
  topUpcoming?: Anime[];
  top10?: {
    today?: Anime[];
    week?: Anime[];
    month?: Anime[];
  };
  genres?: string[];
}

export interface Episode {
  id: string;
  episode_no: number;
  title: string;
  japanese_title?: string;
  isFiller?: boolean;
}

export interface Server {
  type: string;
  data_id: string;
  server_id: string;
  serverName: string;
}

export interface StreamInfo {
  streamingLink: {
    link: string;
    tracks?: { file: string; label: string; kind: string }[];
  };
  servers: Server[];
}

export interface SearchResult {
  data: Anime[];
  totalPage: number;
}
