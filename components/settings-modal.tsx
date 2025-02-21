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
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Search Settings</h2>
        
        <div className="space-y-4">
          {/* Basic Settings */}
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

          {/* Content Settings */}
          <div className="space-y-4 mt-4 border-t pt-4">
            <h3 className="font-medium">Content Settings</h3>
            
            <div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!formData.customModelMode}
                  onChange={e => setFormData(prev => ({ 
                    ...prev, 
                    customModelMode: e.target.checked,
                    // When custom mode is enabled, force text to true and disable highlights/summary
                    text: e.target.checked ? { maxCharacters: 10000, includeHtmlTags: false } : prev.text,
                    highlights: e.target.checked ? false : prev.highlights,
                    summary: e.target.checked ? false : prev.summary
                  }))}
                  id="customMode"
                />
                <label htmlFor="customMode" className="text-sm">Custom Model Mode (OpenAI Summarization)</label>
              </div>
            </div>

            {!formData.customModelMode && (
              <>
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
                    <div className="ml-6 mt-2">
                      <label className="block text-sm mb-1">Max Characters</label>
                      <input
                        type="number"
                        min="100"
                        max="10000"
                        value={formData.text.maxCharacters}
                        onChange={e => setFormData(prev => ({
                          ...prev,
                          text: typeof prev.text === 'object' ? 
                            { ...prev.text, maxCharacters: parseInt(e.target.value) } : 
                            { maxCharacters: parseInt(e.target.value), includeHtmlTags: false }
                        }))}
                        className="w-full border rounded p-2"
                      />
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
                        highlights: e.target.checked ? { numSentences: 3 } : false
                      }))}
                      id="highlights"
                    />
                    <label htmlFor="highlights" className="text-sm">Include Highlights</label>
                  </div>

                  {formData.highlights && typeof formData.highlights === 'object' && (
                    <div className="ml-6 mt-2">
                      <label className="block text-sm mb-1">Sentences per Highlight</label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={formData.highlights.numSentences}
                        onChange={e => setFormData(prev => ({
                          ...prev,
                          highlights: typeof prev.highlights === 'object' ?
                            { ...prev.highlights, numSentences: parseInt(e.target.value) } :
                            { numSentences: parseInt(e.target.value) }
                        }))}
                        className="w-full border rounded p-2"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!formData.summary}
                    onChange={e => setFormData(prev => ({
                      ...prev,
                      summary: e.target.checked
                    }))}
                    id="summary"
                  />
                  <label htmlFor="summary" className="text-sm">Include Summary</label>
                </div>
              </>
            )}
          </div>

          {/* Advanced Settings */}
          <div className="border-t pt-4">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <svg 
                className={`w-4 h-4 transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              <span className="font-medium">Advanced Settings (Not Tested)</span>
            </button>

            {showAdvanced && (
              <div className="space-y-4 mt-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.useAutoprompt ?? true}
                    onChange={e => setFormData(prev => ({ ...prev, useAutoprompt: e.target.checked }))}
                    id="autoprompt"
                  />
                  <label htmlFor="autoprompt" className="text-sm">Use Autoprompt</label>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Include Domains (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.includeDomains?.join(', ') || ''}
                    onChange={e => setFormData(prev => ({
                      ...prev,
                      includeDomains: e.target.value.split(',').map(d => d.trim()).filter(Boolean)
                    }))}
                    placeholder="example.com, another.com"
                    className="w-full border rounded p-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Exclude Domains (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.excludeDomains?.join(', ') || ''}
                    onChange={e => setFormData(prev => ({
                      ...prev,
                      excludeDomains: e.target.value.split(',').map(d => d.trim()).filter(Boolean)
                    }))}
                    placeholder="example.com, another.com"
                    className="w-full border rounded p-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Published Date Range</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={formData.startPublishedDate || ''}
                      onChange={e => setFormData(prev => ({ ...prev, startPublishedDate: e.target.value }))}
                      className="w-full border rounded p-2"
                    />
                    <input
                      type="date"
                      value={formData.endPublishedDate || ''}
                      onChange={e => setFormData(prev => ({ ...prev, endPublishedDate: e.target.value }))}
                      className="w-full border rounded p-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Crawl Date Range</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={formData.startCrawlDate || ''}
                      onChange={e => setFormData(prev => ({ ...prev, startCrawlDate: e.target.value }))}
                      className="w-full border rounded p-2"
                    />
                    <input
                      type="date"
                      value={formData.endCrawlDate || ''}
                      onChange={e => setFormData(prev => ({ ...prev, endCrawlDate: e.target.value }))}
                      className="w-full border rounded p-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Content Category</label>
                  <select
                    value={formData.category || ''}
                    onChange={e => setFormData(prev => ({ 
                      ...prev, 
                      category: e.target.value as ExaSearchSettings['category'] || undefined
                    }))}
                    className="w-full border rounded p-2"
                  >
                    <option value="">Any</option>
                    <option value="research_paper">Research Paper</option>
                    <option value="news">News</option>
                    <option value="blog">Blog</option>
                    <option value="social_media">Social Media</option>
                    <option value="discussion">Discussion</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Custom Highlight Query</label>
                  <input
                    type="text"
                    value={formData.highlightQuery || ''}
                    onChange={e => setFormData(prev => ({ ...prev, highlightQuery: e.target.value || undefined }))}
                    placeholder="Optional query for highlighting"
                    className="w-full border rounded p-2"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSave(formData);
              onClose();
            }}
            className="px-4 py-2 bg-brand-default text-white rounded hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
} 