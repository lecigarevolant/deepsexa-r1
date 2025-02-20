import { useState, useEffect } from 'react';

export function useLoadingDots(isLoading: boolean): string {
  const [loadingDots, setLoadingDots] = useState('');

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      let count = 0;
      interval = setInterval(() => {
        count = (count + 1) % 4;
        setLoadingDots('.'.repeat(count));
      }, 500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading]);

  return loadingDots;
} 