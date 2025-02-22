import { useState } from 'react';
import { Toggle } from "@/app/components/ui/toggle";
import { CalendarClock } from "lucide-react";
import { SearchFormData } from '@/app/types/search';
import { SearchingSpinner } from '../LoadingStates';
import { useAutoResizeTextarea } from '../../hooks/useAutoResizeTextarea';

interface ChatInputProps {
  input: string;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSearching: boolean;
  loadingDots: string;
  showModelNotice: boolean;
  messageCount: number;
}

export function ChatInput({
  input,
  onInputChange,
  onSubmit,
  isSearching,
  loadingDots,
  showModelNotice,
  messageCount
}: ChatInputProps) {
  const [autoDate, setAutoDate] = useState(false);
  const { textareaRef, handleTextareaChange } = useAutoResizeTextarea();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit(e);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const formData: SearchFormData = {
      query: input.trim(),
      autoDate
    };

    onSubmit(e);
  };

  return (
    <div className={`${messageCount === 0 
      ? 'fixed inset-0 flex items-center justify-center bg-transparent' 
      : 'fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t'} z-40 transition-all duration-300`}>
      <div className={`${messageCount === 0 
        ? 'w-full max-w-2xl mx-auto px-6' 
        : 'w-full max-w-4xl mx-auto px-6 py-4'}`}>
        <form onSubmit={handleSubmit} className="flex flex-col items-center">
          <div className="flex gap-2 w-full max-w-4xl">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => handleTextareaChange(e, onInputChange)}
                onKeyDown={handleKeyDown}
                placeholder="Ask something... (Ctrl+Enter to send)"
                rows={1}
                className="w-full p-3 pr-24 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--brand-default)] text-base resize-none overflow-hidden"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <Toggle
                  size="sm"
                  pressed={autoDate}
                  onPressedChange={setAutoDate}
                  className="bg-transparent hover:bg-gray-100 data-[state=on]:bg-brand-default data-[state=on]:text-white"
                  title="Auto-detect date range"
                >
                  <CalendarClock className="h-4 w-4" />
                </Toggle>
              </div>
            </div>
            <button 
              type="submit"
              disabled={!input.trim() || isSearching}
              className="px-5 py-3 bg-[var(--brand-default)] text-white rounded-md hover:bg-[var(--brand-muted)] font-medium w-[120px] h-[46px] flex items-center justify-center"
            >
              {isSearching ? <SearchingSpinner dots={loadingDots} /> : 'Search'}
            </button>
          </div>
          
          {showModelNotice && messageCount === 0 && (
            <p className="text-xs md:text-sm text-gray-600 mt-8">
              Using Perplexity AI r1-1776 model
            </p>
          )}
        </form>
      </div>
    </div>
  );
} 