import { useState } from "react";
import { SearchFormData } from "@/app/types/search";
import { ExaSearchSettings } from "@/app/api/exawebsearch/route";
import { DEFAULT_SEARCH_SETTINGS } from "@/app/constants/api";

export function useSearch() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (
    formData: SearchFormData,
    previousQueries: string[] = []
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      // If autoDate is enabled, get date range from OpenAI
      let settings = { ...DEFAULT_SEARCH_SETTINGS };

      if (formData.autoDate) {
        const dateResponse = await fetch("deepsexa/api/parse-date", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: formData.query,
            previousQueries,
          }),
        });

        if (!dateResponse.ok) {
          throw new Error("Failed to parse date range");
        }

        const dateRange = await dateResponse.json();

        // Apply the date range to settings if dates were detected
        if (dateRange.dateRange.startDate || dateRange.dateRange.endDate) {
          settings = {
            ...settings,
            startPublishedDate: dateRange.dateRange.startDate,
            endPublishedDate: dateRange.dateRange.endDate,
          };
        }
      }

      // Perform the search with the updated settings
      const searchResponse = await fetch("deepsexa/api/exawebsearch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: formData.query,
          previousQueries,
          settings,
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
