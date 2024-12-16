import { generateClient } from 'aws-amplify/api';
import { getCurrentUser } from 'aws-amplify/auth';
import { GraphQLResult } from '@aws-amplify/api-graphql';

const client = generateClient();

const queries = {
  getUserCookiesByUserId: /* GraphQL */ `
    query GetUserCookiesByUserId($userId: String!) {
      getUserCookiesByUserId(userId: $userId) {
        items {
          id
          cookies
          lastUpdated
        }
      }
    }
  `
};

const mutations = {
  createUserCookies: /* GraphQL */ `
    mutation CreateUserCookies($input: CreateUserCookiesInput!) {
      createUserCookies(input: $input) {
        id
        cookies
        lastUpdated
      }
    }
  `,
  updateUserCookies: /* GraphQL */ `
    mutation UpdateUserCookies($input: UpdateUserCookiesInput!) {
      updateUserCookies(input: $input) {
        id
        cookies
        lastUpdated
      }
    }
  `
};

export const cookieSync = {
  async saveCookies(): Promise<void> {
    try {
      const user = await getCurrentUser();
      const allCookies = document.cookie;
      
      // First try to get existing cookies
      const existingResult = await client.graphql({
        query: queries.getUserCookiesByUserId,
        variables: {
          userId: user.userId
        }
      }) as GraphQLResult<any>;

      const existingCookies = existingResult.data?.getUserCookiesByUserId?.items?.[0];

      if (existingCookies) {
        // Update existing cookies
        await client.graphql({
          query: mutations.updateUserCookies,
          variables: {
            input: {
              id: existingCookies.id,
              cookies: allCookies,
              lastUpdated: Date.now()
            }
          }
        });
      } else {
        // Create new cookies entry
        await client.graphql({
          query: mutations.createUserCookies,
          variables: {
            input: {
              userId: user.userId,
              cookies: allCookies,
              lastUpdated: Date.now()
            }
          }
        });
      }
    } catch (error) {
      console.error('Error saving cookies:', error);
    }
  },

  async loadCookies(): Promise<void> {
    try {
      const user = await getCurrentUser();
      const result = await client.graphql({
        query: queries.getUserCookiesByUserId,
        variables: {
          userId: user.userId
        }
      }) as GraphQLResult<any>;

      const savedCookies = result.data?.getUserCookiesByUserId?.items?.[0]?.cookies;
      
      if (savedCookies) {
        // Clear existing cookies
        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
          const name = cookie.split('=')[0].trim();
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
        }

        // Set saved cookies
        const cookieArray = savedCookies.split(';');
        for (const cookie of cookieArray) {
          document.cookie = cookie.trim();
        }
      }
    } catch (error) {
      console.error('Error loading cookies:', error);
    }
  },

  startAutoSync(intervalMinutes: number = 5): NodeJS.Timer {
    if (window.cookieSyncInterval) {
      clearInterval(window.cookieSyncInterval);
    }
    
    const interval = setInterval(() => {
      this.saveCookies();
    }, intervalMinutes * 60 * 1000);
    
    return interval;
  }
};