import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { 
  DynamoDBDocumentClient, 
  PutCommand, 
  QueryCommand,
  GetCommand
} from "@aws-sdk/lib-dynamodb";
import { getCurrentUser } from 'aws-amplify/auth';
import { VideoInfo, VideoProgress, DBVideoItem } from '../types';

const client = new DynamoDBClient({
  region: process.env.REACT_APP_AWS_REGION,
  credentials: {
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY!
  }
});

const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = 'UserWatchHistory';

export const videoProgressService = {
  async saveProgress(
    videoInfo: VideoInfo, 
    currentTime: number, 
    duration: number
  ): Promise<void> {
    try {
      const user = await getCurrentUser();
      const videoId = videoInfo.type === 'series' 
        ? `${videoInfo.imdbID}_${videoInfo.season}_${videoInfo.episode}`
        : videoInfo.imdbID;

      const progress: VideoProgress = {
        currentTime,
        duration,
        completed: (currentTime / duration) > 0.9, // Mark as completed if watched >90%
        lastWatched: Date.now()
      };

      const item: DBVideoItem = {
        userId: user.userId,
        videoId,
        timestamp: Date.now(),
        progress,
        ...videoInfo
      };

      await docClient.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: item
      }));
    } catch (error) {
      console.error('Error saving video progress:', error);
      throw error;
    }
  },

  async getProgress(videoInfo: VideoInfo): Promise<VideoProgress | null> {
    try {
      const user = await getCurrentUser();
      const videoId = videoInfo.type === 'series' 
        ? `${videoInfo.imdbID}_${videoInfo.season}_${videoInfo.episode}`
        : videoInfo.imdbID;

      const { Item } = await docClient.send(new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          userId: user.userId,
          videoId
        }
      }));

      return Item && (Item as DBVideoItem).progress !== undefined ? (Item as DBVideoItem).progress! : null;
    } catch (error) {
      console.error('Error getting video progress:', error);
      throw error;
    }
  },

  async getLastWatchedEpisode(imdbID: string): Promise<DBVideoItem | null> {
    try {
      const user = await getCurrentUser();

      const { Items = [] } = await docClient.send(new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: 'UserTimestampIndex',
        KeyConditionExpression: 'userId = :userId',
        FilterExpression: 'imdbID = :imdbID',
        ExpressionAttributeValues: {
          ':userId': user.userId,
          ':imdbID': imdbID
        },
        ScanIndexForward: false, // Get most recent first
        Limit: 1
      }));

      return Items.length > 0 ? Items[0] as DBVideoItem : null;
    } catch (error) {
      console.error('Error getting last watched episode:', error);
      throw error;
    }
  }
};