import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Search from './components/Search';
import Browse from './components/Browse';

function App() {
  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="fixed top-0 left-0 w-full bg-zinc-900 p-4 z-50">
        <div className="max-w-6xl mx-auto flex gap-4">
          <Link 
            to="/" 
            className="text-white hover:text-blue-400 transition-colors"
          >
            Search
          </Link>
          <Link 
            to="/browse" 
            className="text-white hover:text-blue-400 transition-colors"
          >
            Browse
          </Link>
        </div>
      </nav>
      
      <Routes>
        <Route path="/" element={<Search />} />
        <Route path="/browse" element={<Browse />} />
      </Routes>
    </div>
  );
}

export default App;