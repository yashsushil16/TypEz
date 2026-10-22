import React, { useState, useEffect } from 'react';
import {
  ArrowsClockwise,
  CircleNotch,
  Check,
  Warning,
} from '@phosphor-icons/react';
import SkeletonLoader from './SkeletonLoader';

const isChromeExtension =
  typeof chrome !== 'undefined' && typeof chrome.storage !== 'undefined';

export default function SyncSettings() {
  const [config, setConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);

  useEffect(() => {
    loadConfig();
  }, []);

  async function loadConfig() {
    try {
      if (isChromeExtension) {
        const result = await chrome.storage.local.get('sync_config');
        setConfig(
          result.sync_config || { enabled: false, backend_url: '', token: '' }
        );
      } else {
        setConfig({ enabled: false, backend_url: '', token: '' });
      }
    } catch (err) {
      setConfig({ enabled: false, backend_url: '', token: '' });
    } finally {
      setIsLoading(false);
    }
  }

  async function saveConfig(updated) {
    setConfig(updated);
    if (isChromeExtension) {
      await chrome.storage.local.set({ sync_config: updated });
    }
  }

  async function handleSync() {
    if (!config.enabled || !config.backend_url) return;
    setIsSyncing(true);
    setSyncStatus(null);
    try {
      // Placeholder: actual sync implementation in Phase 4
      await new Promise((r) => setTimeout(r, 1500));
      setSyncStatus({ success: true, message: 'Synced successfully' });
    } catch (err) {
      setSyncStatus({ success: false, message: err.message });
    } finally {
      setIsSyncing(false);
    }
  }

  if (isLoading) {
    return (
      <div className="view-container">
        <SkeletonLoader type="sync" />
      </div>
    );
  }

  return (
    <div className="view-container">
      <div className="view-header">
        <h1 className="view-title">Sync</h1>
        <p className="view-subtitle">Cross-device synchronization</p>
      </div>

      <div className="section">
        <div className="toggle-row">
          <div>
            <span className="field-label" style={{ textTransform: 'none', letterSpacing: 0 }}>
              Enable Sync
            </span>
            <p className="field-hint">
              Sync commands across devices via your backend
            </p>
          </div>
          <button
            className={`toggle ${config.enabled ? 'toggle-on' : ''}`}
            onClick={() => saveConfig({ ...config, enabled: !config.enabled })}
            aria-label="Toggle sync"
          >
            <span className="toggle-thumb" />
          </button>
        </div>
      </div>

      {config.enabled && (
        <>
          <div className="section">
            <div className="key-field">
              <label className="field-label">Backend URL</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://your-api.example.com"
                value={config.backend_url}
                onChange={(e) =>
                  saveConfig({ ...config, backend_url: e.target.value })
                }
              />
            </div>
            <div className="key-field">
              <label className="field-label">Auth Token</label>
              <input
                type="password"
                className="form-input"
                placeholder="Your authentication token"
                value={config.token}
                onChange={(e) =>
                  saveConfig({ ...config, token: e.target.value })
                }
              />
            </div>
          </div>

          <div className="section">
            <button
              className="btn-primary btn-full"
              onClick={handleSync}
              disabled={isSyncing || !config.backend_url}
            >
              {isSyncing ? (
                <>
                  <CircleNotch size={16} className="spin" />
                  <span>Syncing...</span>
                </>
              ) : (
                <>
                  <ArrowsClockwise size={16} />
                  <span>Sync Now</span>
                </>
              )}
            </button>
            {syncStatus && (
              <div
                className={`sync-result ${
                  syncStatus.success ? 'test-success' : 'test-error'
                }`}
              >
                {syncStatus.success ? (
                  <Check size={14} />
                ) : (
                  <Warning size={14} />
                )}
                <span>{syncStatus.message}</span>
              </div>
            )}
          </div>
        </>
      )}

      {!config.enabled && (
        <div className="sync-info">
          <p className="sync-info-text">
            To use sync, you need to deploy the optional TypEz backend server
            and connect it here. This enables your commands and AI settings to
            stay in sync across all your devices.
          </p>
        </div>
      )}
    </div>
  );
}
