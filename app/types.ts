/**
 * Common type definitions for the application
 */

export interface SearchResult {
  title: string;
  url: string;
  text: string;
  author?: string;
  publishedDate?: string;
  favicon?: string;
}

export interface WebSearchResponse {
  results: SearchResult[];
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