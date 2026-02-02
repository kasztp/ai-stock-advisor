
import React from 'react';
import { Competitor } from '../types';
import { ChartBarIcon } from './icons/ChartBarIcon';

interface CompetitorAnalysisProps {
  competitors: Competitor[];
  mainTicker: string;
}

const CompetitorAnalysis: React.FC<CompetitorAnalysisProps> = ({ competitors, mainTicker }) => {
  if (!competitors || competitors.length === 0) return null;

  return (
    <div className="bg-gray-800/50 p-6 rounded-xl shadow-lg border border-gray-700">
      <h3 className="text-2xl font-bold mb-6 flex items-center text-white">
        <ChartBarIcon /> <span className="ml-2">Competitive Landscape</span>
      </h3>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-700 text-gray-400 text-sm">
              <th className="py-3 px-4 font-semibold uppercase tracking-wider">Company</th>
              <th className="py-3 px-4 font-semibold uppercase tracking-wider">Market Cap</th>
              <th className="py-3 px-4 font-semibold uppercase tracking-wider">P/E Ratio</th>
              <th className="py-3 px-4 font-semibold uppercase tracking-wider">Rev. Growth</th>
              <th className="py-3 px-4 font-semibold uppercase tracking-wider hidden md:table-cell">Analysis</th>
            </tr>
          </thead>
          <tbody className="text-gray-300">
            {competitors.map((comp, idx) => (
              <tr key={idx} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                <td className="py-4 px-4">
                  <div className="font-bold text-white">{comp.ticker}</div>
                  <div className="text-xs text-gray-400">{comp.name}</div>
                </td>
                <td className="py-4 px-4 font-mono">{comp.marketCap}</td>
                <td className="py-4 px-4 font-mono">{comp.peRatio}</td>
                <td className="py-4 px-4 font-mono">{comp.revenueGrowth}</td>
                <td className="py-4 px-4 text-sm text-gray-400 hidden md:table-cell">{comp.comparisonNote}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs text-gray-500 italic text-center">
        * Competitor metrics are approximate based on recent search data and may vary from real-time feeds.
      </p>
    </div>
  );
};

export default CompetitorAnalysis;
