/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedMutation<InputType, OutputType> = string & {
  __generatedMutationInput: InputType;
  __generatedMutationOutput: OutputType;
};

export const createUserCookies = /* GraphQL */ `mutation CreateUserCookies(
  $input: CreateUserCookiesInput!
  $condition: ModelUserCookiesConditionInput
) {
  createUserCookies(input: $input, condition: $condition) {
    id
    userId
    cookies
    lastUpdated
    createdAt
    updatedAt
    owner
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateUserCookiesMutationVariables,
  APITypes.CreateUserCookiesMutation
>;
export const updateUserCookies = /* GraphQL */ `mutation UpdateUserCookies(
  $input: UpdateUserCookiesInput!
  $condition: ModelUserCookiesConditionInput
) {
  updateUserCookies(input: $input, condition: $condition) {
    id
    userId
    cookies
    lastUpdated
    createdAt
    updatedAt
    owner
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateUserCookiesMutationVariables,
  APITypes.UpdateUserCookiesMutation
>;
export const deleteUserCookies = /* GraphQL */ `mutation DeleteUserCookies(
  $input: DeleteUserCookiesInput!
  $condition: ModelUserCookiesConditionInput
) {
  deleteUserCookies(input: $input, condition: $condition) {
    id
    userId
    cookies
    lastUpdated
    createdAt
    updatedAt
    owner
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteUserCookiesMutationVariables,
  APITypes.DeleteUserCookiesMutation
>;
