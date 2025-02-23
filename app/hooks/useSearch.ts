import { useState } from "react";
import { SearchFormData } from "@/app/types/search";
import { ExaSearchSettings } from "@/app/types";
import { DEFAULT_SEARCH_SETTINGS } from "@/app/constants/api";

export function useSearch() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (
    formData: SearchFormData,
    previousQueries: string[] = [],
    settings: ExaSearchSettings = DEFAULT_SEARCH_SETTINGS
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      // Perform the search with the provided settings
      const searchResponse = await fetch("deepsexa/api/exawebsearch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: formData.query,
          previousQueries,
          settings: {
            ...settings,
            // If using custom model mode, we need text content
            text: settings.customModelMode
              ? {
                  maxCharacters: 10000,
                  includeHtmlTags: false,
                }
              : settings.text,
          },
        }),
      });

      if (!searchResponse.ok) {
        throw new Error("Search failed");
      }

      const data = await searchResponse.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    search,
    isLoading,
    error,
  };
}
