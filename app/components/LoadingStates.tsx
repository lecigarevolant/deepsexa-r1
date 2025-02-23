export const SearchingSpinner = ({ dots }: { dots: string }) => (
  <span className="inline-flex justify-center items-center">
    <span>Searching</span>
    <span className="w-[24px] text-left">{dots}</span>
  </span>
);

export const ThinkingSpinner = () => (
  <div className="pt-6 flex items-center gap-2 text-gray-500">
    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <span className="text-sm">DeepSeek Thinking</span>
  </div>
);

interface SearchStatusProps {
  isSearching: boolean;
  isSummarizing: boolean;
  dateRange?: {
    startDate: string | null;
    endDate: string | null;
  };
  dots: string;
}

export const SearchStatus = ({ isSearching, isSummarizing, dateRange, dots }: SearchStatusProps) => (
  <div className="flex flex-col gap-2 text-sm text-gray-600">
    {dateRange && (
      <div className="flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span>
          {dateRange.startDate && dateRange.endDate 
            ? `Searching between ${dateRange.startDate} and ${dateRange.endDate}`
            : dateRange.startDate 
              ? `Searching from ${dateRange.startDate}`
              : dateRange.endDate 
                ? `Searching until ${dateRange.endDate}`
                : 'No specific date range detected'}
        </span>
      </div>
    )}
    {isSearching && (
      <div className="flex items-center gap-2">
        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Searching web{dots}</span>
      </div>
    )}
    {isSummarizing && (
      <div className="flex items-center gap-2">
        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Summarizing content{dots}</span>
      </div>
    )}
  </div>
); 