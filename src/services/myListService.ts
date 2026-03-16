import { SearchResult, VideoInfo } from '../types';

const MY_LIST_KEY = 'myList';

const normalizeItem = (item: SearchResult | VideoInfo): SearchResult => {
  if ((item as SearchResult).Title !== undefined) {
    return item as SearchResult;
  }

  const info = item as VideoInfo;
  return {
    imdbID: info.imdbID,
    Title: info.title,
    Year: 'N/A',
    Type: info.type,
    Poster: info.poster || 'N/A',
    tmdbId: info.tmdbId
  };
};

export const myListService = {
  load(): SearchResult[] {
    try {
      const raw = localStorage.getItem(MY_LIST_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Failed to load My List:', error);
      return [];
    }
  },

  save(items: SearchResult[]): void {
    localStorage.setItem(MY_LIST_KEY, JSON.stringify(items));
  },

  isInList(imdbID: string): boolean {
    return this.load().some((item) => item.imdbID === imdbID);
  },

  add(item: SearchResult | VideoInfo): SearchResult[] {
    const normalized = normalizeItem(item);
    const current = this.load();

    if (current.some((existing) => existing.imdbID === normalized.imdbID)) {
      return current;
    }

    const next = [normalized, ...current];
    this.save(next);
    return next;
  },

  remove(imdbID: string): SearchResult[] {
    const next = this.load().filter((item) => item.imdbID !== imdbID);
    this.save(next);
    return next;
  }
};
