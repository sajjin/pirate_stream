import { generateClient } from 'aws-amplify/api';
import { getCurrentUser } from 'aws-amplify/auth';
import { SearchResult, VideoInfo } from '../types';

const MY_LIST_KEY = 'myList';
const MY_LIST_MARKER = '__MY_LIST__';
const client = generateClient();

const queries = {
  listMyListEntries: /* GraphQL */ `
    query ListMyListEntries($filter: ModelContinueWatchingFilterInput, $limit: Int) {
      listContinueWatchings(filter: $filter, limit: $limit) {
        items {
          id
          imdbID
          title
          type
          poster
          tmdbId
          timestamp
        }
      }
    }
  `
};

const mutations = {
  createContinueWatching: /* GraphQL */ `
    mutation CreateContinueWatching($input: CreateContinueWatchingInput!) {
      createContinueWatching(input: $input) {
        id
      }
    }
  `,
  deleteContinueWatching: /* GraphQL */ `
    mutation DeleteContinueWatching($input: DeleteContinueWatchingInput!) {
      deleteContinueWatching(input: $input) {
        id
      }
    }
  `
};

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
  loadLocal(): SearchResult[] {
    try {
      const raw = localStorage.getItem(MY_LIST_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Failed to load My List:', error);
      return [];
    }
  },

  saveLocal(items: SearchResult[]): void {
    localStorage.setItem(MY_LIST_KEY, JSON.stringify(items));
  },

  async getCurrentUserId(): Promise<string | null> {
    try {
      const user = await getCurrentUser();
      return user.userId;
    } catch {
      return null;
    }
  },

  async loadCloud(userId: string): Promise<SearchResult[]> {
    const result = await client.graphql({
      query: queries.listMyListEntries,
      variables: {
        filter: {
          and: [
            { userId: { eq: userId } },
            { season: { eq: MY_LIST_MARKER } },
            { episode: { eq: MY_LIST_MARKER } }
          ]
        },
        limit: 500
      }
    });

    const items = (result as any)?.data?.listContinueWatchings?.items || [];
    const deduped = new Map<string, SearchResult>();

    items
      .slice()
      .sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0))
      .forEach((entry: any) => {
        if (!deduped.has(entry.imdbID)) {
          deduped.set(entry.imdbID, {
            imdbID: entry.imdbID,
            Title: entry.title,
            Year: 'N/A',
            Type: entry.type,
            Poster: entry.poster || 'N/A',
            tmdbId: entry.tmdbId ? Number(entry.tmdbId) : undefined
          });
        }
      });

    return Array.from(deduped.values());
  },

  async migrateLocalToCloud(userId: string): Promise<void> {
    const localItems = this.loadLocal();
    if (!localItems.length) {
      return;
    }

    const cloudItems = await this.loadCloud(userId);
    const cloudIds = new Set(cloudItems.map((item) => item.imdbID));

    const toCreate = localItems.filter((item) => !cloudIds.has(item.imdbID));
    if (!toCreate.length) {
      return;
    }

    await Promise.all(
      toCreate.map((item) =>
        client.graphql({
          query: mutations.createContinueWatching,
          variables: {
            input: {
              userId,
              imdbID: item.imdbID,
              title: item.Title,
              type: item.Type,
              season: MY_LIST_MARKER,
              episode: MY_LIST_MARKER,
              episodeTitle: null,
              progress: null,
              timestamp: Date.now(),
              poster: item.Poster !== 'N/A' ? item.Poster : null,
              tmdbId: item.tmdbId ? String(item.tmdbId) : null
            }
          }
        })
      )
    );

    this.saveLocal([]);
  },

  async load(): Promise<SearchResult[]> {
    const userId = await this.getCurrentUserId();
    if (!userId) {
      return this.loadLocal();
    }

    try {
      await this.migrateLocalToCloud(userId);
      return await this.loadCloud(userId);
    } catch (error) {
      console.error('Failed to load cloud My List, using local fallback:', error);
      return this.loadLocal();
    }
  },

  async isInList(imdbID: string): Promise<boolean> {
    const list = await this.load();
    return list.some((item) => item.imdbID === imdbID);
  },

  async add(item: SearchResult | VideoInfo): Promise<SearchResult[]> {
    const normalized = normalizeItem(item);
    const userId = await this.getCurrentUserId();

    if (!userId) {
      const current = this.loadLocal();
      if (current.some((existing) => existing.imdbID === normalized.imdbID)) {
        return current;
      }

      const next = [normalized, ...current];
      this.saveLocal(next);
      return next;
    }

    const current = await this.loadCloud(userId);

    if (current.some((existing) => existing.imdbID === normalized.imdbID)) {
      return current;
    }

    await client.graphql({
      query: mutations.createContinueWatching,
      variables: {
        input: {
          userId,
          imdbID: normalized.imdbID,
          title: normalized.Title,
          type: normalized.Type,
          season: MY_LIST_MARKER,
          episode: MY_LIST_MARKER,
          episodeTitle: null,
          progress: null,
          timestamp: Date.now(),
          poster: normalized.Poster !== 'N/A' ? normalized.Poster : null,
          tmdbId: normalized.tmdbId ? String(normalized.tmdbId) : null
        }
      }
    });

    return this.loadCloud(userId);
  },

  async remove(imdbID: string): Promise<SearchResult[]> {
    const userId = await this.getCurrentUserId();

    if (!userId) {
      const next = this.loadLocal().filter((item) => item.imdbID !== imdbID);
      this.saveLocal(next);
      return next;
    }

    const result = await client.graphql({
      query: queries.listMyListEntries,
      variables: {
        filter: {
          and: [
            { userId: { eq: userId } },
            { imdbID: { eq: imdbID } },
            { season: { eq: MY_LIST_MARKER } },
            { episode: { eq: MY_LIST_MARKER } }
          ]
        },
        limit: 100
      }
    });

    const items = (result as any)?.data?.listContinueWatchings?.items || [];
    await Promise.all(
      items.map((entry: any) =>
        client.graphql({
          query: mutations.deleteContinueWatching,
          variables: { input: { id: entry.id } }
        })
      )
    );

    return this.loadCloud(userId);
  }
};
