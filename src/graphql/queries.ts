/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedQuery<InputType, OutputType> = string & {
  __generatedQueryInput: InputType;
  __generatedQueryOutput: OutputType;
};

export const getWatchHistory = /* GraphQL */ `query GetWatchHistory($id: ID!) {
  getWatchHistory(id: $id) {
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
    createdAt
    updatedAt
    owner
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetWatchHistoryQueryVariables,
  APITypes.GetWatchHistoryQuery
>;
export const listWatchHistories = /* GraphQL */ `query ListWatchHistories(
  $filter: ModelWatchHistoryFilterInput
  $limit: Int
  $nextToken: String
) {
  listWatchHistories(filter: $filter, limit: $limit, nextToken: $nextToken) {
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
      createdAt
      updatedAt
      owner
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListWatchHistoriesQueryVariables,
  APITypes.ListWatchHistoriesQuery
>;
