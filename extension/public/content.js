/**
 * TypEz Content Script
 * ─────────────────────
 * Monitors keystrokes and input streams across all web inputs and executes text transformations.
 *
 * ? triggers  →  local text expansion (instant 0ms, zero network calls)
 * ! triggers  →  AI-powered text transformation via background service worker
 *
 * Handles: <input>, <textarea>, [contenteditable], and shadow DOM inputs (Google Search, etc.).
 */
(function () {
  'use strict';

  /* ── Built-in Fallback Snippets ── */
  const FALLBACK_COMMANDS = {
    '?@': 'yash.sushil16@gmail.com',
    '?phone': '+1-234-567-8900',
    '?sig': 'Best regards,\nYash',
    '?addr': '123 Main Street, City',
  };

  /* ── In-Memory Sync Cache ── */
  let cachedCommands = { ...FALLBACK_COMMANDS };
  let buffer = '';
  let isTracking = false;
  let triggerChar = null;

  function loadCachedCommands() {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get('commands', (res) => {
        if (res && res.commands) {
          cachedCommands = { ...FALLBACK_COMMANDS, ...res.commands };
        }
      });
      chrome.storage.onChanged.addListener((changes, area) => {
        if (area === 'local' && changes.commands) {
          cachedCommands = { ...FALLBACK_COMMANDS, ...(changes.commands.newValue || {}) };
        }
      });
    }
  }

  /* ── Boot ── */
  function init() {
    loadCachedCommands();
    // Attach in capture phase so we intercept before web apps stop propagation
    document.addEventListener('keydown', onKeydown, true);
    observeDynamicInputs();
  }

  /* ── Input element resolution (pierces Shadow DOM) ── */
  function isTextInput(el) {
    if (!el || typeof el.tagName !== 'string') return false;
    const tag = el.tagName.toUpperCase();
    if (tag === 'INPUT') {
      const type = (el.type || 'text').toLowerCase();
      return ['text', 'email', 'search', 'url', 'tel', 'number', ''].includes(type);
    }
    if (tag === 'TEXTAREA') return true;
    if (el.isContentEditable) return true;
    return false;
  }

  function getActiveElement(e) {
    if (e && e.composedPath) {
      const path = e.composedPath();
      for (let i = 0; i < path.length; i++) {
        if (isTextInput(path[i])) return path[i];
      }
    }
    if (e && e.target && isTextInput(e.target)) return e.target;
    const active = document.activeElement;
    if (active) {
      if (active.shadowRoot && active.shadowRoot.activeElement && isTextInput(active.shadowRoot.activeElement)) {
        return active.shadowRoot.activeElement;
      }
      if (isTextInput(active)) return active;
    }
    return null;
  }

  /* ── Keystroke Handler ── */
  function onKeydown(e) {
    const el = getActiveElement(e);
    if (!el) return;

    const key = e.key;

    // Start tracking on trigger chars
    if (!isTracking && (key === '?' || key === '!')) {
      isTracking = true;
      triggerChar = key;
      buffer = key;
      return;
    }

    if (!isTracking) return;

    // Fire trigger on Space or Enter
    if (key === ' ' || key === 'Enter') {
      if (buffer.length > 1) {
        e.preventDefault();
        processTrigger(el, buffer, key === ' ');
      }
      resetBuffer();
      return;
    }

    // Cancel on Escape
    if (key === 'Escape') {
      resetBuffer();
      return;
    }

    // Handle Backspace
    if (key === 'Backspace') {
      buffer = buffer.slice(0, -1);
      if (buffer.length === 0) resetBuffer();
      return;
    }

    // Ignore modifier / navigation keys
    if (key.length > 1) return;

    buffer += key;
  }

  function resetBuffer() {
    buffer = '';
    isTracking = false;
    triggerChar = null;
  }

  /* ── Trigger Router ── */
  async function processTrigger(el, command, isSpaceTriggered) {
    if (command.startsWith('?')) {
      handleLocalExpansion(el, command, isSpaceTriggered);
    } else if (command.startsWith('!')) {
      await handleAITransform(el, command);
    }
  }

  /* ═══════════════════════════════════════
     LOCAL EXPANSION ENGINE  (? trigger)
     Instant synchronous replacement.
     ═══════════════════════════════════════ */
  function handleLocalExpansion(el, command, isSpaceTriggered) {
    try {
      const expansion = cachedCommands[command] || FALLBACK_COMMANDS[command];
      if (!expansion) return;

      const replacementText = isSpaceTriggered ? expansion + ' ' : expansion;
      replaceCommandInElement(el, command, replacementText);
      trackUsage('local_expansion');
    } catch (err) {
      console.error('[TypEz] Local expansion error:', err);
    }
  }

  /* ═══════════════════════════════════════
     AI TRANSFORM ENGINE  (! trigger)
     Routes through background service worker.
     ═══════════════════════════════════════ */
  async function handleAITransform(el, command) {
    try {
      const fullText = getElementText(el);
      const commandPos = fullText.lastIndexOf(command);
      if (commandPos < 0) return;

      const precedingText = fullText.substring(0, commandPos).trim();
      if (!precedingText) return;

      // Visual feedback: replace command text with loading placeholder
      replaceCommandInElement(el, command, '\u2026');
      const loader = showInlineLoader(el);

      const response = await chrome.runtime.sendMessage({
        type: 'AI_TRANSFORM',
        command: command,
        text: precedingText,
      });

      hideInlineLoader(loader);

      if (response && response.success && response.result) {
        const currentText = getElementText(el);
        const loadingPattern = precedingText + ' \u2026';
        const altPattern = precedingText + '\u2026';

        if (currentText.includes(loadingPattern)) {
          setElementText(el, currentText.replace(loadingPattern, response.result));
        } else if (currentText.includes(altPattern)) {
          setElementText(el, currentText.replace(altPattern, response.result));
        } else {
          setElementText(el, response.result);
        }
        trackUsage('ai_transform');
      } else {
        const currentText = getElementText(el);
        setElementText(el, currentText.replace('\u2026', command + ' '));
        if (response && response.error) {
          console.warn('[TypEz] AI error:', response.error);
        }
      }
    } catch (err) {
      console.error('[TypEz] AI transform error:', err);
      hideInlineLoader(null);
    }
  }

  /* ── DOM Text Helpers (Native execCommand + Fallbacks) ── */
  function getElementText(el) {
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      return el.value || '';
    }
    return el.innerText || el.textContent || '';
  }

  function setElementText(el, text) {
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.focus();
      el.select();
      let replaced = false;
      try {
        replaced = document.execCommand('insertText', false, text);
      } catch (_) {
        replaced = false;
      }

      if (!replaced) {
        const nativeSetter =
          Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set ||
          Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;

        if (nativeSetter) {
          nativeSetter.call(el, text);
        } else {
          el.value = text;
        }
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }
    } else if (el.isContentEditable) {
      el.focus();
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(el);
      selection.removeAllRanges();
      selection.addRange(range);
      document.execCommand('insertText', false, text);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  function replaceCommandInElement(el, command, replacement) {
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      const value = el.value || '';
      const cmdIndex = value.lastIndexOf(command);
      if (cmdIndex < 0) return;

      el.focus();
      el.setSelectionRange(cmdIndex, cmdIndex + command.length);

      let replaced = false;
      try {
        replaced = document.execCommand('insertText', false, replacement);
      } catch (_) {
        replaced = false;
      }

      // If execCommand was not supported or didn't update value, use native prototype setter
      if (!replaced || (el.value && el.value.includes(command))) {
        const newValue =
          value.substring(0, cmdIndex) + replacement + value.substring(cmdIndex + command.length);
        const nativeSetter = Object.getOwnPropertyDescriptor(
          el.tagName === 'INPUT'
            ? window.HTMLInputElement.prototype
            : window.HTMLTextAreaElement.prototype,
          'value'
        )?.set;

        if (nativeSetter) {
          nativeSetter.call(el, newValue);
        } else {
          el.value = newValue;
        }

        const cursorPos = cmdIndex + replacement.length;
        el.setSelectionRange(cursorPos, cursorPos);
      }

      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    } else if (el.isContentEditable) {
      el.focus();
      const text = el.innerText || el.textContent || '';
      const cmdIndex = text.lastIndexOf(command);
      if (cmdIndex < 0) return;

      const newText =
        text.substring(0, cmdIndex) + replacement + text.substring(cmdIndex + command.length);

      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(el);
      selection.removeAllRanges();
      selection.addRange(range);
      document.execCommand('insertText', false, newText);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  /* ── Visual Feedback ── */
  function showInlineLoader(el) {
    const rect = el.getBoundingClientRect();
    const loader = document.createElement('div');
    loader.setAttribute('data-typez-loader', 'true');
    loader.style.cssText = [
      'position:fixed',
      'top:' + Math.max(10, rect.top - 32) + 'px',
      'left:' + Math.max(10, rect.left) + 'px',
      'background:#2A2825',
      'color:#F6F5F2',
      "font-family:'Sora',system-ui,sans-serif",
      'font-size:11px',
      'padding:4px 10px',
      'border-radius:6px',
      'z-index:2147483647',
      'pointer-events:none',
      'opacity:0.96',
      'letter-spacing:0.2px',
      'box-shadow:0 2px 8px rgba(0,0,0,0.2)',
    ].join(';');
    loader.textContent = 'TypEz is thinking\u2026';
    document.body.appendChild(loader);
    return loader;
  }

  function hideInlineLoader(loader) {
    if (loader && loader.parentNode) {
      loader.parentNode.removeChild(loader);
    }
    document.querySelectorAll('[data-typez-loader]').forEach(function (el) {
      el.remove();
    });
  }

  /* ── Usage Tracking ── */
  async function trackUsage(type) {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        const result = await chrome.storage.local.get('stats');
        const stats = result.stats || {
          total_expansions: 0,
          total_ai_calls: 0,
          last_used: null,
        };
        if (type === 'local_expansion') stats.total_expansions++;
        else if (type === 'ai_transform') stats.total_ai_calls++;
        stats.last_used = new Date().toISOString();
        await chrome.storage.local.set({ stats: stats });
      }
    } catch (_) {}
  }

  /* ── Dynamic Inputs Observer ── */
  function observeDynamicInputs() {
    // Top-level document capturing handles dynamically injected elements automatically
  }

  /* ── Start Immediately ── */
  init();
})();
