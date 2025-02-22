export interface SearchFormData {
  query: string;
  autoDate: boolean; // Toggle state for auto date detection
}

export interface SearchRequest {
  query: string;
  previousQueries?: string[];
  settings: ExaSearchSettings;
  autoDate?: boolean; // Pass to API for date processing
}
