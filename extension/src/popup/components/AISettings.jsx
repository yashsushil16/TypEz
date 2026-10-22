import React, { useState, useEffect } from 'react';
import {
  Eye,
  EyeSlash,
  Plus,
  Trash,
  PencilSimple,
  FloppyDisk,
  X,
  CircleNotch,
} from '@phosphor-icons/react';
import SkeletonLoader from './SkeletonLoader';

const isChromeExtension =
  typeof chrome !== 'undefined' && typeof chrome.storage !== 'undefined';

export default function AISettings() {
  const [config, setConfig] = useState(null);
  const [aiCommands, setAiCommands] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showGroqKey, setShowGroqKey] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [testingProvider, setTestingProvider] = useState(null);
  const [testResult, setTestResult] = useState(null);

  // Add command form
  const [showAddCommand, setShowAddCommand] = useState(false);
  const [newCmdTrigger, setNewCmdTrigger] = useState('!');
  const [newCmdPrompt, setNewCmdPrompt] = useState('');

  // Edit command
  const [editingCmd, setEditingCmd] = useState(null);
  const [editCmdPrompt, setEditCmdPrompt] = useState('');

  useEffect(() => {
    loadConfig();
  }, []);

  async function loadConfig() {
    try {
      if (isChromeExtension) {
        const result = await chrome.storage.local.get([
          'ai_config',
          'ai_commands',
        ]);
        let cfg = result.ai_config || {
          primary_provider: 'groq',
          groq_api_key: '',
          gemini_api_key: '',
          groq_model: 'llama-3.1-8b-instant',
          gemini_model: 'gemini-3.8-flash',
        };
        let updated = false;
        if (!cfg.gemini_model || cfg.gemini_model === 'gemini-2.0-flash' || cfg.gemini_model === 'gemini-1.5-flash') {
          cfg.gemini_model = 'gemini-3.8-flash';
          updated = true;
        }
        if (!cfg.groq_model || cfg.groq_model === 'llama-3.3-70b-versatile') {
          cfg.groq_model = 'llama-3.1-8b-instant';
          updated = true;
        }
        if (updated) {
          chrome.storage.local.set({ ai_config: cfg });
        }
        setConfig(cfg);
        setAiCommands(result.ai_commands || {});
      } else {
        setConfig({
          primary_provider: 'groq',
          groq_api_key: '',
          gemini_api_key: '',
          groq_model: 'llama-3.1-8b-instant',
          gemini_model: 'gemini-3.8-flash',
        });
        setAiCommands({
          '!casual': 'Rewrite in a casual, conversational tone:',
          '!formal': 'Rewrite in a formal, professional tone:',
          '!summarize': 'Summarize this text concisely:',
          '!fix': 'Fix all grammar and spelling errors:',
          '!expand': 'Expand with additional detail:',
          '!shorten': 'Make this text more concise:',
        });
      }
    } catch (err) {
      console.error('[TypEz] Failed to load AI config:', err);
      setConfig({
        primary_provider: 'groq',
        groq_api_key: '',
        gemini_api_key: '',
        groq_model: 'llama-3.1-8b-instant',
        gemini_model: 'gemini-3.8-flash',
      });
      setAiCommands({});
    } finally {
      setIsLoading(false);
    }
  }

  async function saveConfig(updated) {
    setConfig(updated);
    if (isChromeExtension) {
      await chrome.storage.local.set({ ai_config: updated });
    }
  }

  async function saveAiCommands(updated) {
    setAiCommands(updated);
    if (isChromeExtension) {
      await chrome.storage.local.set({ ai_commands: updated });
    }
  }

  async function testKey(provider) {
    const key =
      provider === 'groq' ? config.groq_api_key : config.gemini_api_key;
    if (!key) {
      setTestResult({ provider, success: false, error: 'No API key entered' });
      return;
    }
    setTestingProvider(provider);
    setTestResult(null);
    try {
      if (isChromeExtension && chrome.runtime) {
        const result = await chrome.runtime.sendMessage({
          type: 'TEST_API_KEY',
          provider,
          apiKey: key,
        });
        setTestResult({ provider, ...result });
      } else {
        await new Promise((r) => setTimeout(r, 1200));
        setTestResult({ provider, success: true });
      }
    } catch (err) {
      setTestResult({ provider, success: false, error: err.message });
    } finally {
      setTestingProvider(null);
    }
  }

  function handleAddCommand() {
    if (!newCmdTrigger || newCmdTrigger === '!' || !newCmdPrompt.trim()) return;
    const trigger = newCmdTrigger.startsWith('!')
      ? newCmdTrigger
      : '!' + newCmdTrigger;
    saveAiCommands({ ...aiCommands, [trigger]: newCmdPrompt.trim() });
    setNewCmdTrigger('!');
    setNewCmdPrompt('');
    setShowAddCommand(false);
  }

  function handleDeleteCommand(key) {
    const updated = { ...aiCommands };
    delete updated[key];
    saveAiCommands(updated);
  }

  function handleSaveEditCommand(key) {
    if (!editCmdPrompt.trim()) return;
    saveAiCommands({ ...aiCommands, [key]: editCmdPrompt.trim() });
    setEditingCmd(null);
  }

  if (isLoading) {
    return (
      <div className="view-container">
        <SkeletonLoader type="ai" />
      </div>
    );
  }

  return (
    <div className="view-container">
      <div className="view-header">
        <h1 className="view-title">AI Settings</h1>
        <p className="view-subtitle">Configure providers and commands</p>
      </div>

      {/* ── Provider Selection ── */}
      <div className="section">
        <h2 className="section-title">Primary Provider</h2>
        <div className="provider-toggle">
          <button
            className={`provider-btn ${
              config.primary_provider === 'groq' ? 'provider-btn-active' : ''
            }`}
            onClick={() => saveConfig({ ...config, primary_provider: 'groq' })}
          >
            Groq
          </button>
          <button
            className={`provider-btn ${
              config.primary_provider === 'gemini' ? 'provider-btn-active' : ''
            }`}
            onClick={() =>
              saveConfig({ ...config, primary_provider: 'gemini' })
            }
          >
            Gemini
          </button>
        </div>
      </div>

      {/* ── API Keys ── */}
      <div className="section">
        <h2 className="section-title">API Keys</h2>

        <div className="key-field">
          <label className="field-label">Groq API Key</label>
          <div className="key-input-row">
            <input
              type={showGroqKey ? 'text' : 'password'}
              className="form-input"
              placeholder="gsk_..."
              value={config.groq_api_key}
              onChange={(e) =>
                saveConfig({ ...config, groq_api_key: e.target.value })
              }
            />
            <button
              className="btn-icon"
              onClick={() => setShowGroqKey(!showGroqKey)}
              title={showGroqKey ? 'Hide key' : 'Show key'}
            >
              {showGroqKey ? <EyeSlash size={16} /> : <Eye size={16} />}
            </button>
            <button
              className="btn-sm"
              onClick={() => testKey('groq')}
              disabled={testingProvider === 'groq'}
            >
              {testingProvider === 'groq' ? (
                <CircleNotch size={14} className="spin" />
              ) : (
                'Test'
              )}
            </button>
          </div>
          {testResult && testResult.provider === 'groq' && (
            <span
              className={`test-result ${
                testResult.success ? 'test-success' : 'test-error'
              }`}
            >
              {testResult.success ? 'Connected successfully' : testResult.error}
            </span>
          )}
        </div>

        <div className="key-field">
          <label className="field-label">Gemini API Key</label>
          <div className="key-input-row">
            <input
              type={showGeminiKey ? 'text' : 'password'}
              className="form-input"
              placeholder="AIza..."
              value={config.gemini_api_key}
              onChange={(e) =>
                saveConfig({ ...config, gemini_api_key: e.target.value })
              }
            />
            <button
              className="btn-icon"
              onClick={() => setShowGeminiKey(!showGeminiKey)}
              title={showGeminiKey ? 'Hide key' : 'Show key'}
            >
              {showGeminiKey ? <EyeSlash size={16} /> : <Eye size={16} />}
            </button>
            <button
              className="btn-sm"
              onClick={() => testKey('gemini')}
              disabled={testingProvider === 'gemini'}
            >
              {testingProvider === 'gemini' ? (
                <CircleNotch size={14} className="spin" />
              ) : (
                'Test'
              )}
            </button>
          </div>
          {testResult && testResult.provider === 'gemini' && (
            <span
              className={`test-result ${
                testResult.success ? 'test-success' : 'test-error'
              }`}
            >
              {testResult.success ? 'Connected successfully' : testResult.error}
            </span>
          )}
        </div>
      </div>

      {/* ── AI Commands ── */}
      <div className="section">
        <div className="section-header">
          <h2 className="section-title">AI Commands</h2>
          <button
            className="btn-primary btn-xs"
            onClick={() => setShowAddCommand(!showAddCommand)}
          >
            {showAddCommand ? <X size={14} /> : <Plus size={14} />}
            <span>{showAddCommand ? 'Cancel' : 'Add'}</span>
          </button>
        </div>

        {showAddCommand && (
          <div className="add-form">
            <div className="form-col">
              <input
                type="text"
                className="form-input form-input-trigger"
                placeholder="!trigger"
                value={newCmdTrigger}
                onChange={(e) => setNewCmdTrigger(e.target.value)}
              />
              <textarea
                className="form-input form-textarea"
                placeholder="Prompt template for this command..."
                value={newCmdPrompt}
                onChange={(e) => setNewCmdPrompt(e.target.value)}
                rows={2}
              />
              <button
                className="btn-primary btn-xs"
                onClick={handleAddCommand}
                style={{ alignSelf: 'flex-end' }}
              >
                <FloppyDisk size={14} />
                <span>Save</span>
              </button>
            </div>
          </div>
        )}

        <div className="command-list">
          {Object.entries(aiCommands || {}).map(([key, value]) => (
            <div key={key} className="command-item">
              {editingCmd === key ? (
                <div className="command-edit">
                  <code className="command-trigger">{key}</code>
                  <textarea
                    className="form-input form-textarea"
                    value={editCmdPrompt}
                    onChange={(e) => setEditCmdPrompt(e.target.value)}
                    rows={2}
                    autoFocus
                  />
                  <div className="command-actions">
                    <button
                      className="btn-icon btn-save"
                      onClick={() => handleSaveEditCommand(key)}
                      title="Save"
                    >
                      <FloppyDisk size={14} />
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => setEditingCmd(null)}
                      title="Cancel"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="command-info">
                    <code className="command-trigger">{key}</code>
                    <span className="command-expansion">{value}</span>
                  </div>
                  <div className="command-actions">
                    <button
                      className="btn-icon"
                      onClick={() => {
                        setEditingCmd(key);
                        setEditCmdPrompt(value);
                      }}
                      title="Edit"
                    >
                      <PencilSimple size={14} />
                    </button>
                    <button
                      className="btn-icon btn-danger"
                      onClick={() => handleDeleteCommand(key)}
                      title="Delete"
                    >
                      <Trash size={14} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
