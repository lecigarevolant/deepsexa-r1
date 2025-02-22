export interface DateRangeResponse {
  dateRange: {
    startDate: string | null; // YYYY-MM-DD
    endDate: string | null; // YYYY-MM-DD
    rationale: string;
  };
  confidence: "low" | "medium" | "high";
  temporalContext: {
    relativeTime?: "recent" | "historic" | "specific_range";
    referencePoint?: "conversation_history" | "current_date" | "explicit_query";
  };
}

export interface DateParserRequest {
  query: string;
  previousQueries?: string[];
}
