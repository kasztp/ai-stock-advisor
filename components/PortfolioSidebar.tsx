
import React from 'react';
import { AnalysisResult } from '../types';

interface PortfolioSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  portfolio: AnalysisResult[];
  onSelect: (item: AnalysisResult) => void;
  onDelete: (ticker: string) => void;
}

const PortfolioSidebar: React.FC<PortfolioSidebarProps> = ({ isOpen, onClose, portfolio, onSelect, onDelete }) => {
  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar Panel */}
      <div className={`fixed top-0 left-0 h-full w-80 bg-gray-900 border-r border-gray-700 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white flex items-center">
            <svg className="w-5 h-5 mr-2 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            My Portfolio
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 overflow-y-auto h-[calc(100vh-64px)]">
          {portfolio.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">
              <p>Your portfolio is empty.</p>
              <p className="text-sm mt-2">Analyze a stock and click "Save to Portfolio" to add it here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {portfolio.map((item) => (
                <div 
                  key={item.summary.ticker} 
                  className="bg-gray-800 p-3 rounded-lg border border-gray-700 hover:border-cyan-500 transition-all group relative cursor-pointer"
                  onClick={() => {
                    onSelect(item);
                    if (window.innerWidth < 1024) onClose();
                  }}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h3 className="font-bold text-white text-lg">{item.summary.ticker}</h3>
                      <p className="text-xs text-gray-400 truncate w-40">{item.summary.companyName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-200">${item.summary.currentPrice.toFixed(2)}</p>
                      <p className={`text-xs font-bold ${
                        item.recommendation.finalVerdict.includes('Buy') ? 'text-green-400' : 
                        item.recommendation.finalVerdict.includes('Sell') ? 'text-red-400' : 'text-yellow-400'
                      }`}>
                        {item.recommendation.finalVerdict}
                      </p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(item.summary.ticker);
                    }}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 bg-red-900/80 rounded hover:bg-red-700 text-red-200 transition-opacity"
                    title="Remove from Portfolio"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PortfolioSidebar;
