import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from './api.js';

export function useTrackVisit() {
  const location = useLocation();
  useEffect(() => {
    api.post('/store/analytics/visit', { path: location.pathname }).catch(() => {});
  }, [location.pathname]);
}
