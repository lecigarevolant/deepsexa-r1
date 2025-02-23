'use client';

import { useState } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useSearch } from './hooks/useSearch';
import { useChatLogic } from './hooks/useChatLogic';
import { useLoadingDots } from './hooks/useLoadingDots';
import { usePreviousQueries } from './hooks/usePreviousQueries';
import { ChatMessage } from './components/chat/ChatMessage';
import { SearchResults } from './components/chat/SearchResults';
import { ChatInput } from './components/chat/ChatInput';
import SettingsModal from '@/components/settings-modal';
import { SearchFormData } from './types/search';
import { ExaSearchSettings, SearchResult } from './types';
import { DEFAULT_SEARCH_SETTINGS } from './constants/api';
import { Message } from 'ai';

/**
 * Main chat interface component
 * Integrates Exa web search with Perplexity AI for contextual responses
 */
export default function ChatPage() {
  return (
    <ErrorBoundary>
      <ChatInterface />
    </ErrorBoundary>
  );
}

function ChatInterface() {
  // UI state
  const [isThinkingExpanded, setIsThinkingExpanded] = useState(true);
  const [isSourcesExpanded, setIsSourcesExpanded] = useState(true);
  const [showModelNotice, setShowModelNotice] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchSettings, setSearchSettings] = useState<ExaSearchSettings>(DEFAULT_SEARCH_SETTINGS);
  const [dateRange, setDateRange] = useState<{ startDate: string | null; endDate: string | null; } | undefined>();
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchStatus, setSearchStatus] = useState<string>('');

  // Custom hooks
  const { search, isLoading: isSearching, error: searchError } = useSearch();
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: handleChatSubmit,
    isLLMLoading,
    setMessages,
  } = useChatLogic(searchResults, () => setSearchResults([]));

  const loadingDots = useLoadingDots(isSearching);
  const { previousQueries, addQuery } = usePreviousQueries();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    try {
      setIsLoading(true);
      setSearchResults([]);
      setDateRange(undefined);
      setIsSummarizing(false);
      setSearchStatus('Searching web...');

      // If enhanced auto date is enabled, get date range
      if (searchSettings.autoDate) {
        setSearchStatus('Analyzing date context in query...');

        const dateResponse = await fetch("deepsexa/api/parse-date", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: input,
            previousQueries,
          }),
        });

        if (dateResponse.ok) {
          const dateData = await dateResponse.json();
          if (dateData.dateRange) {
            setDateRange(dateData.dateRange);
            // Update search settings with date range
            searchSettings.startPublishedDate = dateData.dateRange.startDate;
            searchSettings.endPublishedDate = dateData.dateRange.endDate;

            const dateText = dateData.dateRange.startDate && dateData.dateRange.endDate
              ? `between ${dateData.dateRange.startDate} and ${dateData.dateRange.endDate}`
              : dateData.dateRange.startDate
                ? `from ${dateData.dateRange.startDate}`
                : dateData.dateRange.endDate
                  ? `until ${dateData.dateRange.endDate}`
                  : '';
            setSearchStatus(`Searching web for content ${dateText}...`);
          }
        }
      }

      setSearchStatus('Searching web for relevant content...');

      const searchData = await search({ 
        query: input, 
        autoDate: false // We handle auto date in the component now
      }, previousQueries, searchSettings);
      
      if (!searchData) return;

      // If custom model mode is enabled, we need to summarize the content
      if (searchSettings.customModelMode) {
        setIsSummarizing(true);
        setSearchStatus(`Found ${searchData.results.length} results. Summarizing content using OpenAI...`);

        // Process each result for summarization
        const summarizedResults = await Promise.all(
          searchData.results.map(async (result: SearchResult) => {
            if (!result.text) return result;

            try {
              const summaryResponse = await fetch("deepsexa/api/summarize/openai", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  text: result.text,
                  query: input,
                  previousQueries,
                }),
              });

              if (summaryResponse.ok) {
                const summaryData = await summaryResponse.json();
                return {
                  ...result,
                  summary: summaryData.summary,
                };
              }
            } catch (error) {
              console.error("Summarization error:", error);
            }
            return result;
          })
        );
        setIsSummarizing(false);
        setSearchResults(summarizedResults);
        setSearchStatus('Content summarized. Generating response with DeepSeek...');
      } else {
        setSearchResults(searchData.results);
        setSearchStatus(`Found ${searchData.results.length} results. Generating response with DeepSeek...`);
      }

      setShowModelNotice(false);
      await handleChatSubmit(e, {
        body: { searchContext: searchData.formattedResults || "" },
      });
      addQuery(input);
    } catch (error) {
      console.error("Search error:", error);
      setSearchStatus('Sorry, an error occurred while searching. Please try again.');
    } finally {
      setIsLoading(false);
      setSearchStatus('');
    }
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-b z-50">
        <div className="md:max-w-4xl mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <a
              href="https://dashboard.exa.ai"
              target="_blank"
              className="flex items-center px-4 py-1 bg-brand-default text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              <span>Try Exa API</span>
            </a>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 hover:bg-gray-100 rounded-full"
              title="Search Settings"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
          <a
            href="https://github.com/lecigarevolant/deepsexa-r1"
            target="_blank"
            className="flex items-center gap-1.5 text-md text-gray-600 hover:text-[var(--brand-default)] transition-colors"
          >
            <span className="underline">see project code here</span>
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </div>
      </div>

      <div className="md:max-w-4xl mx-auto p-6 pt-20 pb-24 space-y-6 bg-[var(--secondary-default)] min-h-screen flex flex-col">
        <div className="space-y-6 flex-1">
          {messages.filter(m => m.role !== 'system').map((message, index) => (
            <div key={message.id}>
              <ChatMessage
                message={message}
                isLatestMessage={index === messages.length - 2}
                isLLMLoading={isLLMLoading}
                isThinkingExpanded={isThinkingExpanded}
                onToggleThinking={() => setIsThinkingExpanded(!isThinkingExpanded)}
              />
              
              {message.role === 'user' && (
                <SearchResults
                  results={searchResults}
                  isSourcesExpanded={isSourcesExpanded}
                  onToggleSources={() => setIsSourcesExpanded(!isSourcesExpanded)}
                  isLLMLoading={isLLMLoading}
                  isLatestMessage={index === messages.length - 2}
                  isSearching={isSearching}
                  isSummarizing={isSummarizing}
                  dateRange={dateRange}
                  loadingDots={loadingDots}
                  searchSettings={searchSettings}
                />
              )}
            </div>
          ))}
        </div>

        {searchError && (
          <div className="p-4 bg-red-50 rounded border border-red-100">
            <p className="text-sm text-red-800">⚠️ {searchError}</p>
          </div>
        )}
      </div>

      <ChatInput
        input={input}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        isSearching={isLoading}
        loadingDots={loadingDots}
        showModelNotice={showModelNotice}
        messageCount={messages.filter(m => m.role !== 'system').length}
        searchStatus={searchStatus}
      />

      {showSettings && (
        <SettingsModal
          settings={searchSettings}
          onSave={setSearchSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </>
  );
}

