"use client";

import { useRef, useState } from "react";
import { useSearch } from "@/app/hooks/useSearch";
import { usePreviousQueries } from "@/app/hooks/usePreviousQueries";
import { SearchFormData } from "@/app/types/search";
import SearchInput from "@/components/search-input";
import { Message } from "@/app/types/chat";

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const { search, isLoading } = useSearch();
  const { previousQueries, addQuery } = usePreviousQueries();
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleSearch = async (formData: SearchFormData) => {
    try {
      // Abort previous request if exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Add user message
      const userMessage: Message = {
        role: "user",
        content: formData.query,
      };
      setMessages(prev => [...prev, userMessage]);

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      // Get search results with auto date if enabled
      const searchResults = await search(formData, previousQueries);
      
      if (!searchResults) {
        throw new Error("Search failed");
      }

      // Add assistant message
      const assistantMessage: Message = {
        role: "assistant",
        content: "", // Will be streamed
        searchResults: searchResults.formattedResults,
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Add query to previous queries
      addQuery(formData.query);

      // Start streaming response...
      // ... rest of your streaming logic ...

    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error while searching. Please try again.",
        },
      ]);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        {messages.map((message, i) => (
          <div
            key={i}
            className={`p-4 ${
              message.role === "user" ? "bg-gray-100" : "bg-white"
            }`}
          >
            <div className="max-w-3xl mx-auto">
              <div className="font-medium mb-2">
                {message.role === "user" ? "You" : "Assistant"}
              </div>
              <div className="whitespace-pre-wrap">{message.content}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t p-4">
        <div className="max-w-3xl mx-auto">
          <SearchInput onSearch={handleSearch} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
} 