export interface VideoInfo {
    url: string;
    title: string;
    type: string;
    imdbID?: string;
    season?: string;
    episode?: string;
    episodeTitle?: string;
    timestamp?: number;
    tmdbId?: number;
    runtime?: number;
    poster?: string;
  }
  
  export interface Episode {
    Title: string;
    Episode: string;
    imdbID: string;
    Released: string;
    Season: string;
  }
  
  export interface Season {
    seasonNumber: string;
    episodes: Episode[];
    poster: string;
  }

  export interface SearchResult {
    imdbID: string;
    Title: string;
    Year: string;
    Type: string;
    Poster: string;
    tmdbId?: number;
  }