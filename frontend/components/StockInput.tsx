
import React, { useState } from 'react';

interface StockInputProps {
  onAnalyze: (ticker: string, includeSearch: boolean, model: string) => void;
  isLoading: boolean;
}

const AVAILABLE_MODELS = [
  { id: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite (Fast)' },
  { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash (Balanced)' },
  { id: 'gemini-2.0-pro-exp-02-05', label: 'Gemini 2.0 Pro Exp (Powerful)' },
];

const StockInput: React.FC<StockInputProps> = ({ onAnalyze, isLoading }) => {
  const [ticker, setTicker] = useState('');
  const [includeSearch, setIncludeSearch] = useState(false);
  const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS[0].id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ticker.trim()) {
      onAnalyze(ticker.trim().toUpperCase(), includeSearch, selectedModel);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-2 justify-center">
        <input
          type="text"
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          placeholder="Enter stock ticker (e.g., AAPL)"
          className="w-full sm:w-64 px-4 py-3 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white placeholder-gray-500 transition-all duration-300"
          disabled={isLoading}
        />
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          disabled={isLoading}
          className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white transition-all duration-300 cursor-pointer disabled:cursor-not-allowed"
        >
          {AVAILABLE_MODELS.map((model) => (
            <option key={model.id} value={model.id}>
              {model.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={isLoading || !ticker.trim()}
          className="px-6 py-3 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center min-w-[140px]"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing...
            </>
          ) : (
            'Analyze Stock'
          )}
        </button>
      </div>
      <div className="flex justify-center items-center gap-2">
        <label className="flex items-center gap-2 text-gray-400 cursor-pointer select-none hover:text-cyan-400 transition-colors">
          <input
            type="checkbox"
            checked={includeSearch}
            onChange={(e) => setIncludeSearch(e.target.checked)}
            disabled={isLoading}
            className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-cyan-600 focus:ring-cyan-500 focus:ring-offset-gray-900 transition-all cursor-pointer disabled:cursor-not-allowed"
          />
          <span className="text-sm">Include Fresh News (Uses Search Quota)</span>
        </label>
      </div>
    </form>
  );
};

export default StockInput;
