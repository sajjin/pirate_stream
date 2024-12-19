import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import AuthPage from './pages/AuthPages';
import HomePage from './pages/Home';
import { Amplify } from 'aws-amplify';
import './config';
import config from './amplifyconfiguration.json';
import { startSessionRefresh, refreshSession } from './auth/authHelper';

Amplify.configure(config);

const App: React.FC = () => {
  useEffect(() => {
    const initAuth = async () => {
      try {
        const isValid = await refreshSession();
        if (isValid) {
          startSessionRefresh();
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
        <Header />
        <div className="pt-[120px]">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
};

export default App;