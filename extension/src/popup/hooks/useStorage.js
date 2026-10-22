import { useState, useEffect, useCallback } from 'react';

const isChromeExtension =
  typeof chrome !== 'undefined' && typeof chrome.storage !== 'undefined';

/**
 * React hook for chrome.storage.local with dev-mode fallback.
 * @param {string} key  Storage key
 * @param {*} defaultValue  Default value if key doesn't exist
 * @returns {[value, setValue, isLoading]}
 */
export function useStorage(key, defaultValue) {
  const [value, setValue] = useState(defaultValue);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        if (isChromeExtension) {
          const result = await chrome.storage.local.get(key);
          if (!cancelled) {
            setValue(result[key] !== undefined ? result[key] : defaultValue);
          }
        }
      } catch (err) {
        console.error('[TypEz] Failed to load "' + key + '":', err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [key]);

  const update = useCallback(
    async (newValue) => {
      const resolved =
        typeof newValue === 'function' ? newValue(value) : newValue;
      setValue(resolved);
      if (isChromeExtension) {
        try {
          await chrome.storage.local.set({ [key]: resolved });
        } catch (err) {
          console.error('[TypEz] Failed to save "' + key + '":', err);
        }
      }
    },
    [key, value]
  );

  return [value, update, isLoading];
}
