import { useChat } from "ai/react";
import { useState, useCallback } from "react";
import { SearchResult } from "../types";
import { getAssetPath } from "../utils";
import { Message } from "ai";

interface UseChatLogicReturn {
  messages: Message[];
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent, options?: { body: any }) => Promise<void>;
  isLLMLoading: boolean;
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void;
}

export function useChatLogic(
  searchResults: SearchResult[],
  resetSearch: () => void
): UseChatLogicReturn {
  const [isLLMLoading, setIsLLMLoading] = useState(false);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: handleChatSubmit,
    setMessages,
  } = useChat({
    api: getAssetPath("/api/chat"),
    body: { searchContext: "" },
    onFinish: () => {
      console.log("Chat stream finished");
      setIsLLMLoading(false);
    },
    onError: (error) => {
      console.error("Chat stream error:", error);
      setIsLLMLoading(false);
      resetSearch();
    },
  });

  const handleSubmit = useCallback(
    async (e: React.FormEvent, options?: { body: any }) => {
      setIsLLMLoading(true);
      await handleChatSubmit(e, options);
    },
    [handleChatSubmit]
  );

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLLMLoading,
    setMessages,
  };
}
