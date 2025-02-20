/**
 * Common type definitions for the application
 */

import type { 
  TextContentsOptions,
  HighlightsContentsOptions,
  SummaryContentsOptions
} from 'exa-js';

export interface SearchResult {
  url: string;
  title: string;
  favicon?: string;
}

export interface ExaSearchSettings {
  type: "auto" | "keyword" | "neural";
  numResults: number;
  livecrawl?: "always" | "fallback" | "never";
  
  // Content options
  text?: TextContentsOptions | boolean;
  highlights?: HighlightsContentsOptions | boolean;
  summary?: SummaryContentsOptions | boolean;
}

export interface WebSearchResponse {
  results: SearchResult[];
  formattedResults?: string;
  error?: string;
}

export interface WebSearchError {
  error: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
}

export interface ChatResponse {
  id: string;
  role: 'assistant';
  content: string;
}

export interface ChatError {
  error: string;
}

// Re-export types from exa-js for convenience
export type { 
  TextContentsOptions,
  HighlightsContentsOptions,
  SummaryContentsOptions
}; 