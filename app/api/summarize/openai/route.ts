import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from '@/app/utils/logger';

// Use gpt-4o with structured outputs enabled
const model = openai('gpt-4o', {
  structuredOutputs: true
});

export const maxDuration = 60; // 1 minute timeout

const SYSTEM_PROMPT = `You are a highly capable AI assistant specializing in summarizing webpage content within an ongoing conversation. You are part of a larger system where:

1. A user is having a multi-turn conversation with an AI
2. For each user query, relevant web pages are searched and retrieved with their metadata (title, URL, published date)
3. Your specific role is to summarize these web pages while maintaining the conversational context

When summarizing, you must:
1. Extract and validate the webpage metadata (title, URL, published date)
2. Consider the entire conversation flow (current query + previous queries)
3. Understand that the user might be building upon or refining their previous queries
4. Maintain essential information and key points that connect to the conversation
5. Score the content's relevance to both current query and conversation history
6. Evaluate the timeliness of the information based on publication date
7. Structure information to support the natural progression of the conversation

Your output must strictly follow the specified JSON schema format, including metadata, summary, and relevance metrics.`;

// Types for type safety
interface WebpageSummary {
  metadata: {
    title: string;
    url: string;
    publishedDate: string;
  };
  summary: string;
  relevance: {
    queryRelevance: '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10';
    timelinessScore: '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10';
    conversationFlow: string;
  };
}

// Define the schema for a single webpage summary
const summarySchema = z.object({
  metadata: z.object({
    title: z.string()
      .describe("The title of the webpage"),
    url: z.string()
      .describe("The URL of the webpage"),
    publishedDate: z.string()
      .describe("The publication date of the webpage content")
  }).describe("Metadata extracted from the webpage"),
  summary: z.string()
    .describe("A focused summary that considers the webpage content and conversation context"),
  relevance: z.object({
    queryRelevance: z.enum(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'])
      .describe("How relevant this content is to the current query (0-10)"),
    timelinessScore: z.enum(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'])
      .describe("How timely/recent the content is (0-10)"),
    conversationFlow: z.string()
      .describe("How this content connects to the conversation history")
  }).describe("Relevance metrics for this content")
}).strict();

// Update schema description to be more specific
const schemaDescription = 'A structured summary of webpage content with metadata and relevance metrics';

export async function POST(req: Request) {
    try {
        const { text, query, previousQueries } = await req.json();
        
        if (!text) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        logger.log('\n=== OpenAI Summarization Request ===');
        logger.logObject('Query', query);
        logger.logObject('Previous Queries', previousQueries);
        logger.log(`Text length: ${text.length} chars`);

        const userPrompt = `You are summarizing a webpage as part of an ongoing conversation.

CONVERSATION CONTEXT:
Current Query: "${query}"
${previousQueries?.length ? `Previous Queries (in chronological order): ${previousQueries.join(' → ')}` : 'No previous queries'}

The webpage content includes metadata (title, URL, published date) followed by the main content. Extract these carefully and include them in your structured output.

WEBPAGE CONTENT TO SUMMARIZE:
${text}

Your response must follow this exact structure:
{
  "metadata": {
    "title": "The webpage title",
    "url": "The webpage URL",
    "publishedDate": "The publication date"
  },
  "summary": "A focused summary (aim for 50-2000 chars)",
  "relevance": {
    "queryRelevance": "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10",
    "timelinessScore": "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10",
    "conversationFlow": "Description of connection to conversation"
  }
}

Guidelines (not enforced by schema but please follow):
- Keep summary between 50-2000 characters
- Keep URLs under 2048 characters
- Format dates consistently
- Make descriptions meaningful (10+ chars)

Note: Scores must be strings representing integers from 0 to 10.

Format your response according to the schema exactly.`;

        try {
            const { object } = await generateObject<WebpageSummary>({
                model,
                schema: summarySchema,
                schemaName: 'WebpageSummary',
                schemaDescription,
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: userPrompt }
                ],
            });

            // Validate the response against our schema
            const validated = summarySchema.parse(object);
            
            logger.log('=== OpenAI Summarization Success ===');
            logger.logObject('Summary', validated);
            return NextResponse.json(validated);
        } catch (genError) {
            logger.log('=== OpenAI Generation Error ===');
            logger.logObject('Error', genError);
            throw genError;
        }
    } catch (error) {
        logger.log('=== OpenAI Summarization Error ===');
        logger.logObject('Error', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to summarize text' },
            { status: 500 }
        );
    }
}