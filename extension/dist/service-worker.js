/**
 * TypEz Background Service Worker
 * ─────────────────────────────────
 * Handles:
 *  - AI API routing (Groq / Gemini) with provider fallback
 *  - Default configuration on install
 *  - API key validation
 *  - Rate-limit awareness for free tiers
 */

/* ══════════════════════════════════
   MESSAGE ROUTER
   ══════════════════════════════════ */
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'AI_TRANSFORM') {
    handleAITransform(message.command, message.text)
      .then(sendResponse)
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true; // Keep channel open for async response
  }

  if (message.type === 'TEST_API_KEY') {
    testAPIKey(message.provider, message.apiKey)
      .then(sendResponse)
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true;
  }
});

/* ══════════════════════════════════
   INSTALLATION DEFAULTS
   ══════════════════════════════════ */
chrome.runtime.onInstalled.addListener(async () => {
  await ensureDefaults();
});

chrome.runtime.onStartup.addListener(async () => {
  await ensureDefaults();
});

// Immediate boot check
ensureDefaults();

async function ensureDefaults() {
  const existing = await chrome.storage.local.get(['commands', 'ai_config', 'ai_commands']);
  
  // Migrate deprecated models if stored
  if (existing.ai_config) {
    let modified = false;
    if (existing.ai_config.gemini_model === 'gemini-2.0-flash' || existing.ai_config.gemini_model === 'gemini-1.5-flash') {
      existing.ai_config.gemini_model = 'gemini-3.8-flash';
      modified = true;
    }
    if (existing.ai_config.groq_model === 'llama-3.3-70b-versatile') {
      existing.ai_config.groq_model = 'llama-3.1-8b-instant';
      modified = true;
    }
    if (modified) {
      await chrome.storage.local.set({ ai_config: existing.ai_config });
    }
  }

  if (existing.commands && Object.keys(existing.commands).length > 0) {
    return; // Already initialized
  }

  const defaults = {
    commands: {
      '?@': 'yash.sushil16@gmail.com',
      '?phone': '+1-234-567-8900',
      '?sig': 'Best regards,\nYash',
    },
    ai_config: {
      primary_provider: 'groq',
      groq_api_key: '',
      gemini_api_key: '',
      groq_model: 'llama-3.1-8b-instant',
      gemini_model: 'gemini-3.8-flash',
    },
    ai_commands: {
      '!casual':
        'Rewrite the following text in a casual, friendly, conversational tone. Keep the same meaning but make it feel natural and approachable:',
      '!formal':
        'Rewrite the following text in a formal, professional tone suitable for business communication:',
      '!summarize':
        'Provide a clear, concise summary of the following text. Capture the key points in 2-3 sentences:',
      '!fix':
        'Fix all grammar, spelling, and punctuation errors in the following text. Preserve the original meaning and tone:',
      '!expand':
        'Expand and elaborate on the following text with additional detail and context. Maintain the original tone:',
      '!shorten':
        'Make the following text more concise while preserving all key information:',
    },
    sync_config: {
      enabled: false,
      backend_url: '',
      token: '',
    },
    stats: {
      total_expansions: 0,
      total_ai_calls: 0,
      last_used: null,
    },
  };
  await chrome.storage.local.set(defaults);
  console.log('[TypEz] Default configuration initialized');
}

/* ══════════════════════════════════
   AI TRANSFORM HANDLER
   ══════════════════════════════════ */
async function handleAITransform(command, text) {
  try {
    const data = await chrome.storage.local.get(['ai_config', 'ai_commands']);
    const config = data.ai_config;
    const commands = data.ai_commands;

    if (!config) {
      return {
        success: false,
        error: 'AI not configured. Open TypEz settings to add API keys.',
      };
    }

    const promptTemplate = commands?.[command];
    if (!promptTemplate) {
      return { success: false, error: 'Unknown AI command: ' + command };
    }

    const fullPrompt = promptTemplate + '\n\n' + text;
    const provider = config.primary_provider || 'groq';

    let result = null;

    // Attempt primary provider
    if (provider === 'groq' && config.groq_api_key) {
      try {
        result = await callGroq(config.groq_api_key, config.groq_model, fullPrompt);
      } catch (primaryErr) {
        console.warn('[TypEz] Primary (Groq) failed, trying fallback:', primaryErr.message);
        // Fallback to Gemini
        if (config.gemini_api_key) {
          result = await callGemini(config.gemini_api_key, config.gemini_model, fullPrompt);
        } else {
          throw primaryErr;
        }
      }
    } else if (provider === 'gemini' && config.gemini_api_key) {
      try {
        result = await callGemini(config.gemini_api_key, config.gemini_model, fullPrompt);
      } catch (primaryErr) {
        console.warn('[TypEz] Primary (Gemini) failed, trying fallback:', primaryErr.message);
        // Fallback to Groq
        if (config.groq_api_key) {
          result = await callGroq(config.groq_api_key, config.groq_model, fullPrompt);
        } else {
          throw primaryErr;
        }
      }
    } else {
      // No primary key — try whatever is available
      if (config.groq_api_key) {
        result = await callGroq(config.groq_api_key, config.groq_model, fullPrompt);
      } else if (config.gemini_api_key) {
        result = await callGemini(config.gemini_api_key, config.gemini_model, fullPrompt);
      } else {
        return {
          success: false,
          error: 'No API keys configured. Open TypEz to add your keys.',
        };
      }
    }

    return { success: true, result: result };
  } catch (err) {
    console.error('[TypEz] AI transform error:', err);
    return { success: false, error: err.message || 'AI transformation failed' };
  }
}

/* ══════════════════════════════════
   GROQ API CLIENT
   ══════════════════════════════════ */
async function callGroq(apiKey, model, prompt) {
  let modelId = model || 'llama-3.1-8b-instant';
  try {
    return await executeGroqRequest(apiKey, modelId, prompt);
  } catch (err) {
    if (modelId !== 'llama-3.1-8b-instant' && (err.message.includes('does not exist') || err.message.includes('access'))) {
      console.warn('[TypEz] Groq model fallback to llama-3.1-8b-instant');
      return await executeGroqRequest(apiKey, 'llama-3.1-8b-instant', prompt);
    }
    throw err;
  }
}

async function executeGroqRequest(apiKey, model, prompt) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: 'system',
          content:
            'You are a precise text transformation assistant. Return ONLY the transformed text with no additional commentary, explanations, markdown formatting, or quotation marks.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.6,
      max_tokens: 2048,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Groq API error: ' + response.status);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error('Empty response from Groq');
  return text;
}

/* ══════════════════════════════════
   GEMINI API CLIENT
   ══════════════════════════════════ */
async function callGemini(apiKey, model, prompt) {
  let modelId = model || 'gemini-3.8-flash';
  if (modelId === 'gemini-2.0-flash' || modelId === 'gemini-1.5-flash') {
    modelId = 'gemini-3.8-flash';
  }
  const url =
    'https://generativelanguage.googleapis.com/v1beta/models/' +
    modelId +
    ':generateContent?key=' +
    apiKey;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text:
                'You are a precise text transformation assistant. Return ONLY the transformed text with no additional commentary, explanations, markdown formatting, or quotation marks.\n\n' +
                prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.6,
        maxOutputTokens: 2048,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Gemini API error: ' + response.status);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!text) throw new Error('Empty response from Gemini');
  return text;
}

/* ══════════════════════════════════
   API KEY TESTER
   ══════════════════════════════════ */
async function testAPIKey(provider, apiKey) {
  try {
    if (provider === 'groq') {
      await callGroq(apiKey, 'llama-3.1-8b-instant', 'Respond with only the word "connected".');
      return { success: true };
    }
    if (provider === 'gemini') {
      await callGemini(apiKey, 'gemini-3.8-flash', 'Respond with only the word "connected".');
      return { success: true };
    }
    return { success: false, error: 'Unknown provider' };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
