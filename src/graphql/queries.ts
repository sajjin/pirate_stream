/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedQuery<InputType, OutputType> = string & {
  __generatedQueryInput: InputType;
  __generatedQueryOutput: OutputType;
};

export const getContinueWatching = /* GraphQL */ `query GetContinueWatching($id: ID!) {
  getContinueWatching(id: $id) {
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
  APITypes.GetContinueWatchingQueryVariables,
  APITypes.GetContinueWatchingQuery
>;
export const listContinueWatchings = /* GraphQL */ `query ListContinueWatchings(
  $filter: ModelContinueWatchingFilterInput
  $limit: Int
  $nextToken: String
) {
  listContinueWatchings(filter: $filter, limit: $limit, nextToken: $nextToken) {
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
  APITypes.ListContinueWatchingsQueryVariables,
  APITypes.ListContinueWatchingsQuery
>;
