// auth/authHelper.ts
import { fetchAuthSession, getCurrentUser } from 'aws-amplify/auth';
import { Amplify } from 'aws-amplify';

// Store auth data in localStorage
export const storeAuthData = (tokens: any) => {
  try {
    localStorage.setItem('authRefreshToken', tokens.refreshToken?.toString());
  } catch (error) {
    console.error('Error storing auth data:', error);
  }
};

// Get stored auth data
export const getStoredAuthData = () => {
  try {
    return localStorage.getItem('authRefreshToken');
  } catch (error) {
    console.error('Error getting stored auth data:', error);
    return null;
  }
};

export const refreshSession = async () => {
  try {
    const session = await fetchAuthSession();
    if (session?.tokens) {
      storeAuthData(session.tokens);
      return true;
    }
    
    const storedToken = getStoredAuthData();
    if (storedToken) {
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error refreshing session:', error);
    return false;
  }
};

export const startSessionRefresh = () => {
  // Check every 15 minutes
  const REFRESH_INTERVAL = 15 * 60 * 1000;

  // Immediately store current session
  fetchAuthSession().then(session => {
    if (session?.tokens) {
      storeAuthData(session.tokens);
    }
  });

  return setInterval(async () => {
    try {
      const session = await fetchAuthSession();
      if (session?.tokens) {
        storeAuthData(session.tokens);
      }
    } catch (error) {
      console.error('Session refresh failed:', error);
    }
  }, REFRESH_INTERVAL);
};

export const clearStoredAuth = () => {
  localStorage.removeItem('authRefreshToken');
};