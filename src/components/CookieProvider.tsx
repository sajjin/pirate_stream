import React, { useEffect } from 'react';
import { Hub } from 'aws-amplify/utils';
import { cookieSync } from '../services/watchHistorySync';

export const CookieProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    // Listen for auth events
    const listener = Hub.listen('auth', async ({ payload }) => {
      switch (payload.event) {
        case 'signedIn':
          console.log('Loading cookies after sign in...');
          await cookieSync.loadCookies();
          // Store the interval ID in the window object
          window.cookieSyncInterval = cookieSync.startAutoSync();
          break;
        case 'signedOut':
          // Stop syncing cookies when user signs out
          if (window.cookieSyncInterval) {
            clearInterval(window.cookieSyncInterval);
            window.cookieSyncInterval = undefined;
          }
          break;
      }
    });

    return () => {
      // Cleanup listener and interval
      listener();
      if (window.cookieSyncInterval) {
        clearInterval(window.cookieSyncInterval);
        window.cookieSyncInterval = undefined;
      }
    };
  }, []);

  return <>{children}</>;
};

