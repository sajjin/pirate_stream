import { generateClient } from 'aws-amplify/api';
import { getCurrentUser } from 'aws-amplify/auth';
import { GraphQLResult } from '@aws-amplify/api-graphql';
import { VideoInfo } from '../types';

declare global {
  interface Window {
    watchHistorySyncInterval?: NodeJS.Timer;
  }
}


const client = generateClient();

const queries = {
  getWatchHistoryByUserId: /* GraphQL */ `
    query GetWatchHistoryByUserId($userId: String!) {
      getWatchHistoryByUserId(userId: $userId) {
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
        }
      }
    }
  `
};

const mutations = {
  createWatchHistory: /* GraphQL */ `
    mutation CreateWatchHistory($input: CreateWatchHistoryInput!) {
      createWatchHistory(input: $input) {
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
      }
    }
  `,
  updateWatchHistory: /* GraphQL */ `
    mutation UpdateWatchHistory($input: UpdateWatchHistoryInput!) {
      updateWatchHistory(input: $input) {
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
      }
    }
  `
};

const watchHistorySync: {
  syncInterval?: NodeJS.Timer;
  saveWatchHistory(videoInfo: VideoInfo): Promise<void>;
  loadWatchHistory(): Promise<VideoInfo[]>;
  startAutoSync(videoInfo: VideoInfo, intervalMinutes?: number): NodeJS.Timer;
} = {
  syncInterval: undefined,
  async saveWatchHistory(videoInfo: VideoInfo): Promise<void> {
    try {
      const user = await getCurrentUser();
      
      // Try to get existing watch history for this video
      const existingResult = await client.graphql({
        query: queries.getWatchHistoryByUserId,
        variables: {
          userId: user.userId
        }
      }) as GraphQLResult<any>;

      const existingHistory = existingResult.data?.getWatchHistoryByUserId?.items?.find(
        (item: any) => {
          if (videoInfo.type === 'movie') {
            return item.imdbID === videoInfo.imdbID && item.type === 'movie';
          } else {
            return (
              item.imdbID === videoInfo.imdbID &&
              item.season === videoInfo.season &&
              item.episode === videoInfo.episode
            );
          }
        }
      );

      const watchHistoryInput = {
        userId: user.userId,
        imdbID: videoInfo.imdbID,
        title: videoInfo.title,
        type: videoInfo.type,
        season: videoInfo.season,
        episode: videoInfo.episode,
        episodeTitle: videoInfo.episodeTitle,
        progress: videoInfo.progress || 0,
        timestamp: Date.now(),
        poster: videoInfo.poster,
        tmdbId: videoInfo.tmdbId
      };

      if (existingHistory) {
        // Update existing history
        await client.graphql({
          query: mutations.updateWatchHistory,
          variables: {
            input: {
              id: existingHistory.id,
              ...watchHistoryInput
            }
          }
        });
      } else {
        // Create new history entry
        await client.graphql({
          query: mutations.createWatchHistory,
          variables: {
            input: watchHistoryInput
          }
        });
      }
    } catch (error) {
      console.error('Error saving watch history:', error);
    }
  },

  async loadWatchHistory(): Promise<VideoInfo[]> {
    try {
      const user = await getCurrentUser();
      const result = await client.graphql({
        query: queries.getWatchHistoryByUserId,
        variables: {
          userId: user.userId
        }
      }) as GraphQLResult<any>;

      const watchHistory = result.data?.getWatchHistoryByUserId?.items || [];
      
      // Sort by most recent first
      return watchHistory
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

    } catch (error) {
      console.error('Error loading watch history:', error);
      return [];
    }
  },

  startAutoSync(videoInfo: VideoInfo, intervalMinutes: number = 5): NodeJS.Timer {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    this.syncInterval = setInterval(() => {
      this.saveWatchHistory(videoInfo);
    }, intervalMinutes * 60 * 1000);
    
    return this.syncInterval;
  }
}

export { watchHistorySync };
