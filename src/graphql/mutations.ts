/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedMutation<InputType, OutputType> = string & {
  __generatedMutationInput: InputType;
  __generatedMutationOutput: OutputType;
};

export const createWatchHistory = /* GraphQL */ `mutation CreateWatchHistory(
  $input: CreateWatchHistoryInput!
  $condition: ModelWatchHistoryConditionInput
) {
  createWatchHistory(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.CreateWatchHistoryMutationVariables,
  APITypes.CreateWatchHistoryMutation
>;
export const updateWatchHistory = /* GraphQL */ `mutation UpdateWatchHistory(
  $input: UpdateWatchHistoryInput!
  $condition: ModelWatchHistoryConditionInput
) {
  updateWatchHistory(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.UpdateWatchHistoryMutationVariables,
  APITypes.UpdateWatchHistoryMutation
>;
export const deleteWatchHistory = /* GraphQL */ `mutation DeleteWatchHistory(
  $input: DeleteWatchHistoryInput!
  $condition: ModelWatchHistoryConditionInput
) {
  deleteWatchHistory(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeleteWatchHistoryMutationVariables,
  APITypes.DeleteWatchHistoryMutation
>;
