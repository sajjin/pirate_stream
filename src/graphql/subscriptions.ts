/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedSubscription<InputType, OutputType> = string & {
  __generatedSubscriptionInput: InputType;
  __generatedSubscriptionOutput: OutputType;
};

export const onCreateUserCookies = /* GraphQL */ `subscription OnCreateUserCookies(
  $filter: ModelSubscriptionUserCookiesFilterInput
  $owner: String
) {
  onCreateUserCookies(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnCreateUserCookiesSubscriptionVariables,
  APITypes.OnCreateUserCookiesSubscription
>;
export const onUpdateUserCookies = /* GraphQL */ `subscription OnUpdateUserCookies(
  $filter: ModelSubscriptionUserCookiesFilterInput
  $owner: String
) {
  onUpdateUserCookies(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateUserCookiesSubscriptionVariables,
  APITypes.OnUpdateUserCookiesSubscription
>;
export const onDeleteUserCookies = /* GraphQL */ `subscription OnDeleteUserCookies(
  $filter: ModelSubscriptionUserCookiesFilterInput
  $owner: String
) {
  onDeleteUserCookies(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteUserCookiesSubscriptionVariables,
  APITypes.OnDeleteUserCookiesSubscription
>;
