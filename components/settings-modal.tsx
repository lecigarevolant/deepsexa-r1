'use client';

import { useState } from 'react';
import { ExaSearchSettings } from '@/app/api/exawebsearch/route';

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

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.text}
              onChange={e => setFormData(prev => ({ ...prev, text: e.target.checked }))}
              id="text"
            />
            <label htmlFor="text" className="text-sm">Include Text Content</label>
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