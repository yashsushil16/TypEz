import React from 'react';

export default function About() {
  return (
    <div className="view-container">
      <div className="view-header">
        <h1 className="view-title">About TypEz</h1>
        <p className="view-subtitle">Version 1.0.0</p>
      </div>

      <div className="section">
        <p className="about-text">
          TypEz is a dual-engine text expansion and AI writing assistant.
          Use <code className="about-code">?</code> triggers for instant local
          text replacement and <code className="about-code">!</code> triggers
          for AI-powered text transformation.
        </p>
      </div>

      <div className="section">
        <h2 className="section-title">How It Works</h2>
        <div className="how-it-works">
          <div className="how-step">
            <div className="how-left">
              <code className="how-code">?@</code>
              <span className="how-arrow">→</span>
              <span className="how-result">yash.sushil16@gmail.com</span>
            </div>
          </div>
          <div className="how-step">
            <div className="how-left">
              <code className="how-code">!casual</code>
              <span className="how-arrow">→</span>
              <span className="how-result">rewrites preceding paragraph</span>
            </div>
          </div>
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">Links</h2>
        <div className="about-links">
          <a
            href="https://typez.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="about-link"
          >
            Website
          </a>
          <a
            href="https://typez.dev/tos.html"
            target="_blank"
            rel="noopener noreferrer"
            className="about-link"
          >
            Terms of Service
          </a>
          <a
            href="https://typez.dev/privacy.html"
            target="_blank"
            rel="noopener noreferrer"
            className="about-link"
          >
            Privacy Policy
          </a>
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">Keyboard</h2>
        <div className="keyboard-grid">
          <div className="key-combo">
            <kbd className="kbd">?</kbd>
            <span className="key-label">Local expansion trigger</span>
          </div>
          <div className="key-combo">
            <kbd className="kbd">!</kbd>
            <span className="key-label">AI transform trigger</span>
          </div>
          <div className="key-combo">
            <kbd className="kbd">Space</kbd>
            <span className="key-label">Execute command</span>
          </div>
          <div className="key-combo">
            <kbd className="kbd">Esc</kbd>
            <span className="key-label">Cancel command</span>
          </div>
        </div>
      </div>

      <div className="about-footer">
        <p className="about-copyright">
          No tracking. No analytics. Your data stays local.
        </p>
      </div>
    </div>
  );
}
