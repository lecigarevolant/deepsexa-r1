'use client';

import { useState } from 'react';
import { ExaSearchSettings } from '@/app/types';
import { 
  TextContentsOptions, 
  HighlightsContentsOptions, 
  SummaryContentsOptions 
} from 'exa-js';

interface SettingsModalProps {
  settings: ExaSearchSettings;
  onSave: (settings: ExaSearchSettings) => void;
  onClose: () => void;
}

export default function SettingsModal({ settings, onSave, onClose }: SettingsModalProps) {
  const [formData, setFormData] = useState<ExaSearchSettings>(settings);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Search Settings</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Search Type</label>
            <select 
              value={formData.type}
              onChange={e => setFormData(prev => ({ ...prev, type: e.target.value as ExaSearchSettings['type'] }))}
              className="w-full border rounded p-2"
            >
              <option value="auto">Auto</option>
              <option value="keyword">Keyword</option>
              <option value="neural">Neural</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Number of Results</label>
            <input 
              type="number"
              min="1"
              max="10"
              value={formData.numResults}
              onChange={e => setFormData(prev => ({ ...prev, numResults: parseInt(e.target.value) }))}
              className="w-full border rounded p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Live Crawling</label>
            <select
              value={formData.livecrawl}
              onChange={e => setFormData(prev => ({ ...prev, livecrawl: e.target.value as ExaSearchSettings['livecrawl'] }))}
              className="w-full border rounded p-2"
            >
              <option value="never">Never</option>
              <option value="fallback">Fallback</option>
              <option value="always">Always</option>
            </select>
          </div>
        </div>

        <div className="space-y-4 mt-4 border-t pt-4">
          <h3 className="font-medium">Content Settings</h3>
          
          <div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!formData.text}
                onChange={e => setFormData(prev => ({ 
                  ...prev, 
                  text: e.target.checked ? { maxCharacters: 2000, includeHtmlTags: false } : false 
                }))}
                id="text"
              />
              <label htmlFor="text" className="text-sm">Include Text Content</label>
            </div>
            
            {formData.text && typeof formData.text === 'object' && (
              <div className="ml-6 mt-2 space-y-2">
                <div>
                  <label className="text-sm">Max Characters</label>
                  <input
                    type="number"
                    value={formData.text.maxCharacters}
                    onChange={e => setFormData(prev => ({
                      ...prev,
                      text: {
                        ...prev.text as TextContentsOptions,
                        maxCharacters: parseInt(e.target.value)
                      }
                    }))}
                    className="w-full border rounded p-1 text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!formData.highlights}
                onChange={e => setFormData(prev => ({
                  ...prev,
                  highlights: e.target.checked ? {
                    numSentences: 3,
                    highlightsPerUrl: 2
                  } : false
                }))}
                id="highlights"
              />
              <label htmlFor="highlights" className="text-sm">Include Highlights</label>
            </div>

            {formData.highlights && typeof formData.highlights === 'object' && (
              <div className="ml-6 mt-2 space-y-2">
                <div>
                  <label className="text-sm">Sentences per Highlight</label>
                  <input
                    type="number"
                    value={formData.highlights.numSentences}
                    onChange={e => setFormData(prev => ({
                      ...prev,
                      highlights: {
                        ...prev.highlights as HighlightsContentsOptions,
                        numSentences: parseInt(e.target.value)
                      }
                    }))}
                    className="w-full border rounded p-1 text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={!!formData.summary}
              onChange={e => setFormData(prev => ({
                ...prev,
                summary: e.target.checked ? {} : false
              }))}
              id="summary"
            />
            <label htmlFor="summary" className="text-sm">Include Summary</label>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSave(formData);
              onClose();
            }}
            className="px-4 py-2 bg-[var(--brand-default)] text-white rounded hover:bg-[var(--brand-muted)]"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
} 