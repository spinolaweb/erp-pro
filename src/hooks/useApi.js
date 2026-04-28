import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
});

export function useApi(endpoint) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetch = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const res = await api.get(endpoint, { params });
      setData(res.data);
      setError(null);
      return res.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  const create = async (payload) => {
    const res = await api.post(endpoint, payload);
    return res.data;
  };

  const remove = async (id) => {
    await api.delete(`${endpoint}/${id}`);
  };

  const bulkRemove = async (ids) => {
    await api.delete(`${endpoint}/bulk/delete`, { data: { ids } });
  };

  return { data, loading, error, fetch, create, remove, bulkRemove, refresh: fetch };
}

export { api };
