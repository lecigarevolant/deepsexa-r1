/**
 * Web search API route using Exa API
 * Performs contextual search based on current and previous queries
 */

import { NextRequest, NextResponse } from 'next/server';
import Exa, { 
  TextContentsOptions, 
  HighlightsContentsOptions, 
  SummaryContentsOptions,
  SearchResult
} from "exa-js";
import { logger } from '@/app/utils/logger';

// Set maximum execution time to 1 minute
export const maxDuration = 60;

// Initialize Exa client with API key
const exa = new Exa(process.env.EXA_API_KEY as string);

// Add interface for search settings
export interface ExaSearchSettings {
  type: "auto" | "keyword" | "neural";
  numResults: number;
  livecrawl?: "always" | "fallback" | "never";
  
  // Replace simple boolean with content options
  text?: TextContentsOptions | boolean;
  highlights?: HighlightsContentsOptions | boolean;
  summary?: SummaryContentsOptions | boolean;
}

// Default settings
const defaultSettings: ExaSearchSettings = {
  type: "auto",
  numResults: 5,
  livecrawl: "never",
  text: {
    maxCharacters: 2000,
    includeHtmlTags: false
  },
  highlights: false,
  summary: false
};

// Define the content options type we're using
type SearchResultContents = {
  text?: TextContentsOptions | true;
  highlights?: HighlightsContentsOptions | true;
  summary?: SummaryContentsOptions | true;
};

function formatSearchResult(
  result: SearchResult<SearchResultContents>, 
  settings: ExaSearchSettings
): string {
  const parts: string[] = [
    `Title: ${result.title || 'No title'}`,
    `URL: ${result.url}`
  ];

  if (result.author) parts.push(`Author: ${result.author}`);
  if (result.publishedDate) parts.push(`Date: ${result.publishedDate}`);

  // Add content based on settings
  if (settings.text && 'text' in result) {
    parts.push(`Content: ${result.text}`);
  }
  if (settings.highlights && 'highlights' in result) {
    parts.push(`Highlights: ${result.highlights.join('\n')}`);
  }
  if (settings.summary && 'summary' in result) {
    parts.push(`Summary: ${result.summary}`);
  }

  return parts.join('\n');
}

/**
 * POST handler for web search requests
 * Performs search with context from previous queries
 * Returns top 5 most relevant results
 */
export async function POST(req: NextRequest) {
  try {
    const { query, previousQueries = [], settings = defaultSettings } = await req.json();
    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    logger.log('\n=== Exa Search Request ===');
    logger.logObject('Query', query);
    logger.logObject('Previous Queries', previousQueries);

    // Build contextual query using previous questions
    let contextualQuery = query;
    if (previousQueries.length > 0) {
      const context = previousQueries
        .map((q: string) => `Previous question: ${q}`)
        .join('\n');
      contextualQuery = `${context}\n\nNow answer the question: ${query}`;
    }

    // Search web content using Exa API with settings
    const result = await exa.searchAndContents(
      contextualQuery,
      settings
    );

    logger.log('=== Exa Search Response ===');
    logger.logObject('Results', result);

    // Format results with webpage markers
    const formattedResults = result.results.map((r, i) => 
      `[webpage ${i + 1} begin]\n${formatSearchResult(r, settings)}\n[webpage ${i + 1} end]`
    ).join('\n\n');

    return NextResponse.json({ results: result.results, formattedResults });
  } catch (error) {
    logger.logObject('Exa Search Error', error);
    return NextResponse.json({ error: `Failed to perform search | ${error}` }, { status: 500 });
  }
}