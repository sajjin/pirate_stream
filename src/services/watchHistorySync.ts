import { generateClient } from 'aws-amplify/api';
import { getCurrentUser } from 'aws-amplify/auth';
import { VideoInfo } from '../types';

const client = generateClient();
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';


const queries = {
  listContinueWatching: /* GraphQL */ `
    query ListContinueWatching {
      listContinueWatchings(limit: 50) {
        items {
          id
          userId
          imdbID
          title
          type
          season
          episode
          episodeTitle
          progress
          timestamp
          poster
          tmdbId
          owner
          createdAt
          updatedAt
        }
      }
    }
  `
};

const mutations = {
  createContinueWatching: /* GraphQL */ `
    mutation CreateContinueWatching(
      $input: CreateContinueWatchingInput!
    ) {
      createContinueWatching(input: $input) {
        id
        userId
        imdbID
        title
        type
        season
        episode
        episodeTitle
        progress
        timestamp
        poster
        tmdbId
        owner
        createdAt
        updatedAt
      }
    }
  `,
  updateContinueWatching: /* GraphQL */ `
    mutation UpdateContinueWatching(
      $input: UpdateContinueWatchingInput!
    ) {
      updateContinueWatching(input: $input) {
        id
        userId
        imdbID
        title
        type
        season
        episode
        episodeTitle
        progress
        timestamp
        poster
        tmdbId
        owner
        createdAt
        updatedAt
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

export const watchHistorySync = {
  isSameEntry(item: any, videoInfo: VideoInfo): boolean {
    const seasonMatch = (item.season || null) === (videoInfo.season || null);
    const episodeMatch = (item.episode || null) === (videoInfo.episode || null);

    return (
      item.imdbID === videoInfo.imdbID &&
      item.type === (videoInfo.type || 'movie') &&
      seasonMatch &&
      episodeMatch
    );
  },

  async fetchPosterFromTMDB(imdbID: string, type: string): Promise<string | null> {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/find/${imdbID}?api_key=${process.env.REACT_APP_TMDB_API_KEY}&external_source=imdb_id`
      );
      const data = await response.json();
      
      let poster = null;
      if (type === 'movie' && data.movie_results[0]) {
        poster = data.movie_results[0].poster_path;
      } else if (type === 'series' && data.tv_results[0]) {
        poster = data.tv_results[0].poster_path;
      }
      
      return poster ? `${TMDB_IMAGE_BASE}${poster}` : null;
    } catch (error) {
      console.error('Error fetching poster:', error);
      return null;
    }
  },

  async saveProgress(videoInfo: VideoInfo, watchedSeconds?: number): Promise<void> {
    try {
      const user = await getCurrentUser();
      const timestamp = Date.now();

      const listResult = await client.graphql({
        query: queries.listContinueWatching
      });

      const existingItems = ((listResult as any).data?.listContinueWatchings?.items || []).filter(
        (item: any) => item && item.userId === user.userId
      );

      const existing = existingItems.find((item: any) => this.isSameEntry(item, videoInfo));
      const normalizedProgress =
        typeof watchedSeconds === 'number'
          ? watchedSeconds
          : typeof videoInfo.progress === 'number'
            ? videoInfo.progress
            : 0;

      // Prepare the input data
      const input = {
        userId: user.userId,
        imdbID: videoInfo.imdbID,
        title: videoInfo.title,
        type: videoInfo.type || 'movie',
        season: videoInfo.season || null,
        episode: videoInfo.episode || null,
        episodeTitle: videoInfo.episodeTitle || null,
        progress: normalizedProgress,
        timestamp,
        poster: videoInfo.poster || null,
        tmdbId: videoInfo.tmdbId || null
      };

      if (existing?.id) {
        await client.graphql({
          query: mutations.updateContinueWatching,
          variables: { input: { id: existing.id, ...input } }
        });
        return;
      }

      await client.graphql({
        query: mutations.createContinueWatching,
        variables: { input }
      });

    } catch (error) {
      console.error('Error saving watch history:', error);
      // Log the full error details
      if ((error as any).errors) {
        if ((error as any).errors) {
          console.error('GraphQL Errors:', (error as any).errors);
        }
      }
      throw error;
    }
  },

  async getProgressForVideo(videoInfo: VideoInfo): Promise<{ progressSeconds: number; lastPlayedAt?: number } | null> {
    try {
      const user = await getCurrentUser();
      const result = await client.graphql({
        query: queries.listContinueWatching
      });

      const items = ((result as any).data?.listContinueWatchings?.items || []).filter(
        (item: any) => item && item.userId === user.userId
      );

      const matched = items.find((item: any) => this.isSameEntry(item, videoInfo));
      if (!matched) {
        return null;
      }

      return {
        progressSeconds: Number(matched.progress || 0),
        lastPlayedAt: matched.timestamp ? Number(matched.timestamp) : undefined
      };
    } catch (error) {
      console.error('Error loading progress for video:', error);
      return null;
    }
  },

  async loadWatchHistory(): Promise<VideoInfo[]> {
    try {
      const result = await client.graphql({
        query: queries.listContinueWatching
      });
  
      const watchHistory = ((result as any).data?.listContinueWatchings?.items || []).filter(
        (item: any) => !(item.season === '__MY_LIST__' && item.episode === '__MY_LIST__')
      );
      
      // Group by imdbID to handle series episodes
      const groupedHistory = watchHistory.reduce((acc: { [key: string]: any }, item: any) => {
        if (!acc[item.imdbID]) {
          acc[item.imdbID] = item;
        } else {
          // For series, keep the most recent episode
          if (item.timestamp > acc[item.imdbID].timestamp) {
            acc[item.imdbID] = item;
          }
        }
        return acc;
      }, {});
  
      // Convert back to array and transform
      const transformedHistory = Object.values(groupedHistory)
        .map((item: any) => ({
          imdbID: item.imdbID,
          title: item.title,
          type: item.type,
          season: item.season,
          episode: item.episode,
          episodeTitle: item.episodeTitle,
          progress: item.progress,
          timestamp: item.timestamp,
          poster: item.poster,
          tmdbId: item.tmdbId
        }))
        .sort((a: VideoInfo, b: VideoInfo) => 
          (b.timestamp || 0) - (a.timestamp || 0)
        );
  
      return transformedHistory;
    } catch (error) {
      console.error('Error loading watch history:', error);
      if ((error as any).errors) {
        if (error instanceof Error) {
          console.error('GraphQL Errors:', (error as any).errors);
        }
      }
      return [];
    }
  },


  async deleteFromHistory(imdbID: string, type: string): Promise<void> {
    try {
      // Get all items for this imdbID
      const result = await client.graphql({
        query: queries.listContinueWatching
      });

      const itemsToDelete = (result as any).data.listContinueWatchings.items.filter(
        (item: any) => item.imdbID === imdbID
      );
      // Delete all matching items
      await Promise.all(
        itemsToDelete.map((item: any) =>
          client.graphql({
            query: mutations.deleteContinueWatching,
            variables: {
              input: { id: item.id }
            }
          })
        )
      );

    } catch (error) {
      console.error('Error deleting from watch history:', error);
      throw error;
    }
  }
};