
import React from 'react';
import { AnalysisResult, Metric, NewsArticle } from '../types';
import MetricCard from './MetricCard';
import RecommendationCard from './RecommendationCard';
import NewsCard from './NewsCard';
import StockChart from './StockChart';
import CompetitorAnalysis from './CompetitorAnalysis';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { ScaleIcon } from './icons/ScaleIcon';
import { NewspaperIcon } from './icons/NewspaperIcon';
import { CpuChipIcon } from './icons/CpuChipIcon';
import { ArrowUpIcon } from './icons/ArrowUpIcon';
import { ArrowDownIcon } from './icons/ArrowDownIcon';
import { LinkIcon } from './icons/LinkIcon';

interface AnalysisDashboardProps {
  data: AnalysisResult;
  onAddToPortfolio?: (data: AnalysisResult) => void;
  isSaved?: boolean;
}

const ratingColorMap: Record<Metric['rating'], string> = {
    'Poor': 'text-red-400',
    'Fair': 'text-yellow-400',
    'Good': 'text-green-400',
    'Excellent': 'text-cyan-400',
};

const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ data, onAddToPortfolio, isSaved = false }) => {
  const { summary, historicalData, chartSource, growthAnalysis, valueAnalysis, newsSentiment, recommendation, sources, analystEstimates, competitors } = data;

  return (
    <div className="space-y-8 animate-fade-in">
        {/* Summary Header */}
        <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-4xl font-bold text-white">{summary.companyName} ({summary.ticker})</h2>
                    <p className="text-gray-400">Market Cap: {summary.marketCap}</p>
                </div>
                <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                    <div className="text-right">
                        <p className="text-4xl font-bold text-white">${summary.currentPrice.toFixed(2)}</p>
                        <div className={`flex items-center justify-end gap-1 text-lg font-semibold ${summary.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {summary.changePercent >= 0 ? <ArrowUpIcon /> : <ArrowDownIcon />}
                            <span>{summary.changePercent.toFixed(2)}%</span>
                        </div>
                    </div>
                    {onAddToPortfolio && (
                        <button 
                            onClick={() => onAddToPortfolio(data)}
                            disabled={isSaved}
                            className={`flex items-center px-4 py-2 rounded-lg font-semibold transition-all ${
                                isSaved 
                                ? 'bg-gray-700 text-gray-400 cursor-default'
                                : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-900/20'
                            }`}
                        >
                            {isSaved ? (
                                <>
                                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                                    Saved to Portfolio
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                                    Save to Portfolio
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>

        {/* Stock Chart */}
        {historicalData && historicalData.length > 0 && (
            <StockChart data={historicalData} source={chartSource} />
        )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Recommendation & News */}
        <div className="lg:col-span-1 space-y-8">
          <RecommendationCard 
            icon={<CpuChipIcon />} 
            title="AI Recommendation" 
            recommendation={recommendation} 
            analystEstimates={analystEstimates}
            currentPrice={summary.currentPrice}
          />
          <NewsCard icon={<NewspaperIcon />} title="News Sentiment" news={newsSentiment} />
        </div>
        
        {/* Right Column: Growth, Value, Competitors */}
        <div className="lg:col-span-2 space-y-8">
            {/* Growth Analysis */}
            <div className="bg-gray-800/50 p-6 rounded-xl shadow-lg border border-gray-700">
                <h3 className="text-2xl font-bold mb-4 flex items-center text-white"><ChartBarIcon/> <span className="ml-2">Growth Analysis</span></h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <MetricCard title="Revenue Growth" metric={growthAnalysis.revenueGrowth} color={ratingColorMap[growthAnalysis.revenueGrowth.rating]}/>
                    <MetricCard title="EPS Growth" metric={growthAnalysis.epsGrowth} color={ratingColorMap[growthAnalysis.epsGrowth.rating]}/>
                    <MetricCard title="Profit Margins" metric={growthAnalysis.profitMargins} color={ratingColorMap[growthAnalysis.profitMargins.rating]}/>
                    <MetricCard title="Return on Equity (ROE)" metric={growthAnalysis.roe} color={ratingColorMap[growthAnalysis.roe.rating]}/>
                </div>
            </div>

            {/* Value Analysis */}
            <div className="bg-gray-800/50 p-6 rounded-xl shadow-lg border border-gray-700">
                <h3 className="text-2xl font-bold mb-4 flex items-center text-white"><ScaleIcon/> <span className="ml-2">Value Analysis</span></h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <MetricCard title="P/E Ratio" metric={valueAnalysis.peRatio} color={ratingColorMap[valueAnalysis.peRatio.rating]}/>
                    <MetricCard title="P/B Ratio" metric={valueAnalysis.pbRatio} color={ratingColorMap[valueAnalysis.pbRatio.rating]}/>
                    <MetricCard title="Dividend Yield" metric={valueAnalysis.dividendYield} color={ratingColorMap[valueAnalysis.dividendYield.rating]}/>
                    <MetricCard title="DCF Analysis" metric={valueAnalysis.dcfAnalysis} color={ratingColorMap[valueAnalysis.dcfAnalysis.rating]}/>
                </div>
            </div>

            {/* Competitor Analysis */}
            {competitors && competitors.length > 0 && (
                <CompetitorAnalysis competitors={competitors} mainTicker={summary.ticker} />
            )}

             {/* Sources */}
            {sources && sources.length > 0 && (
                <div className="bg-gray-800/50 p-6 rounded-xl shadow-lg border border-gray-700">
                    <h3 className="text-2xl font-bold mb-4 flex items-center text-white">
                        <LinkIcon /> <span className="ml-2">Sources</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {sources.map((source, idx) => (
                            <a 
                                key={idx} 
                                href={source.url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="flex items-center p-2 rounded hover:bg-gray-700/50 transition-colors group"
                            >
                                <span className="text-cyan-400 group-hover:text-cyan-300 text-sm truncate">{source.title}</span>
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default AnalysisDashboard;
