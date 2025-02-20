'use client';

import { useChat, Message } from 'ai/react';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import { getAssetPath, parseMessageContent, retryFetch } from './utils';
import { SearchResult, WebSearchResponse, WebSearchError } from './types';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SearchingSpinner, ThinkingSpinner } from './components/LoadingStates';
import { ExaSearchSettings } from './api/exawebsearch/route';
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
  // UI state management
  const [isSearching, setIsSearching] = useState(false);
  const [isLLMLoading, setIsLLMLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [previousQueries, setPreviousQueries] = useState<string[]>([]);
  const [isThinkingExpanded, setIsThinkingExpanded] = useState(true);
  const [isSourcesExpanded, setIsSourcesExpanded] = useState(true);
  const [loadingDots, setLoadingDots] = useState('');
  const [showModelNotice, setShowModelNotice] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [searchSettings, setSearchSettings] = useState<ExaSearchSettings>({
    type: "auto",
    text: true,
    numResults: 5,
    livecrawl: "never"
  });

  // Textarea ref for auto-resize
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  const autoResize = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  };

  // Handle input changes including auto-resize
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleInputChange(e);
    autoResize();
  };

  // Handle Ctrl+Enter for submit
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit(e);
    }
  };

  // Loading dots animation effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSearching) {
      let count = 0;
      interval = setInterval(() => {
        count = (count + 1) % 4;
        setLoadingDots('.'.repeat(count));
      }, 500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSearching]);

  // Initialize chat functionality using Vercel AI SDK
  const { messages, input, handleInputChange, handleSubmit: handleChatSubmit, setMessages } = useChat({
    api: getAssetPath('/api/chat'),
    onFinish: () => {
      console.log('Chat stream finished');
      setIsLLMLoading(false);
    },
    onError: (error) => {
      console.error('Chat stream error:', error);
      setIsLLMLoading(false);
      setSearchError('Failed to get response from DeepSeek');
    }
  });

  /**
   * Handles form submission:
   * 1. Performs web search using Exa API
   * 2. Formats search results as context
   * 3. Sends context + user query to Perplexity AI
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    console.log('Form submitted');

    // Reset states
    setIsSearching(true);
    setIsLLMLoading(false);
    setSearchResults([]);
    setSearchError(null);

    try {
      console.log('Starting web search');
      // First, get web search results with retry logic
      const searchResponse = await retryFetch(
        getAssetPath('/api/exawebsearch'),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            query: input,
            previousQueries: previousQueries.slice(-3),
            settings: searchSettings
          }),
        }
      );

      const data = await searchResponse.json() as WebSearchResponse | WebSearchError;
      
      if ('error' in data) {
        throw new Error(data.error);
      }

      console.log('Search results received:', data.results.length);
      setSearchResults(data.results);
      // Hide the notice when search results appear
      setShowModelNotice(false);
      setIsSearching(false);
      setIsLLMLoading(true);

      // Format search context
      const searchContext = data.results.length > 0
        ? `Web Search Results:\n\n${data.results.map((r: SearchResult, i: number) => 
            `Source [${i + 1}]:\nTitle: ${r.title}\nURL: ${r.url}\n${r.author ? `Author: ${r.author}\n` : ''}${r.publishedDate ? `Date: ${r.publishedDate}\n` : ''}Content: ${r.text}\n---`
          ).join('\n\n')}\n\nInstructions: Based on the above search results, please provide an answer to the user's query. When referencing information, cite the source number in brackets like [1], [2], etc. Use simple english and simple words. Most important: Before coming to the final answer, think out loud, and think step by step. Think deeply, and review your steps, do 3-5 steps of thinking. Wrap the thinking in <think> tags. Start with <think> and end with </think> and then the final answer.`
        : '';

      console.log('Preparing to send to chat API');
      // Send both system context and user message in one request
      if (searchContext) {
        console.log('Adding system context');
        // First, update the messages state with both messages
        const newMessages: Message[] = [
          ...messages,
          {
            id: Date.now().toString(),
            role: 'system',
            content: searchContext
          }
        ];
        setMessages(newMessages);
      }

      console.log('Triggering chat API call');
      // Then trigger the API call
      await handleChatSubmit(e);
      console.log('Chat API call completed');

      // Update previous queries after successful search
      setPreviousQueries(prev => [...prev, input].slice(-3));

    } catch (err) {
      console.error('Error in submission:', err);
      setSearchError(err instanceof Error ? err.message : 'Search failed');
      setIsLLMLoading(false);
    } finally {
      setIsSearching(false);
    }
  };

  // Monitor message stream for completion
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    console.log('Message stream updated:', lastMessage?.role, lastMessage?.content?.length);
    
    if (lastMessage?.role === 'assistant') {
      const { isComplete } = parseMessageContent(lastMessage.content);
      console.log('Message complete:', isComplete);
      
      if (!isComplete) {
        setIsLLMLoading(true);
      }
    }
  }, [messages]);

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
          {messages.filter(m => m.role !== 'system').map((message) => (
            <div key={message.id}>
              <div
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`rounded py-3 max-w-[85%] ${
                    message.role === 'user'
                      ? 'bg-[var(--secondary-darker)] text-black px-4'
                      : 'text-gray-900'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <>
                      {(() => {
                        const { thinking, finalResponse, isComplete } = parseMessageContent(message.content);
                        return (
                          <>
                            {(thinking || !isComplete) && (
                              <div className="mb-10 space-y-4">
                                <div className="flex items-center gap-2">
                                  <button 
                                    onClick={() => setIsThinkingExpanded(!isThinkingExpanded)}
                                    className="flex items-center gap-2"
                                  >
                                    <svg 
                                      className={`w-5 h-5 transform hover:text-[var(--brand-default)] transition-colors transition-transform ${isThinkingExpanded ? 'rotate-0' : '-rotate-180'}`} 
                                      fill="none" 
                                      viewBox="0 0 24 24" 
                                      stroke="currentColor"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                    </svg>
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                    <h3 className="text-md font-medium">Thinking</h3>
                                  </button>
                                </div>
                                {isThinkingExpanded && (
                                  <div className="pl-4 relative">
                                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                                      <div className="text-sm text-gray-600 whitespace-pre-wrap">{thinking}</div>
                                  </div>
                                )}
                              </div>
                            )}
                            {isComplete && finalResponse && (
                              <div className="prose prose-base max-w-none px-4 text-gray-800 text-base">
                                <ReactMarkdown>{finalResponse}</ReactMarkdown>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </>
                  ) : (
                    <div className="whitespace-pre-wrap text-[15px]">{message.content}</div>
                  )}
                </div>
              </div>
              
              {/* Show search results after user message */}
              {message.role === 'user' && !isSearching && searchResults.length > 0 && (
                <div className="my-10 space-y-4">
                  {/* Header with logo */}
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setIsSourcesExpanded(!isSourcesExpanded)}
                      className="flex items-center gap-2"
                    >
                      <svg 
                        className={`w-5 h-5 transform hover:text-[var(--brand-default)] transition-colors transition-transform ${isSourcesExpanded ? 'rotate-0' : '-rotate-180'}`} 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                      <Image src={getAssetPath('/exa_logo.png')} alt="Exa" width={45} height={45} />
                      <h3 className="text-md font-medium">Search Results</h3>
                    </button>
                  </div>

                  {/* Results with vertical line */}
                  {isSourcesExpanded && (
                    <div className="pl-4 relative">
                      {/* Vertical line */}
                      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                      
                      {/* Content */}
                      <div className="space-y-2">
                        {searchResults.map((result, idx) => (
                          <div key={idx} className="text-sm group relative">
                            <a href={result.url} 
                               target="_blank" 
                               className="text-gray-600 hover:text-[var(--brand-default)] flex items-center gap-2">
                              [{idx + 1}] {result.title}
                              {result.favicon && (
                                <img 
                                  src={result.favicon} 
                                  alt=""
                                  className="w-4 h-4 object-contain"
                                />
                              )}
                            </a>
                            {/* URL tooltip */}
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute left-0 -bottom-6 bg-gray-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap z-10 pointer-events-none">
                              {result.url}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Show thinking spinner only if this is the latest message */}
                  {isLLMLoading && message.id === messages[messages.length - 2]?.id && (
                    <ThinkingSpinner />
                  )}

                </div>
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

      <div className={`${messages.filter(m => m.role !== 'system').length === 0 
        ? 'fixed inset-0 flex items-center justify-center bg-transparent' 
        : 'fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t'} z-40 transition-all duration-300`}>
        <div className={`${messages.filter(m => m.role !== 'system').length === 0 
          ? 'w-full max-w-2xl mx-auto px-6' 
          : 'w-full max-w-4xl mx-auto px-6 py-4'}`}>
          <form onSubmit={handleSubmit} className="flex flex-col items-center">
            <div className="flex gap-2 w-full max-w-4xl">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={handleTextareaChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask something... (Ctrl+Enter to send)"
                  rows={1}
                  className="w-full p-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--brand-default)] text-base resize-none overflow-hidden"
                />
              </div>
              <button 
                type="submit"
                disabled={!input.trim() || isSearching}
                className="px-5 py-3 bg-[var(--brand-default)] text-white rounded-md hover:bg-[var(--brand-muted)] font-medium w-[120px] h-[46px] flex items-center justify-center"
              >
                {isSearching ? <SearchingSpinner dots={loadingDots} /> : 'Search'}
              </button>
            </div>
            
            {showModelNotice && (
              <p className="text-xs md:text-sm text-gray-600 mt-8">
                Switched to DeepSeek V3 model from DeepSeek R1 due to high traffic
              </p>
            )}
          </form>
        </div>
      </div>

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
