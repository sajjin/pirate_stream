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

  async saveProgress(videoInfo: VideoInfo): Promise<void> {
    try {
      const user = await getCurrentUser();

      // Prepare the input data
      const input = {
        userId: user.userId,
        imdbID: videoInfo.imdbID,
        title: videoInfo.title,
        type: videoInfo.type || 'movie',
        season: videoInfo.season || null,
        episode: videoInfo.episode || null,
        episodeTitle: videoInfo.episodeTitle || null,
        progress: videoInfo.progress || 0,
        timestamp: Date.now(),
        poster: videoInfo.poster || null,
        tmdbId: videoInfo.tmdbId || null
      };


      const result = await client.graphql({
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

  async loadWatchHistory(): Promise<VideoInfo[]> {
    try {
      const result = await client.graphql({
        query: queries.listContinueWatching
      });
  
      const watchHistory = (result as any).data?.listContinueWatchings?.items || [];
      
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