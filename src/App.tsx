import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Homepage from './components/Home';


function App() {
  return (
    <div className="min-h-screen bg-black text-white">
     
      <Routes>
        <Route path="/" element={<Homepage />} />
      </Routes>
    </div>
  );
}

export default App;