
import React, { useState, useCallback, useEffect } from 'react';
import { AnalysisResult } from './types';
import { getStockAnalysis } from './services/geminiService';
import { getHistoricalData, getStockFundamentals } from './services/stockService';
import Header from './components/Header';
import StockInput from './components/StockInput';
import AnalysisDashboard from './components/AnalysisDashboard';
import Loader from './components/Loader';
import PortfolioSidebar from './components/PortfolioSidebar';

const App: React.FC = () => {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [analyzingTicker, setAnalyzingTicker] = useState<string>('');
  
  // Portfolio State
  const [portfolio, setPortfolio] = useState<AnalysisResult[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Load portfolio from LocalStorage on mount
  useEffect(() => {
    const savedPortfolio = localStorage.getItem('ai-stock-advisor-portfolio');
    if (savedPortfolio) {
      try {
        setPortfolio(JSON.parse(savedPortfolio));
      } catch (e) {
        console.error("Failed to load portfolio", e);
      }
    }
  }, []);

  // Save portfolio to LocalStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('ai-stock-advisor-portfolio', JSON.stringify(portfolio));
  }, [portfolio]);

  const addToPortfolio = (item: AnalysisResult) => {
    if (!portfolio.some(p => p.summary.ticker === item.summary.ticker)) {
        setPortfolio([...portfolio, item]);
    }
  };

  const removeFromPortfolio = (ticker: string) => {
    setPortfolio(portfolio.filter(item => item.summary.ticker !== ticker));
  };

  const loadFromPortfolio = (item: AnalysisResult) => {
    setAnalysisResult(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAnalysis = useCallback(async (ticker: string) => {
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    setAnalyzingTicker(ticker);
    
    try {
      // Fetch Market Data (Chart) and Fundamentals (Stats) first
      const [historicalData, fundamentals] = await Promise.all([
        getHistoricalData(ticker),
        getStockFundamentals(ticker)
      ]);

      // Pass fundamentals to Gemini to ensure consistent analysis
      const aiResult = await getStockAnalysis(ticker, fundamentals);

      // Construct Analyst Estimates if data is available
      let analystEstimates = undefined;
      if (fundamentals && fundamentals.targetMeanPrice) {
        analystEstimates = {
            targetLow: fundamentals.targetLowPrice || 0,
            targetHigh: fundamentals.targetHighPrice || 0,
            targetMean: fundamentals.targetMeanPrice || 0,
            consensus: fundamentals.recommendationKey || 'N/A',
            numberOfAnalysts: fundamentals.numberOfAnalystOpinions || 0
        };
      }

      // Combine the results
      const finalResult: AnalysisResult = {
        ...aiResult,
        historicalData: historicalData,
        chartSource: 'Yahoo Finance',
        analystEstimates: analystEstimates,
        competitors: aiResult.competitors || [] // Ensure competitors array exists
      };

      setAnalysisResult(finalResult);
    } catch (err) {
      setError(err instanceof Error ? `Failed to get analysis: ${err.message}` : 'An unknown error occurred.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const isCurrentTickerSaved = analysisResult 
    ? portfolio.some(p => p.summary.ticker === analysisResult.summary.ticker)
    : false;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <Header onToggleSidebar={() => setIsSidebarOpen(prev => !prev)} />
      
      <PortfolioSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        portfolio={portfolio}
        onSelect={loadFromPortfolio}
        onDelete={removeFromPortfolio}
      />

      <main className={`container mx-auto p-4 md:p-8 transition-all duration-300 ${isSidebarOpen ? 'lg:pl-80' : ''}`}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-2 text-white">AI-Powered Stock Insights</h2>
          <p className="text-gray-400 mb-8">
            Enter a stock ticker to receive a comprehensive analysis based on growth, value, and news sentiment.
          </p>
          <StockInput onAnalyze={handleAnalysis} isLoading={isLoading} />
        </div>

        {isLoading && <Loader ticker={analyzingTicker} />}
        
        {error && (
          <div className="mt-8 max-w-4xl mx-auto bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-lg" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline ml-2">{error}</span>
          </div>
        )}

        {analysisResult && !isLoading && (
          <div className="mt-8">
            <AnalysisDashboard 
                data={analysisResult} 
                onAddToPortfolio={addToPortfolio}
                isSaved={isCurrentTickerSaved}
            />
          </div>
        )}

        {!analysisResult && !isLoading && !error && (
            <div className="mt-12 text-center text-gray-500">
                <p>Analysis results will be displayed here.</p>
                {portfolio.length > 0 && (
                    <p className="text-sm mt-2 text-gray-600">Open the sidebar to view your saved portfolio.</p>
                )}
            </div>
        )}
      </main>
    </div>
  );
};

export default App;
