/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedSubscription<InputType, OutputType> = string & {
  __generatedSubscriptionInput: InputType;
  __generatedSubscriptionOutput: OutputType;
};

export const onCreateWatchHistory = /* GraphQL */ `subscription OnCreateWatchHistory(
  $filter: ModelSubscriptionWatchHistoryFilterInput
  $owner: String
) {
  onCreateWatchHistory(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnCreateWatchHistorySubscriptionVariables,
  APITypes.OnCreateWatchHistorySubscription
>;
export const onUpdateWatchHistory = /* GraphQL */ `subscription OnUpdateWatchHistory(
  $filter: ModelSubscriptionWatchHistoryFilterInput
  $owner: String
) {
  onUpdateWatchHistory(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateWatchHistorySubscriptionVariables,
  APITypes.OnUpdateWatchHistorySubscription
>;
export const onDeleteWatchHistory = /* GraphQL */ `subscription OnDeleteWatchHistory(
  $filter: ModelSubscriptionWatchHistoryFilterInput
  $owner: String
) {
  onDeleteWatchHistory(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteWatchHistorySubscriptionVariables,
  APITypes.OnDeleteWatchHistorySubscription
>;
