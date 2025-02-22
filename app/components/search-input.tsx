"use client";

import { useState } from "react";
import { SearchFormData } from "@/app/types/search";
import { Toggle } from "@/components/ui/toggle";
import { CalendarClock } from "lucide-react";

interface SearchInputProps {
  onSearch: (data: SearchFormData) => void;
  isLoading?: boolean;
}

export default function SearchInput({ onSearch, isLoading }: SearchInputProps) {
  const [query, setQuery] = useState("");
  const [autoDate, setAutoDate] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    onSearch({
      query: query.trim(),
      autoDate
    });
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex gap-2 w-full">
      <div className="relative flex-1">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask anything..."
          className="w-full p-2 pr-24 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-default focus:border-transparent"
          disabled={isLoading}
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
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="px-4 py-1 bg-brand-default text-white rounded-md hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
          >
            {isLoading ? "..." : "Send"}
          </button>
        </div>
      </div>
    </form>
  );
} 