import { useState, useCallback } from 'react';

export function usePreviousQueries(maxQueries: number = 3) {
  const [previousQueries, setPreviousQueries] = useState<string[]>([]);

  const addQuery = useCallback((query: string) => {
    setPreviousQueries(prev => [...prev, query].slice(-maxQueries));
  }, [maxQueries]);

  const clearQueries = useCallback(() => {
    setPreviousQueries([]);
  }, []);

  return {
    previousQueries,
    addQuery,
    clearQueries
  };
} 