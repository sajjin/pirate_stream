/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedMutation<InputType, OutputType> = string & {
  __generatedMutationInput: InputType;
  __generatedMutationOutput: OutputType;
};

export const createContinueWatching = /* GraphQL */ `mutation CreateContinueWatching(
  $input: CreateContinueWatchingInput!
  $condition: ModelContinueWatchingConditionInput
) {
  createContinueWatching(input: $input, condition: $condition) {
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
  APITypes.CreateContinueWatchingMutationVariables,
  APITypes.CreateContinueWatchingMutation
>;
export const updateContinueWatching = /* GraphQL */ `mutation UpdateContinueWatching(
  $input: UpdateContinueWatchingInput!
  $condition: ModelContinueWatchingConditionInput
) {
  updateContinueWatching(input: $input, condition: $condition) {
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
  APITypes.UpdateContinueWatchingMutationVariables,
  APITypes.UpdateContinueWatchingMutation
>;
export const deleteContinueWatching = /* GraphQL */ `mutation DeleteContinueWatching(
  $input: DeleteContinueWatchingInput!
  $condition: ModelContinueWatchingConditionInput
) {
  deleteContinueWatching(input: $input, condition: $condition) {
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
  APITypes.DeleteContinueWatchingMutationVariables,
  APITypes.DeleteContinueWatchingMutation
>;
