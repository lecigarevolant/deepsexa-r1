/**
 * Chat API route using Perplexity AI r1-1776 model
 * Handles streaming text responses with reasoning
 */

import { perplexity } from '@ai-sdk/perplexity';
import { streamText } from 'ai';
import { Message } from 'ai/react';
import { logger } from '@/app/utils/logger';
import { CHAT_MAX_DURATION, MAX_PROMPT_LENGTH, SEARCH_ANSWER_TEMPLATE } from '@/app/constants/api';

// Set maximum execution time to 5 minutes
export const maxDuration = CHAT_MAX_DURATION;

// Initialize Perplexity AI model
const model = perplexity('r1-1776')

// Add template constant at top level
const search_answer_en_template = `
# The following contents are the search results related to the user's message:
{search_results}
In the search results I provide to you, each result is formatted as [webpage X begin]...[webpage X end], where X represents the numerical index of each article. Please cite the context at the end of the relevant sentence when appropriate. Use the citation format [citation:X] in the corresponding part of your answer. If a sentence is derived from multiple contexts, list all relevant citation numbers, such as [citation:3][citation:5]. Be sure not to cluster all citations at the end; instead, include them in the corresponding parts of the answer.
When responding, please keep the following points in mind:
- Today is {cur_date}.
- Not all content in the search results is closely related to the user's question. You need to evaluate and filter the search results based on the question.
- For listing-type questions (e.g., listing all flight information), try to limit the answer to 10 key points and inform the user that they can refer to the search sources for complete information. Prioritize providing the most complete and relevant items in the list. Avoid mentioning content not provided in the search results unless necessary.
- For creative tasks (e.g., writing an essay), ensure that references are cited within the body of the text, such as [citation:3][citation:5], rather than only at the end of the text. You need to interpret and summarize the user's requirements, choose an appropriate format, fully utilize the search results, extract key information, and generate an answer that is insightful, creative, and professional. Extend the length of your response as much as possible, addressing each point in detail and from multiple perspectives, ensuring the content is rich and thorough.
- If the response is lengthy, structure it well and summarize it in paragraphs. If a point-by-point format is needed, try to limit it to 5 points and merge related content.
- For objective Q&A, if the answer is very brief, you may add one or two related sentences to enrich the content.
- Choose an appropriate and visually appealing format for your response based on the user's requirements and the content of the answer, ensuring strong readability.
- Your answer should synthesize information from multiple relevant webpages and avoid repeatedly citing the same webpage.
- Unless the user requests otherwise, your response should be in the same language as the user's question.
# The user's message is:
{question}
Start your response with "<think>\\n"`;

/**
 * POST handler for chat requests
 * Streams responses from Perplexity AI with reasoning
 */
export async function POST(req: Request) {
  try {
    const { messages, searchContext } = await req.json();
    
    logger.log('\n=== Chat API Request ===');
    logger.logObject('Messages', messages);
    logger.logObject('Search Context', searchContext);
    logger.log(`Search Context Length: ${searchContext?.length || 0} chars`);

    // Validate messages
    if (!Array.isArray(messages) || messages.length === 0) {
      throw new Error('Invalid messages array');
    }

    // Get current date for template
    const currentDate = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Format previous messages
    const formattedHistory = messages
      .filter(m => m.role !== 'system')
      .map((msg: Message) => {
        if (msg.role === 'user') {
          return `User: ${msg.content}`;
        } else if (msg.role === 'assistant') {
          return `Assistant: ${msg.content}`;
        }
        return '';
      }).filter(msg => msg !== '')
      .join('\n');

    // Get current question from last message
    const currentQuestion = messages[messages.length-1].content;

    // Combine everything into the final prompt
    const combinedPrompt = `${formattedHistory}
${formattedHistory.length > 0 ? '\n' : ''}${SEARCH_ANSWER_TEMPLATE.replace('{search_results}', searchContext || "No search results were found").replace('{cur_date}', currentDate).replace('{question}', currentQuestion)}`;

    // After constructing combinedPrompt
    const promptLength = combinedPrompt.length;
    logger.log(`Combined Prompt Length: ${promptLength} chars`);
    
    if (promptLength > MAX_PROMPT_LENGTH) {
      logger.log(`⚠️ Warning: Prompt exceeds ${MAX_PROMPT_LENGTH} chars`);
    }

    logger.log('\n=== Perplexity API Call ===');
    logger.logObject('Final Prompt', combinedPrompt);

    const result = await streamText({
      model,
      messages: [
        {
          role: 'user', 
          content: combinedPrompt
        }
      ]
    });

    logger.log('=== Perplexity API Response Started ===\n');
    return result.toDataStreamResponse({sendReasoning: true});

  } catch (error) {
    logger.logObject('Chat API Error', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        details: 'Check server logs for more information'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}