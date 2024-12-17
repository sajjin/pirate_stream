/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type CreateUserCookiesInput = {
  id?: string | null,
  userId: string,
  cookies: string,
  lastUpdated: number,
};

export type ModelUserCookiesConditionInput = {
  userId?: ModelStringInput | null,
  cookies?: ModelStringInput | null,
  lastUpdated?: ModelIntInput | null,
  and?: Array< ModelUserCookiesConditionInput | null > | null,
  or?: Array< ModelUserCookiesConditionInput | null > | null,
  not?: ModelUserCookiesConditionInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  owner?: ModelStringInput | null,
};

export type ModelStringInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export enum ModelAttributeTypes {
  binary = "binary",
  binarySet = "binarySet",
  bool = "bool",
  list = "list",
  map = "map",
  number = "number",
  numberSet = "numberSet",
  string = "string",
  stringSet = "stringSet",
  _null = "_null",
}


export type ModelSizeInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
};

export type ModelIntInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
};

export type UserCookies = {
  __typename: "UserCookies",
  id: string,
  userId: string,
  cookies: string,
  lastUpdated: number,
  createdAt: string,
  updatedAt: string,
  owner?: string | null,
};

export type UpdateUserCookiesInput = {
  id: string,
  userId?: string | null,
  cookies?: string | null,
  lastUpdated?: number | null,
};

export type DeleteUserCookiesInput = {
  id: string,
};

export type ModelUserCookiesFilterInput = {
  id?: ModelIDInput | null,
  userId?: ModelStringInput | null,
  cookies?: ModelStringInput | null,
  lastUpdated?: ModelIntInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelUserCookiesFilterInput | null > | null,
  or?: Array< ModelUserCookiesFilterInput | null > | null,
  not?: ModelUserCookiesFilterInput | null,
  owner?: ModelStringInput | null,
};

export type ModelIDInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export type ModelUserCookiesConnection = {
  __typename: "ModelUserCookiesConnection",
  items:  Array<UserCookies | null >,
  nextToken?: string | null,
};

export type ModelSubscriptionUserCookiesFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  userId?: ModelSubscriptionStringInput | null,
  cookies?: ModelSubscriptionStringInput | null,
  lastUpdated?: ModelSubscriptionIntInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionUserCookiesFilterInput | null > | null,
  or?: Array< ModelSubscriptionUserCookiesFilterInput | null > | null,
  owner?: ModelStringInput | null,
};

export type ModelSubscriptionIDInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  in?: Array< string | null > | null,
  notIn?: Array< string | null > | null,
};

export type ModelSubscriptionStringInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  in?: Array< string | null > | null,
  notIn?: Array< string | null > | null,
};

export type ModelSubscriptionIntInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
  in?: Array< number | null > | null,
  notIn?: Array< number | null > | null,
};

export type CreateUserCookiesMutationVariables = {
  input: CreateUserCookiesInput,
  condition?: ModelUserCookiesConditionInput | null,
};

export type CreateUserCookiesMutation = {
  createUserCookies?:  {
    __typename: "UserCookies",
    id: string,
    userId: string,
    cookies: string,
    lastUpdated: number,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type UpdateUserCookiesMutationVariables = {
  input: UpdateUserCookiesInput,
  condition?: ModelUserCookiesConditionInput | null,
};

export type UpdateUserCookiesMutation = {
  updateUserCookies?:  {
    __typename: "UserCookies",
    id: string,
    userId: string,
    cookies: string,
    lastUpdated: number,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type DeleteUserCookiesMutationVariables = {
  input: DeleteUserCookiesInput,
  condition?: ModelUserCookiesConditionInput | null,
};

export type DeleteUserCookiesMutation = {
  deleteUserCookies?:  {
    __typename: "UserCookies",
    id: string,
    userId: string,
    cookies: string,
    lastUpdated: number,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type GetUserCookiesQueryVariables = {
  id: string,
};

export type GetUserCookiesQuery = {
  getUserCookies?:  {
    __typename: "UserCookies",
    id: string,
    userId: string,
    cookies: string,
    lastUpdated: number,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type ListUserCookiesQueryVariables = {
  filter?: ModelUserCookiesFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListUserCookiesQuery = {
  listUserCookies?:  {
    __typename: "ModelUserCookiesConnection",
    items:  Array< {
      __typename: "UserCookies",
      id: string,
      userId: string,
      cookies: string,
      lastUpdated: number,
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type OnCreateUserCookiesSubscriptionVariables = {
  filter?: ModelSubscriptionUserCookiesFilterInput | null,
  owner?: string | null,
};

export type OnCreateUserCookiesSubscription = {
  onCreateUserCookies?:  {
    __typename: "UserCookies",
    id: string,
    userId: string,
    cookies: string,
    lastUpdated: number,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type OnUpdateUserCookiesSubscriptionVariables = {
  filter?: ModelSubscriptionUserCookiesFilterInput | null,
  owner?: string | null,
};

export type OnUpdateUserCookiesSubscription = {
  onUpdateUserCookies?:  {
    __typename: "UserCookies",
    id: string,
    userId: string,
    cookies: string,
    lastUpdated: number,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type OnDeleteUserCookiesSubscriptionVariables = {
  filter?: ModelSubscriptionUserCookiesFilterInput | null,
  owner?: string | null,
};

export type OnDeleteUserCookiesSubscription = {
  onDeleteUserCookies?:  {
    __typename: "UserCookies",
    id: string,
    userId: string,
    cookies: string,
    lastUpdated: number,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};
