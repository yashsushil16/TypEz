import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash,
  PencilSimple,
  FloppyDisk,
  X,
} from '@phosphor-icons/react';
import SkeletonLoader from './SkeletonLoader';

const isChromeExtension =
  typeof chrome !== 'undefined' && typeof chrome.storage !== 'undefined';

export default function CommandManager() {
  const [commands, setCommands] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editingKey, setEditingKey] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTrigger, setNewTrigger] = useState('?');
  const [newExpansion, setNewExpansion] = useState('');
  const [editExpansion, setEditExpansion] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadCommands();
  }, []);

  async function loadCommands() {
    try {
      if (isChromeExtension) {
        const result = await chrome.storage.local.get('commands');
        setCommands(result.commands || {});
      } else {
        setCommands({
          '?@': 'yash.sushil16@gmail.com',
          '?phone': '+1-234-567-8900',
          '?sig': 'Best regards,\nYash',
          '?addr': '123 Main Street, City, State 12345',
        });
      }
    } catch (err) {
      console.error('[TypEz] Failed to load commands:', err);
      setCommands({});
    } finally {
      setIsLoading(false);
    }
  }

  async function saveCommands(updated) {
    setCommands(updated);
    if (isChromeExtension) {
      await chrome.storage.local.set({ commands: updated });
    }
  }

  function handleAdd() {
    if (!newTrigger || newTrigger === '?' || !newExpansion.trim()) return;
    const trigger = newTrigger.startsWith('?') ? newTrigger : '?' + newTrigger;
    saveCommands({ ...commands, [trigger]: newExpansion.trim() });
    setNewTrigger('?');
    setNewExpansion('');
    setShowAddForm(false);
  }

  function handleDelete(key) {
    const updated = { ...commands };
    delete updated[key];
    saveCommands(updated);
  }

  function handleEdit(key) {
    setEditingKey(key);
    setEditExpansion(commands[key]);
  }

  function handleSaveEdit(key) {
    if (!editExpansion.trim()) return;
    saveCommands({ ...commands, [key]: editExpansion.trim() });
    setEditingKey(null);
    setEditExpansion('');
  }

  if (isLoading) {
    return (
      <div className="view-container">
        <SkeletonLoader type="commands" />
      </div>
    );
  }

  const entries = Object.entries(commands || {}).filter(
    ([key, val]) =>
      key.toLowerCase().includes(search.toLowerCase()) ||
      val.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="view-container">
      <div className="view-header">
        <h1 className="view-title">Commands</h1>
        <p className="view-subtitle">Manage your ? text expansions</p>
      </div>

      <div className="toolbar">
        <input
          type="text"
          className="search-input"
          placeholder="Search commands..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          className="btn-primary"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? <X size={16} /> : <Plus size={16} />}
          <span>{showAddForm ? 'Cancel' : 'Add'}</span>
        </button>
      </div>

      {showAddForm && (
        <div className="add-form">
          <div className="form-row">
            <input
              type="text"
              className="form-input form-input-trigger"
              placeholder="?trigger"
              value={newTrigger}
              onChange={(e) => setNewTrigger(e.target.value)}
            />
            <input
              type="text"
              className="form-input"
              placeholder="Expansion text"
              value={newExpansion}
              onChange={(e) => setNewExpansion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <button className="btn-icon btn-save" onClick={handleAdd} title="Save">
              <FloppyDisk size={16} />
            </button>
          </div>
        </div>
      )}

      <div className="command-list">
        {entries.length === 0 ? (
          <div className="empty-state">
            <p className="empty-text">
              {search ? 'No commands match your search' : 'No commands yet'}
            </p>
          </div>
        ) : (
          entries.map(([key, value]) => (
            <div key={key} className="command-item">
              {editingKey === key ? (
                <div className="command-edit">
                  <code className="command-trigger">{key}</code>
                  <input
                    type="text"
                    className="form-input"
                    value={editExpansion}
                    onChange={(e) => setEditExpansion(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(key)}
                    autoFocus
                  />
                  <div className="command-actions">
                    <button
                      className="btn-icon btn-save"
                      onClick={() => handleSaveEdit(key)}
                      title="Save"
                    >
                      <FloppyDisk size={14} />
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => setEditingKey(null)}
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
                      onClick={() => handleEdit(key)}
                      title="Edit"
                    >
                      <PencilSimple size={14} />
                    </button>
                    <button
                      className="btn-icon btn-danger"
                      onClick={() => handleDelete(key)}
                      title="Delete"
                    >
                      <Trash size={14} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
