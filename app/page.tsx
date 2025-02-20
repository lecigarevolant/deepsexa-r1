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

  // Custom hooks
  const { 
    isSearching, 
    searchResults, 
    searchError, 
    searchSettings, 
    setSearchSettings, 
    performSearch, 
    resetSearch 
  } = useSearch();

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: handleChatSubmit,
    isLLMLoading,
    setMessages
  } = useChatLogic(searchResults, resetSearch);

  const loadingDots = useLoadingDots(isSearching);
  const { previousQueries, addQuery } = usePreviousQueries();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    resetSearch();
    const searchData = await performSearch(input, previousQueries);
    if (!searchData) return;

    setShowModelNotice(false);
    await handleChatSubmit(e, { body: { searchContext: searchData.formattedResults || '' } });
    addQuery(input);
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
              
              {message.role === 'user' && !isSearching && searchResults.length > 0 && (
                <SearchResults
                  results={searchResults}
                  isSourcesExpanded={isSourcesExpanded}
                  onToggleSources={() => setIsSourcesExpanded(!isSourcesExpanded)}
                  isLLMLoading={isLLMLoading}
                  isLatestMessage={index === messages.length - 2}
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
        isSearching={isSearching}
        loadingDots={loadingDots}
        showModelNotice={showModelNotice}
        messageCount={messages.filter(m => m.role !== 'system').length}
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

