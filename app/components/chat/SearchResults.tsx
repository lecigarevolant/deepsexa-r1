import Image from 'next/image';
import { getAssetPath } from '../../utils';
import { SearchResult } from '../../types';
import { ThinkingSpinner, SearchStatus } from '../LoadingStates';

interface SearchResultsProps {
  results: SearchResult[];
  isSourcesExpanded: boolean;
  onToggleSources: () => void;
  isLLMLoading: boolean;
  isLatestMessage: boolean;
  isSearching: boolean;
  isSummarizing: boolean;
  dateRange?: {
    startDate: string | null;
    endDate: string | null;
  };
  loadingDots: string;
}

export function SearchResults({
  results,
  isSourcesExpanded,
  onToggleSources,
  isLLMLoading,
  isLatestMessage,
  isSearching,
  isSummarizing,
  dateRange,
  loadingDots
}: SearchResultsProps) {
  // Show component if there are results OR if we're in a loading state
  const shouldShow = results.length > 0 || isSearching || isSummarizing || dateRange;
  
  if (!shouldShow) return null;

  return (
    <div className="my-10 space-y-4">
      <div className="flex items-center gap-2">
        <button 
          onClick={onToggleSources}
          className="flex items-center gap-2"
        >
          <svg 
            className={`w-5 h-5 transform hover:text-[var(--brand-default)] transition-colors transition-transform ${isSourcesExpanded ? 'rotate-0' : '-rotate-180'}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
          <Image src={getAssetPath('/exa_logo.png')} alt="Exa" width={45} height={45} />
          <h3 className="text-md font-medium">Search Results</h3>
        </button>
      </div>

      {/* Always show status if we're in any loading state or have date range */}
      <SearchStatus
        isSearching={isSearching}
        isSummarizing={isSummarizing}
        dateRange={dateRange}
        dots={loadingDots}
      />

      {isSourcesExpanded && results.length > 0 && (
        <div className="pl-4 relative">
          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-200"></div>
          <div className="space-y-2">
            {results.map((result, idx) => (
              <div key={idx} className="text-sm group relative">
                <a href={result.url} 
                   target="_blank" 
                   className="text-gray-600 hover:text-[var(--brand-default)] flex items-center gap-2">
                  [{idx + 1}] {result.title}
                  {result.favicon && (
                    <img 
                      src={result.favicon} 
                      alt=""
                      className="w-4 h-4 object-contain"
                    />
                  )}
                </a>
                {/* Content preview on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute left-0 -bottom-2 translate-y-full bg-gray-800 text-white text-xs py-2 px-3 rounded max-w-xl z-10 pointer-events-none">
                  <div className="font-medium mb-1">Content Preview:</div>
                  {result.text && <div className="mb-2">{typeof result.text === 'string' ? result.text : 'Text content available'}</div>}
                  {result.highlights && Array.isArray(result.highlights) && (
                    <div>
                      <div className="font-medium mb-1">Highlights:</div>
                      {result.highlights.map((highlight, i) => (
                        <div key={i} className="mb-1">• {highlight}</div>
                      ))}
                    </div>
                  )}
                  {result.summary && (
                    <div>
                      <div className="font-medium mb-1">Summary:</div>
                      <div>{result.summary}</div>
                    </div>
                  )}
                  <div className="mt-2 text-gray-300">{result.url}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isLLMLoading && isLatestMessage && <ThinkingSpinner />}
    </div>
  );
} 