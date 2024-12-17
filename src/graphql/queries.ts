/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedQuery<InputType, OutputType> = string & {
  __generatedQueryInput: InputType;
  __generatedQueryOutput: OutputType;
};

export const getUserCookies = /* GraphQL */ `query GetUserCookies($id: ID!) {
  getUserCookies(id: $id) {
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
` as GeneratedQuery<
  APITypes.GetUserCookiesQueryVariables,
  APITypes.GetUserCookiesQuery
>;
export const listUserCookies = /* GraphQL */ `query ListUserCookies(
  $filter: ModelUserCookiesFilterInput
  $limit: Int
  $nextToken: String
) {
  listUserCookies(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      userId
      cookies
      lastUpdated
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
  APITypes.ListUserCookiesQueryVariables,
  APITypes.ListUserCookiesQuery
>;
