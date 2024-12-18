import { generateClient } from 'aws-amplify/api';
import { getCurrentUser } from 'aws-amplify/auth';
import { VideoInfo } from '../types';

const client = generateClient();

// First, let's define our GraphQL operations
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
  `
};

export const watchHistorySync = {
  async saveProgress(videoInfo: VideoInfo): Promise<void> {
    try {
      const user = await getCurrentUser();
      console.log('Current user:', user);
      console.log('Saving video info:', videoInfo);

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

      console.log('Mutation input:', input);

      const result = await client.graphql({
        query: mutations.createContinueWatching,
        variables: { input }
      });

      console.log('Save result:', result);
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
      console.log('Loading watch history...');
      const result = await client.graphql({
        query: queries.listContinueWatching
      });

      console.log('Load result:', result);

      const watchHistory = (result as any).data?.listContinueWatchings?.items || [];
      
      // Transform and sort the data
      const transformedHistory = watchHistory
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

      console.log('Transformed history:', transformedHistory);
      return transformedHistory;
    } catch (error) {
      console.error('Error loading watch history:', error);
      if ((error as any).errors) {
        if ((error as any).errors) {
          console.error('GraphQL Errors:', (error as any).errors);
        }
      }
      return [];
    }
  }
};