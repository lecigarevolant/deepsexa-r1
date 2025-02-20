import ReactMarkdown from 'react-markdown';
import { parseMessageContent } from '../../utils';
import { Message } from 'ai';
import { ThinkingSpinner } from '../LoadingStates';

interface ChatMessageProps {
  message: Message;
  isLatestMessage: boolean;
  isLLMLoading: boolean;
  isThinkingExpanded: boolean;
  onToggleThinking: () => void;
}

export function ChatMessage({ 
  message, 
  isLatestMessage, 
  isLLMLoading, 
  isThinkingExpanded,
  onToggleThinking 
}: ChatMessageProps) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="rounded py-3 max-w-[85%] bg-[var(--secondary-darker)] text-black px-4">
          <div className="whitespace-pre-wrap text-[15px]">{message.content}</div>
        </div>
      </div>
    );
  }

  const { thinking, finalResponse, isComplete } = parseMessageContent(message.content);

  return (
    <div className="flex justify-start">
      <div className="rounded py-3 max-w-[85%] text-gray-900">
        {(thinking || !isComplete) && (
          <div className="mb-10 space-y-4">
            <div className="flex items-center gap-2">
              <button 
                onClick={onToggleThinking}
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
        {isLLMLoading && isLatestMessage && <ThinkingSpinner />}
      </div>
    </div>
  );
} 