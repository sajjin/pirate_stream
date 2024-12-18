/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type CreateWatchHistoryInput = {
  id?: string | null,
  userId: string,
  imdbID: string,
  title: string,
  type: string,
  season?: string | null,
  episode?: string | null,
  episodeTitle?: string | null,
  progress?: number | null,
  timestamp: number,
  poster?: string | null,
  tmdbId?: string | null,
};

export type ModelWatchHistoryConditionInput = {
  userId?: ModelStringInput | null,
  imdbID?: ModelStringInput | null,
  title?: ModelStringInput | null,
  type?: ModelStringInput | null,
  season?: ModelStringInput | null,
  episode?: ModelStringInput | null,
  episodeTitle?: ModelStringInput | null,
  progress?: ModelFloatInput | null,
  timestamp?: ModelIntInput | null,
  poster?: ModelStringInput | null,
  tmdbId?: ModelStringInput | null,
  and?: Array< ModelWatchHistoryConditionInput | null > | null,
  or?: Array< ModelWatchHistoryConditionInput | null > | null,
  not?: ModelWatchHistoryConditionInput | null,
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

export type ModelFloatInput = {
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

export type WatchHistory = {
  __typename: "WatchHistory",
  id: string,
  userId: string,
  imdbID: string,
  title: string,
  type: string,
  season?: string | null,
  episode?: string | null,
  episodeTitle?: string | null,
  progress?: number | null,
  timestamp: number,
  poster?: string | null,
  tmdbId?: string | null,
  createdAt: string,
  updatedAt: string,
  owner?: string | null,
};

export type UpdateWatchHistoryInput = {
  id: string,
  userId?: string | null,
  imdbID?: string | null,
  title?: string | null,
  type?: string | null,
  season?: string | null,
  episode?: string | null,
  episodeTitle?: string | null,
  progress?: number | null,
  timestamp?: number | null,
  poster?: string | null,
  tmdbId?: string | null,
};

export type DeleteWatchHistoryInput = {
  id: string,
};

export type ModelWatchHistoryFilterInput = {
  id?: ModelIDInput | null,
  userId?: ModelStringInput | null,
  imdbID?: ModelStringInput | null,
  title?: ModelStringInput | null,
  type?: ModelStringInput | null,
  season?: ModelStringInput | null,
  episode?: ModelStringInput | null,
  episodeTitle?: ModelStringInput | null,
  progress?: ModelFloatInput | null,
  timestamp?: ModelIntInput | null,
  poster?: ModelStringInput | null,
  tmdbId?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelWatchHistoryFilterInput | null > | null,
  or?: Array< ModelWatchHistoryFilterInput | null > | null,
  not?: ModelWatchHistoryFilterInput | null,
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

export type ModelWatchHistoryConnection = {
  __typename: "ModelWatchHistoryConnection",
  items:  Array<WatchHistory | null >,
  nextToken?: string | null,
};

export type ModelSubscriptionWatchHistoryFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  userId?: ModelSubscriptionStringInput | null,
  imdbID?: ModelSubscriptionStringInput | null,
  title?: ModelSubscriptionStringInput | null,
  type?: ModelSubscriptionStringInput | null,
  season?: ModelSubscriptionStringInput | null,
  episode?: ModelSubscriptionStringInput | null,
  episodeTitle?: ModelSubscriptionStringInput | null,
  progress?: ModelSubscriptionFloatInput | null,
  timestamp?: ModelSubscriptionIntInput | null,
  poster?: ModelSubscriptionStringInput | null,
  tmdbId?: ModelSubscriptionStringInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionWatchHistoryFilterInput | null > | null,
  or?: Array< ModelSubscriptionWatchHistoryFilterInput | null > | null,
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

export type ModelSubscriptionFloatInput = {
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

export type CreateWatchHistoryMutationVariables = {
  input: CreateWatchHistoryInput,
  condition?: ModelWatchHistoryConditionInput | null,
};

export type CreateWatchHistoryMutation = {
  createWatchHistory?:  {
    __typename: "WatchHistory",
    id: string,
    userId: string,
    imdbID: string,
    title: string,
    type: string,
    season?: string | null,
    episode?: string | null,
    episodeTitle?: string | null,
    progress?: number | null,
    timestamp: number,
    poster?: string | null,
    tmdbId?: string | null,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type UpdateWatchHistoryMutationVariables = {
  input: UpdateWatchHistoryInput,
  condition?: ModelWatchHistoryConditionInput | null,
};

export type UpdateWatchHistoryMutation = {
  updateWatchHistory?:  {
    __typename: "WatchHistory",
    id: string,
    userId: string,
    imdbID: string,
    title: string,
    type: string,
    season?: string | null,
    episode?: string | null,
    episodeTitle?: string | null,
    progress?: number | null,
    timestamp: number,
    poster?: string | null,
    tmdbId?: string | null,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type DeleteWatchHistoryMutationVariables = {
  input: DeleteWatchHistoryInput,
  condition?: ModelWatchHistoryConditionInput | null,
};

export type DeleteWatchHistoryMutation = {
  deleteWatchHistory?:  {
    __typename: "WatchHistory",
    id: string,
    userId: string,
    imdbID: string,
    title: string,
    type: string,
    season?: string | null,
    episode?: string | null,
    episodeTitle?: string | null,
    progress?: number | null,
    timestamp: number,
    poster?: string | null,
    tmdbId?: string | null,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type GetWatchHistoryQueryVariables = {
  id: string,
};

export type GetWatchHistoryQuery = {
  getWatchHistory?:  {
    __typename: "WatchHistory",
    id: string,
    userId: string,
    imdbID: string,
    title: string,
    type: string,
    season?: string | null,
    episode?: string | null,
    episodeTitle?: string | null,
    progress?: number | null,
    timestamp: number,
    poster?: string | null,
    tmdbId?: string | null,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type ListWatchHistoriesQueryVariables = {
  filter?: ModelWatchHistoryFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListWatchHistoriesQuery = {
  listWatchHistories?:  {
    __typename: "ModelWatchHistoryConnection",
    items:  Array< {
      __typename: "WatchHistory",
      id: string,
      userId: string,
      imdbID: string,
      title: string,
      type: string,
      season?: string | null,
      episode?: string | null,
      episodeTitle?: string | null,
      progress?: number | null,
      timestamp: number,
      poster?: string | null,
      tmdbId?: string | null,
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type OnCreateWatchHistorySubscriptionVariables = {
  filter?: ModelSubscriptionWatchHistoryFilterInput | null,
  owner?: string | null,
};

export type OnCreateWatchHistorySubscription = {
  onCreateWatchHistory?:  {
    __typename: "WatchHistory",
    id: string,
    userId: string,
    imdbID: string,
    title: string,
    type: string,
    season?: string | null,
    episode?: string | null,
    episodeTitle?: string | null,
    progress?: number | null,
    timestamp: number,
    poster?: string | null,
    tmdbId?: string | null,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type OnUpdateWatchHistorySubscriptionVariables = {
  filter?: ModelSubscriptionWatchHistoryFilterInput | null,
  owner?: string | null,
};

export type OnUpdateWatchHistorySubscription = {
  onUpdateWatchHistory?:  {
    __typename: "WatchHistory",
    id: string,
    userId: string,
    imdbID: string,
    title: string,
    type: string,
    season?: string | null,
    episode?: string | null,
    episodeTitle?: string | null,
    progress?: number | null,
    timestamp: number,
    poster?: string | null,
    tmdbId?: string | null,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type OnDeleteWatchHistorySubscriptionVariables = {
  filter?: ModelSubscriptionWatchHistoryFilterInput | null,
  owner?: string | null,
};

export type OnDeleteWatchHistorySubscription = {
  onDeleteWatchHistory?:  {
    __typename: "WatchHistory",
    id: string,
    userId: string,
    imdbID: string,
    title: string,
    type: string,
    season?: string | null,
    episode?: string | null,
    episodeTitle?: string | null,
    progress?: number | null,
    timestamp: number,
    poster?: string | null,
    tmdbId?: string | null,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};
