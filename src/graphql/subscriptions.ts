/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedSubscription<InputType, OutputType> = string & {
  __generatedSubscriptionInput: InputType;
  __generatedSubscriptionOutput: OutputType;
};

export const onCreateContinueWatching = /* GraphQL */ `subscription OnCreateContinueWatching(
  $filter: ModelSubscriptionContinueWatchingFilterInput
  $owner: String
) {
  onCreateContinueWatching(filter: $filter, owner: $owner) {
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
  APITypes.OnCreateContinueWatchingSubscriptionVariables,
  APITypes.OnCreateContinueWatchingSubscription
>;
export const onUpdateContinueWatching = /* GraphQL */ `subscription OnUpdateContinueWatching(
  $filter: ModelSubscriptionContinueWatchingFilterInput
  $owner: String
) {
  onUpdateContinueWatching(filter: $filter, owner: $owner) {
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
  APITypes.OnUpdateContinueWatchingSubscriptionVariables,
  APITypes.OnUpdateContinueWatchingSubscription
>;
export const onDeleteContinueWatching = /* GraphQL */ `subscription OnDeleteContinueWatching(
  $filter: ModelSubscriptionContinueWatchingFilterInput
  $owner: String
) {
  onDeleteContinueWatching(filter: $filter, owner: $owner) {
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
  APITypes.OnDeleteContinueWatchingSubscriptionVariables,
  APITypes.OnDeleteContinueWatchingSubscription
>;
