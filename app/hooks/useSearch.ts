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
    livecrawl: "never",
    customModelMode: false
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
      // First get search results from Exa
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

      // If custom model mode is enabled, summarize the text content
      if (searchSettings.customModelMode && data.results.length > 0) {
        try {
          // Process each webpage individually
          const summaries = await Promise.all(data.results.map(async (result: any, i: number) => {
            const webpageContent = `Previous Queries: ${previousQueries.join(', ')}\nTitle: ${result.title || 'No title'}\nURL: ${result.url}\nPublished: ${result.publishedDate || 'Date unknown'}\nContent: ${result.text || ''}`;
            
            const summaryResponse = await fetch('deepsexa/api/summarize/openai', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                text: webpageContent,
                query: query,
                previousQueries: previousQueries
              })
            });

            if (!summaryResponse.ok) {
              throw new Error(`Failed to summarize webpage ${i + 1}`);
            }

            const summaryData = await summaryResponse.json();
            return summaryData.summary;
          }));

          // Format the final results with individual summaries
          const formattedResults = data.results.map((r: any, i: number) => 
            `[webpage ${i + 1} begin]\nTitle: ${r.title || 'No title'}\nURL: ${r.url}\nPublished: ${r.publishedDate || 'Date unknown'}\nSummary: ${summaries[i] || 'No summary available'}\n[webpage ${i + 1} end]`
          ).join('\n\n');

          return { ...data, formattedResults };
        } catch (err) {
          console.error('Summarization error:', err);
          throw new Error('Failed to summarize content');
        }
      }

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