/**
 * TypEz Website — Interactive Simulator & Studio
 * Demonstrates local text expansion (?) and AI text transformation (!)
 */

(function () {
  'use strict';

  // Snippet database for local expansion (?)
  const LOCAL_SNIPPETS = {
    '?@': 'yash.sushil16@gmail.com',
    '?sig': 'Best regards,\nYash Sushil\nLead Engineer, TypEz Project',
    '?addr': '742 Evergreen Terrace, Suite 400, Springfield, OR 97477',
    '?phone': '+1 (555) 234-5678',
    '?meet': 'https://meet.google.com/abc-defg-hij',
    '?cal': 'https://cal.com/yash-sushil/30min'
  };

  // AI transform mock engines (realistic demonstrations)
  const AI_TRANSFORMS = {
    '!casual': function (text) {
      return text
        .replace(/Dear Sir\/Madam,|To whom it may concern,/gi, 'Hey team,')
        .replace(/I am writing to formally request/gi, 'Just wanted to see if we could get')
        .replace(/Please find attached the requisite documentation/gi, 'Here are the files you needed')
        .replace(/I would be extremely grateful for your prompt reply/gi, 'Let me know what you think when you have a sec')
        .replace(/Sincerely,|Regards,/gi, 'Cheers,\nYash');
    },
    '!formal': function (text) {
      return (
        'Dear Colleagues,\n\nI am writing to provide an update regarding our current initiatives. ' +
        text.replace(/hey|hi/gi, 'Greetings') +
        '\n\nPlease review at your earliest convenience.\n\nRespectfully,\nYash Sushil'
      );
    },
    '!fix': function (text) {
      return text
        .replace(/\bteh\b/gi, 'the')
        .replace(/\brecieve\b/gi, 'receive')
        .replace(/\bseperate\b/gi, 'separate')
        .replace(/\bi\b/g, 'I')
        .replace(/\bdont\b/gi, "don't")
        .replace(/\bwont\b/gi, "won't")
        .replace(/\bits a\b/gi, "it's a");
    },
    '!summarize': function (text) {
      const sentences = text.split(/[.!?]+/).filter(Boolean);
      if (sentences.length <= 1) return 'Summary: ' + text.trim();
      return 'Summary: ' + sentences[0].trim() + '. Key focus remains on immediate execution.';
    },
    '!expand': function (text) {
      return (
        text.trim() +
        ' Furthermore, this approach ensures seamless forward compatibility across distinct system environments while minimizing latency overhead.'
      );
    }
  };

  // 1. Setup Hero Simulator
  function initHeroSimulator() {
    const input = document.getElementById('heroSimInput');
    const loader = document.getElementById('heroSimLoader');
    if (!input) return;

    let buffer = '';
    let isTracking = false;

    input.addEventListener('keydown', function (e) {
      const key = e.key;

      if (!isTracking && (key === '?' || key === '!')) {
        isTracking = true;
        buffer = key;
        return;
      }

      if (!isTracking) return;

      if (key === ' ' || key === 'Enter') {
        if (buffer.length > 1) {
          e.preventDefault();
          executeSimulatorCommand(input, loader, buffer);
        }
        buffer = '';
        isTracking = false;
        return;
      }

      if (key === 'Escape') {
        buffer = '';
        isTracking = false;
        return;
      }

      if (key === 'Backspace') {
        buffer = buffer.slice(0, -1);
        if (buffer.length === 0) isTracking = false;
        return;
      }

      if (key.length === 1) {
        buffer += key;
      }
    });
  }

  function executeSimulatorCommand(textarea, loader, command) {
    const text = textarea.value;
    const cmdIndex = text.lastIndexOf(command);
    if (cmdIndex < 0) return;

    // Check Local Expansion
    if (command.startsWith('?')) {
      const replacement = LOCAL_SNIPPETS[command] || 'Sample snippet expansion for ' + command;
      const updated = text.substring(0, cmdIndex) + replacement + ' ' + text.substring(cmdIndex + command.length);
      textarea.value = updated;
      textarea.focus();
      textarea.setSelectionRange(cmdIndex + replacement.length + 1, cmdIndex + replacement.length + 1);
      return;
    }

    // Check AI Command
    if (command.startsWith('!')) {
      const preceding = text.substring(0, cmdIndex).trim();
      if (!preceding) return;

      if (loader) loader.classList.add('active');

      setTimeout(function () {
        if (loader) loader.classList.remove('active');
        const transformFn = AI_TRANSFORMS[command] || AI_TRANSFORMS['!casual'];
        const transformed = transformFn(preceding);
        textarea.value = transformed;
        textarea.focus();
      }, 750);
    }
  }

  // 2. Preset Injectors
  window.injectHeroDemo = function (type) {
    const input = document.getElementById('heroSimInput');
    const loader = document.getElementById('heroSimLoader');
    if (!input) return;

    if (type === 'email') {
      input.value = 'Contact our team directly at ?@ ';
      executeSimulatorCommand(input, loader, '?@');
    } else if (type === 'sig') {
      input.value = 'Thanks for your feedback.\n\n?sig ';
      executeSimulatorCommand(input, loader, '?sig');
    } else if (type === 'casual') {
      input.value = 'Dear Sir/Madam, I am writing to formally request the project files. !casual ';
      executeSimulatorCommand(input, loader, '!casual');
    } else if (type === 'fix') {
      input.value = 'teh quick brown fox dont recieve the msg. !fix ';
      executeSimulatorCommand(input, loader, '!fix');
    }
  };

  // 3. Studio Interactive Playground
  function initStudio() {
    const studioInput = document.getElementById('studioInput');
    const studioOutput = document.getElementById('studioOutput');
    const studioStatus = document.getElementById('studioStatus');
    if (!studioInput || !studioOutput) return;

    studioInput.addEventListener('input', function () {
      const val = studioInput.value;
      if (studioStatus) {
        studioStatus.textContent = val.length + ' chars | ' + val.split(/\s+/).filter(Boolean).length + ' words';
      }
    });

    studioInput.addEventListener('keydown', function (e) {
      if (e.key === ' ' || e.key === 'Enter') {
        const val = studioInput.value;
        const words = val.trim().split(/\s+/);
        const lastWord = words[words.length - 1];

        if (lastWord && (lastWord.startsWith('?') || lastWord.startsWith('!'))) {
          e.preventDefault();
          processStudioCommand(studioInput, studioOutput, lastWord);
        }
      }
    });
  }

  function processStudioCommand(input, output, command) {
    const text = input.value;
    const cmdIndex = text.lastIndexOf(command);
    if (cmdIndex < 0) return;

    if (command.startsWith('?')) {
      const rep = LOCAL_SNIPPETS[command] || 'Custom shortcut expanded.';
      const newText = text.substring(0, cmdIndex) + rep + ' ' + text.substring(cmdIndex + command.length);
      input.value = newText;
      output.textContent = '[Local Engine: 0ms execution]\nExpanded "' + command + '" into:\n' + rep;
    } else if (command.startsWith('!')) {
      const preceding = text.substring(0, cmdIndex).trim();
      output.textContent = '[AI Engine: Routing prompt to service worker...]\nTransforming with trigger ' + command + '...';

      setTimeout(function () {
        const transformFn = AI_TRANSFORMS[command] || AI_TRANSFORMS['!casual'];
        const transformed = transformFn(preceding || 'Sample text to rewrite');
        input.value = transformed;
        output.textContent =
          '[AI Engine: Groq Llama 3.3 / Gemini 2.0 Response (320ms)]\n\n' +
          transformed;
      }, 650);
    }
  }

  window.injectStudioPreset = function (command, sampleText) {
    const input = document.getElementById('studioInput');
    const output = document.getElementById('studioOutput');
    if (!input || !output) return;

    input.value = sampleText + ' ' + command;
    processStudioCommand(input, output, command);
  };

  // Boot
  document.addEventListener('DOMContentLoaded', function () {
    initHeroSimulator();
    initStudio();
  });
})();
