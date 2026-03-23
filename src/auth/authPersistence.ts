// src/services/authPersistence.ts
import { fetchAuthSession, signIn, getCurrentUser } from 'aws-amplify/auth';

interface StoredCredentials {
  username: string;
  timestamp: number;
}

export const authPersistence = {
  async storeCredentials(username: string) {
    try {
      const credentials: StoredCredentials = {
        username,
        timestamp: Date.now()
      };
      localStorage.setItem('auth_persist', JSON.stringify(credentials));
      
      // Store the session
      const session = await fetchAuthSession();
      if (session.tokens) {
        localStorage.setItem('auth_session', JSON.stringify({
          tokens: session.tokens,
          timestamp: Date.now()
        }));
      }
    } catch (error) {
      console.error('Error storing credentials:', error);
    }
  },

  async checkAndRestoreSession() {
    try {
      // First try to get current session
      try {
        const user = await getCurrentUser();
        if (user) {
          return true;
        }
      } catch (e) {
        // No current session, continue to restoration attempt
      }

      // Check for stored session
      const storedSession = localStorage.getItem('auth_session');
      if (storedSession) {
        const { tokens, timestamp } = JSON.parse(storedSession);
        // If stored session is less than 30 days old
        if (Date.now() - timestamp < 30 * 24 * 60 * 60 * 1000) {
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Error restoring session:', error);
      return false;
    }
  },

  async refreshToken() {
    try {
      const session = await fetchAuthSession();
      if (session.tokens) {
        localStorage.setItem('auth_session', JSON.stringify({
          tokens: session.tokens,
          timestamp: Date.now()
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
    }
  },

  clearStoredAuth() {
    localStorage.removeItem('auth_persist');
    localStorage.removeItem('auth_session');
  }
};