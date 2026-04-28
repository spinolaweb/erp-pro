import { useState, useEffect } from 'react';
import { api } from './useApi';

export function useSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await api.get('/api/settings');
      setSettings(res.data);
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates) => {
    const res = await api.put('/api/settings', updates);
    setSettings(res.data);
    return res.data;
  };

  return { settings, loading, updateSettings, refresh: loadSettings };
}
