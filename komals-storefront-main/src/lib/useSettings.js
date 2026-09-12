import { useEffect, useState } from 'react';
import { api } from './api.js';

let cache = null;

/** Fetches site settings once and shares the result across every caller. */
export function useSettings() {
  const [settings, setSettings] = useState(cache);

  useEffect(() => {
    if (cache) return;
    api.get('/store/settings').then((r) => {
      cache = r.data;
      setSettings(r.data);
    }).catch(() => {});
  }, []);

  return settings;
}
