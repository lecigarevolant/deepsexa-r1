import { useState, useCallback } from 'react';
import { ExaSearchSettings, SearchResult } from '../types';

interface UseSearchReturn {
  isSearching: boolean;
  searchResults: SearchResult[];
  searchError: string | null;
  searchSettings: ExaSearchSettings;
  setSearchSettings: (settings: ExaSearchSettings) => void;
  performSearch: (query: string, previousQueries: string[]) => Promise<{ formattedResults?: string } | undefined>;
  resetSearch: () => void;
}

export function useSearch(): UseSearchReturn {
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchSettings, setSearchSettings] = useState<ExaSearchSettings>({
    type: "auto",
    text: true,
    numResults: 5,
    livecrawl: "never"
  });

  const resetSearch = useCallback(() => {
    setIsSearching(false);
    setSearchResults([]);
    setSearchError(null);
  }, []);

  const performSearch = useCallback(async (query: string, previousQueries: string[]) => {
    setIsSearching(true);
    setSearchError(null);

    try {
      const response = await fetch('/deepsexa/api/exawebsearch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          previousQueries: previousQueries.slice(-3),
          settings: searchSettings
        })
      });

      const data = await response.json();
      if (data.error) {
        console.error('Search error:', data.error);
        setSearchError(data.error);
        return;
      }

      console.log('Search results received:', data.results.length);
      setSearchResults(data.results);
      return data;

    } catch (err) {
      console.error('Error in search:', err);
      setSearchError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setIsSearching(false);
    }
  }, [searchSettings]);

  return { 
    isSearching, 
    searchResults, 
    searchError, 
    searchSettings, 
    setSearchSettings, 
    performSearch, 
    resetSearch 
  };
} 