import { perplexity } from '@ai-sdk/perplexity';
import { streamText } from 'ai';

export const maxDuration = 300;

const model = perplexity('r1-1776')

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model,
    messages: [
      {
        role: 'system',
        content: "You are a helpful assistant that takes in the web for information and replies to the user with correct answer. Use simple english."
      },
      ...messages
    ]
  });

  return result.toDataStreamResponse({sendReasoning: true});
}