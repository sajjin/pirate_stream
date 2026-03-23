/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type CreateContinueWatchingInput = {
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

export type ModelContinueWatchingConditionInput = {
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
  and?: Array< ModelContinueWatchingConditionInput | null > | null,
  or?: Array< ModelContinueWatchingConditionInput | null > | null,
  not?: ModelContinueWatchingConditionInput | null,
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

export type ContinueWatching = {
  __typename: "ContinueWatching",
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

export type UpdateContinueWatchingInput = {
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

export type DeleteContinueWatchingInput = {
  id: string,
};

export type ModelContinueWatchingFilterInput = {
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
  and?: Array< ModelContinueWatchingFilterInput | null > | null,
  or?: Array< ModelContinueWatchingFilterInput | null > | null,
  not?: ModelContinueWatchingFilterInput | null,
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

export type ModelContinueWatchingConnection = {
  __typename: "ModelContinueWatchingConnection",
  items:  Array<ContinueWatching | null >,
  nextToken?: string | null,
};

export type ModelSubscriptionContinueWatchingFilterInput = {
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
  and?: Array< ModelSubscriptionContinueWatchingFilterInput | null > | null,
  or?: Array< ModelSubscriptionContinueWatchingFilterInput | null > | null,
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

export type CreateContinueWatchingMutationVariables = {
  input: CreateContinueWatchingInput,
  condition?: ModelContinueWatchingConditionInput | null,
};

export type CreateContinueWatchingMutation = {
  createContinueWatching?:  {
    __typename: "ContinueWatching",
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

export type UpdateContinueWatchingMutationVariables = {
  input: UpdateContinueWatchingInput,
  condition?: ModelContinueWatchingConditionInput | null,
};

export type UpdateContinueWatchingMutation = {
  updateContinueWatching?:  {
    __typename: "ContinueWatching",
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

export type DeleteContinueWatchingMutationVariables = {
  input: DeleteContinueWatchingInput,
  condition?: ModelContinueWatchingConditionInput | null,
};

export type DeleteContinueWatchingMutation = {
  deleteContinueWatching?:  {
    __typename: "ContinueWatching",
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

export type GetContinueWatchingQueryVariables = {
  id: string,
};

export type GetContinueWatchingQuery = {
  getContinueWatching?:  {
    __typename: "ContinueWatching",
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

export type ListContinueWatchingsQueryVariables = {
  filter?: ModelContinueWatchingFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListContinueWatchingsQuery = {
  listContinueWatchings?:  {
    __typename: "ModelContinueWatchingConnection",
    items:  Array< {
      __typename: "ContinueWatching",
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

export type OnCreateContinueWatchingSubscriptionVariables = {
  filter?: ModelSubscriptionContinueWatchingFilterInput | null,
  owner?: string | null,
};

export type OnCreateContinueWatchingSubscription = {
  onCreateContinueWatching?:  {
    __typename: "ContinueWatching",
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

export type OnUpdateContinueWatchingSubscriptionVariables = {
  filter?: ModelSubscriptionContinueWatchingFilterInput | null,
  owner?: string | null,
};

export type OnUpdateContinueWatchingSubscription = {
  onUpdateContinueWatching?:  {
    __typename: "ContinueWatching",
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

export type OnDeleteContinueWatchingSubscriptionVariables = {
  filter?: ModelSubscriptionContinueWatchingFilterInput | null,
  owner?: string | null,
};

export type OnDeleteContinueWatchingSubscription = {
  onDeleteContinueWatching?:  {
    __typename: "ContinueWatching",
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
