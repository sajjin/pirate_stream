export type GetUserCookiesQuery = {
    getUserCookies?: {
      cookies: string;
      lastUpdated: number;
    } | null;
  };
  
  export type UpdateUserCookiesMutation = {
    updateUserCookies?: {
      userId: string;
      cookies: string;
      lastUpdated: number;
    } | null;
  };
  