/**
 * Web search API route using Exa API
 * Performs contextual search based on current and previous queries
 */

import { NextRequest, NextResponse } from 'next/server';
import Exa from "exa-js";

// Set maximum execution time to 1 minute
export const maxDuration = 60;

// Initialize Exa client with API key
const exa = new Exa(process.env.EXA_API_KEY as string);

// Add interface for search settings
export interface ExaSearchSettings {
  type: "auto" | "keyword" | "neural";
  text: boolean;
  numResults: number;
  livecrawl?: "always" | "fallback" | "never";
}

// Default settings
const defaultSettings: ExaSearchSettings = {
  type: "auto",
  text: true,
  numResults: 5,
  livecrawl: "never"
};

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

    return NextResponse.json({ results: result.results });
  } catch (error) {
    return NextResponse.json({ error: `Failed to perform search | ${error}` }, { status: 500 });
  }
}