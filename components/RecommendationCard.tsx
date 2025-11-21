
import React from 'react';
import { Recommendation, AnalystEstimates } from '../types';
import { ArrowUpIcon } from './icons/ArrowUpIcon';
import { ArrowDownIcon } from './icons/ArrowDownIcon';

interface RecommendationCardProps {
  icon: React.ReactNode;
  title: string;
  recommendation: Recommendation;
  analystEstimates?: AnalystEstimates;
  currentPrice?: number;
}

const getVerdictClasses = (verdict: string) => {
  const v = verdict.toLowerCase();
  if (v.includes('strong buy') || v.includes('outperform')) return 'bg-green-500 text-white';
  if (v.includes('buy')) return 'bg-green-600 text-white';
  if (v.includes('hold') || v.includes('neutral')) return 'bg-yellow-500 text-gray-900';
  if (v.includes('sell') || v.includes('underperform')) return 'bg-red-600 text-white';
  return 'bg-gray-600 text-white';
};

const RecommendationCard: React.FC<RecommendationCardProps> = ({ icon, title, recommendation, analystEstimates, currentPrice }) => {
  const confidencePercentage = (recommendation.confidenceScore * 100).toFixed(0);

  return (
    <div className="bg-gray-800/50 p-6 rounded-xl shadow-lg border border-gray-700">
      <h3 className="text-2xl font-bold mb-4 flex items-center text-white">{icon} <span className="ml-2">{title}</span></h3>
      
      {/* AI Verdict */}
      <div className="text-center mb-4">
        <span className={`px-6 py-2 text-2xl font-bold rounded-full uppercase ${getVerdictClasses(recommendation.finalVerdict)}`}>
          {recommendation.finalVerdict}
        </span>
      </div>

      <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4">
        <div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: `${confidencePercentage}%` }}></div>
      </div>
      <p className="text-center text-sm text-gray-400 mb-4">AI Confidence: {confidencePercentage}%</p>

      <p className="text-gray-300 mb-6">{recommendation.summary}</p>

      <div className="space-y-4 border-t border-gray-700 pt-4">
        <div>
          <h5 className="font-bold text-green-400">Optimal Entry Point</h5>
          <p className="text-gray-400 text-sm">{recommendation.entryPoint}</p>
        </div>
        <div>
          <h5 className="font-bold text-red-400">Optimal Exit Strategy</h5>
          <p className="text-gray-400 text-sm">{recommendation.exitStrategy}</p>
        </div>
      </div>

      {/* Analyst Consensus Section */}
      {analystEstimates && currentPrice && analystEstimates.targetMean > 0 && (
         <div className="mt-8 pt-6 border-t border-gray-700">
            <h4 className="text-lg font-bold text-white mb-3 flex justify-between items-center">
                <span>Wall St. Forecast</span>
                <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${getVerdictClasses(analystEstimates.consensus)}`}>
                    {analystEstimates.consensus.replace(/_/g, ' ')}
                </span>
            </h4>
            
            <div className="flex justify-between items-end mb-2">
                <div>
                    <p className="text-gray-400 text-xs">Avg Target</p>
                    <p className="text-xl font-bold text-white">${analystEstimates.targetMean.toFixed(2)}</p>
                </div>
                <div className={`text-right ${analystEstimates.targetMean > currentPrice ? 'text-green-400' : 'text-red-400'}`}>
                    <p className="text-gray-400 text-xs">Upside</p>
                    <div className="flex items-center justify-end font-bold">
                        {analystEstimates.targetMean > currentPrice ? <ArrowUpIcon /> : <ArrowDownIcon />}
                        <span>{(((analystEstimates.targetMean - currentPrice) / currentPrice) * 100).toFixed(2)}%</span>
                    </div>
                </div>
            </div>

            {/* Visual Range Bar */}
            <div className="relative h-8 mt-2 w-full">
                {/* Background Track */}
                <div className="absolute top-3 left-0 right-0 h-2 bg-gray-700 rounded-full"></div>
                
                {/* Target Range (Low to High) */}
                {(() => {
                    const min = Math.min(currentPrice, analystEstimates.targetLow) * 0.9;
                    const max = Math.max(currentPrice, analystEstimates.targetHigh) * 1.1;
                    const range = max - min;
                    
                    const getPos = (val: number) => ((val - min) / range) * 100;
                    
                    const leftPos = getPos(analystEstimates.targetLow);
                    const width = getPos(analystEstimates.targetHigh) - leftPos;

                    return (
                        <>
                            {/* Range Bar */}
                            <div 
                                className="absolute top-3 h-2 bg-gray-500 rounded-full opacity-50" 
                                style={{ left: `${leftPos}%`, width: `${width}%` }}
                            ></div>

                            {/* Low Label */}
                            <div className="absolute top-6 text-[10px] text-gray-500 transform -translate-x-1/2" style={{ left: `${leftPos}%` }}>
                                ${analystEstimates.targetLow}
                            </div>
                            {/* High Label */}
                             <div className="absolute top-6 text-[10px] text-gray-500 transform -translate-x-1/2" style={{ left: `${getPos(analystEstimates.targetHigh)}%` }}>
                                ${analystEstimates.targetHigh}
                            </div>

                            {/* Current Price Marker (White Diamond) */}
                            <div 
                                className="absolute top-1 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white transform -translate-x-1/2 z-10"
                                style={{ left: `${getPos(currentPrice)}%` }}
                            ></div>
                             <div className="absolute -top-4 text-[10px] text-white font-bold transform -translate-x-1/2" style={{ left: `${getPos(currentPrice)}%` }}>
                                Now
                            </div>

                            {/* Mean Target Marker (Cyan Circle) */}
                             <div 
                                className="absolute top-2 w-4 h-4 bg-cyan-500 rounded-full border-2 border-gray-800 transform -translate-x-1/2 z-10"
                                style={{ left: `${getPos(analystEstimates.targetMean)}%` }}
                            ></div>
                        </>
                    );
                })()}
            </div>
            <p className="text-center text-xs text-gray-500 mt-6">
                Based on {analystEstimates.numberOfAnalysts} analyst ratings
            </p>
         </div>
      )}
    </div>
  );
};

export default RecommendationCard;
