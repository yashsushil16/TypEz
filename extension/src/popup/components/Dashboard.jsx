import React, { useState, useEffect } from 'react';
import SkeletonLoader from './SkeletonLoader';

const isChromeExtension =
  typeof chrome !== 'undefined' && typeof chrome.storage !== 'undefined';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [commands, setCommands] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      if (isChromeExtension) {
        const result = await chrome.storage.local.get([
          'stats',
          'commands',
          'ai_commands',
        ]);
        setStats(
          result.stats || {
            total_expansions: 0,
            total_ai_calls: 0,
            last_used: null,
          }
        );
        setCommands(result.commands || {});
      } else {
        // Dev mode mock data
        setStats({
          total_expansions: 42,
          total_ai_calls: 15,
          last_used: new Date().toISOString(),
        });
        setCommands({
          '?@': 'yash.sushil16@gmail.com',
          '?sig': 'Best regards,\nYash',
          '?phone': '+1-234-567-8900',
        });
      }
    } catch (err) {
      console.error('[TypEz] Failed to load dashboard data:', err);
      setStats({ total_expansions: 0, total_ai_calls: 0, last_used: null });
      setCommands({});
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="view-container">
        <SkeletonLoader type="dashboard" />
      </div>
    );
  }

  const commandCount = commands ? Object.keys(commands).length : 0;
  const lastUsed = stats?.last_used
    ? new Date(stats.last_used).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Never';

  return (
    <div className="view-container">
      <div className="view-header">
        <h1 className="view-title">Dashboard</h1>
        <p className="view-subtitle">Your TypEz activity at a glance</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-value">{stats.total_expansions}</span>
          <span className="stat-label">Text Expansions</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.total_ai_calls}</span>
          <span className="stat-label">AI Transforms</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{commandCount}</span>
          <span className="stat-label">Active Commands</span>
        </div>
        <div className="stat-card stat-card-wide">
          <span className="stat-value stat-value-sm">{lastUsed}</span>
          <span className="stat-label">Last Used</span>
        </div>
      </div>

      <div className="quick-ref">
        <h2 className="section-title">Quick Reference</h2>
        <div className="ref-card">
          <div className="ref-row">
            <code className="ref-trigger">?command</code>
            <span className="ref-desc">Local text expansion, no API calls</span>
          </div>
          <div className="ref-divider" />
          <div className="ref-row">
            <code className="ref-trigger">!command</code>
            <span className="ref-desc">AI-powered semantic rewrite</span>
          </div>
        </div>
      </div>

      <div className="quick-ref" style={{ marginTop: 12 }}>
        <h2 className="section-title">Your Shortcuts</h2>
        <div className="ref-card">
          {Object.entries(commands || {})
            .slice(0, 4)
            .map(([key, value], i, arr) => (
              <React.Fragment key={key}>
                <div className="ref-row">
                  <code className="ref-trigger">{key}</code>
                  <span className="ref-desc ref-desc-truncate">{value}</span>
                </div>
                {i < arr.length - 1 && <div className="ref-divider" />}
              </React.Fragment>
            ))}
        </div>
      </div>
    </div>
  );
}
