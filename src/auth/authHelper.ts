import { fetchAuthSession, getCurrentUser } from 'aws-amplify/auth';

export const refreshSession = async () => {
  try {
    const session = await fetchAuthSession();
    if (session?.tokens) {
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error refreshing session:', error);
    return false;
  }
};

// Check and refresh session periodically
export const startSessionRefresh = () => {
  // Check every 30 minutes
  const REFRESH_INTERVAL = 30 * 60 * 1000; 

  setInterval(async () => {
    try {
      await refreshSession();
    } catch (error) {
      console.error('Session refresh failed:', error);
    }
  }, REFRESH_INTERVAL);
};