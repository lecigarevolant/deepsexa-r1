import Image from 'next/image';
import { getAssetPath } from '../../utils';
import { SearchResult } from '../../types';
import { ThinkingSpinner } from '../LoadingStates';

interface SearchResultsProps {
  results: SearchResult[];
  isSourcesExpanded: boolean;
  onToggleSources: () => void;
  isLLMLoading: boolean;
  isLatestMessage: boolean;
}

export function SearchResults({
  results,
  isSourcesExpanded,
  onToggleSources,
  isLLMLoading,
  isLatestMessage
}: SearchResultsProps) {
  if (!results.length) return null;

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

      {isSourcesExpanded && (
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
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute left-0 -bottom-6 bg-gray-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap z-10 pointer-events-none">
                  {result.url}
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