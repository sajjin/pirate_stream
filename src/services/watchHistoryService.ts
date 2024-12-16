// services/watchHistoryService.ts
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { 
  DynamoDBDocumentClient, 
  PutCommand, 
  QueryCommand,
  DeleteCommand,
  PutCommandInput,
  QueryCommandInput,
  DeleteCommandInput
} from "@aws-sdk/lib-dynamodb";
import { getCurrentUser } from 'aws-amplify/auth';
import { VideoInfo, DBVideoItem } from '../types';

const client = new DynamoDBClient({
  region: process.env.REACT_APP_AWS_REGION,
  credentials: {
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY!
  }
});

const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = 'UserWatchHistory';

export const watchHistoryService = {
  async addToHistory(videoInfo: VideoInfo): Promise<void> {
    try {
      const user = await getCurrentUser();
      const videoId = videoInfo.type === 'series' 
        ? `${videoInfo.imdbID}_${videoInfo.season}_${videoInfo.episode}`
        : videoInfo.imdbID;

      const item: DBVideoItem = {
        userId: user.userId,
        videoId,
        timestamp: Date.now(),
        ...videoInfo
      };

      const params: PutCommandInput = {
        TableName: TABLE_NAME,
        Item: item
      };

      await docClient.send(new PutCommand(params));
    } catch (error) {
      console.error('Error adding to watch history:', error);
      throw error;
    }
  },

  async getHistory(): Promise<VideoInfo[]> {
    try {
      const user = await getCurrentUser();

      const params: QueryCommandInput = {
        TableName: TABLE_NAME,
        IndexName: 'UserTimestampIndex',
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': user.userId
        },
        ScanIndexForward: false,
        Limit: 50
      };

      const { Items } = await docClient.send(new QueryCommand(params));
      return (Items || []) as VideoInfo[];
    } catch (error) {
      console.error('Error getting watch history:', error);
      throw error;
    }
  },

  async deleteFromHistory(videoInfo: VideoInfo): Promise<void> {
    try {
      const user = await getCurrentUser();

      if (videoInfo.type === 'series') {
        // Delete all episodes of the series
        const queryParams: QueryCommandInput = {
          TableName: TABLE_NAME,
          KeyConditionExpression: 'userId = :userId',
          FilterExpression: 'imdbID = :imdbID',
          ExpressionAttributeValues: {
            ':userId': user.userId,
            ':imdbID': videoInfo.imdbID
          }
        };

        const { Items = [] } = await docClient.send(new QueryCommand(queryParams));

        await Promise.all((Items as DBVideoItem[]).map((item: DBVideoItem) => {
          const deleteParams: DeleteCommandInput = {
            TableName: TABLE_NAME,
            Key: {
              userId: user.userId,
              videoId: item.videoId
            }
          };
          return docClient.send(new DeleteCommand(deleteParams));
        }));
      } else {
        // Delete single movie
        const deleteParams: DeleteCommandInput = {
          TableName: TABLE_NAME,
          Key: {
            userId: user.userId,
            videoId: videoInfo.imdbID
          }
        };
        await docClient.send(new DeleteCommand(deleteParams));
      }
    } catch (error) {
      console.error('Error deleting from watch history:', error);
      throw error;
    }
  }
};