import React from 'react';
import {
  SquaresFour,
  TextT,
  Brain,
  ArrowsClockwise,
  Info,
} from '@phosphor-icons/react';

const navItems = [
  { id: 'dashboard', icon: SquaresFour, label: 'Dashboard' },
  { id: 'commands', icon: TextT, label: 'Commands' },
  { id: 'ai', icon: Brain, label: 'AI Settings' },
  { id: 'sync', icon: ArrowsClockwise, label: 'Sync' },
  { id: 'about', icon: Info, label: 'About' },
];

export default function Sidebar({ activeView, onNavigate }) {
  return (
    <nav className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-text">Tz</span>
      </div>
      <div className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              className={`sidebar-btn ${isActive ? 'sidebar-btn-active' : ''}`}
              onClick={() => onNavigate(item.id)}
              title={item.label}
              aria-label={item.label}
            >
              <Icon size={20} weight={isActive ? 'fill' : 'regular'} />
            </button>
          );
        })}
      </div>
    </nav>
  );
}
