/**
 * Chat API route using Perplexity AI r1-1776 model
 * Handles streaming text responses with reasoning
 */

import { perplexity } from '@ai-sdk/perplexity';
import { streamText } from 'ai';
import { Message } from 'ai/react';

// Set maximum execution time to 5 minutes
export const maxDuration = 300;

// Initialize Perplexity AI model
const model = perplexity('r1-1776')

/**
 * POST handler for chat requests
 * Streams responses from Perplexity AI with reasoning
 */
export async function POST(req: Request) {
  console.log('Chat API called');
  const { messages } = await req.json();
  console.log('Messages received:', messages.length);
  console.log('Message roles:', messages.map((m: Message) => m.role).join(', '));

  try {
    // Validate messages
    if (!Array.isArray(messages) || messages.length === 0) {
      throw new Error('Invalid messages array');
    }

    // Filter out system messages except the last one
    const filteredMessages = messages.reduce((acc: Message[], msg: Message, i: number) => {
      if (msg.role !== 'system' || i === messages.length - 1) {
        acc.push(msg);
      }
      return acc;
    }, []);

    console.log('Filtered message count:', filteredMessages.length);
    console.log('Filtered roles:', filteredMessages.map((m: Message) => m.role).join(', '));

    const result = await streamText({
      model,
      messages: [
        {
          role: 'system',
          content: "You are a helpful assistant that takes in the web for information and replies to the user with correct answer. Use simple english."
        },
        ...filteredMessages
      ]
    });

    console.log('Stream response created successfully');
    return result.toDataStreamResponse({sendReasoning: true});
  } catch (error) {
    console.error('Detailed error in chat API:', {
      error,
      stack: error instanceof Error ? error.stack : undefined,
      messages: messages.map((m: Message) => ({ role: m.role, length: m.content.length }))
    });
    
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