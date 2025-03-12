import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import TicketsPage from './pages/TicketsPage';

const App: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: 'rgb(38, 38, 36)' }}>
      <header className="p-4 flex items-center gap-2">
        <img src="/claude-logo.png" alt="Claude Logo" className="w-8 h-8" />
        <h1 className="text-2xl font-bold text-white">Claude PM</h1>
      </header>
      <div className="container px-4 pb-4 flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tickets" element={<TicketsPage />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;