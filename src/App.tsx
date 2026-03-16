import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthPage from './pages/AuthPages';
import HomePage from './pages/Home';
import MediaDetailsPage from './pages/MediaDetails';
import './config';
import { authPersistence } from './auth/authPersistence';


const App: React.FC = () => {
  useEffect(() => {
    const initAuth = async () => {
      try {
        const isAuthenticated = await authPersistence.checkAndRestoreSession();
        if (isAuthenticated) {
          // Start periodic token refresh
          const refreshInterval = setInterval(async () => {
            const refreshed = await authPersistence.refreshToken();
            if (!refreshed) {
              clearInterval(refreshInterval);
            }
          }, 45 * 60 * 1000); // Refresh every 45 minutes

          return () => clearInterval(refreshInterval);
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
      }
    };

    initAuth();
  }, []);


  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-900">
        <div>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/watch/:type/:imdbID" element={<MediaDetailsPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
};

export default App;