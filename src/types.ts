export interface VideoProgress {
  currentTime: number;
  duration: number;
  completed: boolean;
  lastWatched: number; // timestamp
}

export interface VideoInfo {
  url?: string;
  title: string;
  type: 'movie' | 'series';
  imdbID: string;
  tmdbId?: number;
  season?: string;
  episode?: string;
  episodeTitle?: string;
  poster?: string;
  timestamp?: number;
  runtime?: number;
  progress?: VideoProgress;
}

export interface DBVideoItem {
  userId: string;
  videoId: string;
  timestamp: number;
  title: string;
  type: 'movie' | 'series';
  imdbID: string;
  tmdbId?: number;
  season?: string;
  episode?: string;
  episodeTitle?: string;
  poster?: string;
  runtime?: number;
  progress?: VideoProgress;
  url?: string;
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
  
  export interface WatchHistoryItem {
    movieId: string;
    title: string;
    type: 'movie' | 'series';
    season?: string;
    episode?: string;
    episodeTitle?: string;
    poster?: string;
    timestamp: number;
    imdbID: string;
  }
  
  export interface UserPreferences {
    favoriteGenres: string[];
    language: string;
  }
  
  export interface UserData {
    userId: string;
    email: string;
    username: string;
    watchHistory: WatchHistoryItem[];
    searchHistory: any[];
    preferences: UserPreferences;
  }
  
  export interface FormData {
    email: string;
    password: string;
    confirmPassword: string;
    verificationCode: string;
  }