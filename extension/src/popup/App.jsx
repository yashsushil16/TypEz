import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CommandManager from './components/CommandManager';
import AISettings from './components/AISettings';
import SyncSettings from './components/SyncSettings';
import About from './components/About';

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'commands':
        return <CommandManager />;
      case 'ai':
        return <AISettings />;
      case 'sync':
        return <SyncSettings />;
      case 'about':
        return <About />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar activeView={activeView} onNavigate={setActiveView} />
      <main className="main-content">{renderView()}</main>
    </div>
  );
}
