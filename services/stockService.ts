
import { HistoricalDataPoint } from '../types';

export const getHistoricalData = async (ticker: string): Promise<HistoricalDataPoint[]> => {
  try {
    // Using Yahoo Finance API via a CORS proxy to avoid client-side CORS issues.
    // We fetch 5 years of daily data.
    const encodedUrl = encodeURIComponent(
      `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?range=5y&interval=1d`
    );
    const response = await fetch(`https://corsproxy.io/?${encodedUrl}`);

    if (!response.ok) {
      console.warn("Yahoo Finance API request failed, returning empty data.");
      return [];
    }

    const data = await response.json();
    const result = data.chart?.result?.[0];

    if (!result) return [];

    const timestamps = result.timestamp || [];
    const quote = result.indicators?.quote?.[0] || {};
    const closePrices = quote.close || [];

    // Map timestamp and price to our format
    const formattedData: HistoricalDataPoint[] = timestamps.map((ts: number, index: number) => {
        const price = closePrices[index];
        if (price === null || price === undefined) return null;

        return {
            date: new Date(ts * 1000).toISOString().split('T')[0], // YYYY-MM-DD
            price: price
        };
    }).filter((item): item is HistoricalDataPoint => item !== null);

    return formattedData;

  } catch (error) {
    console.error("Error fetching historical data:", error);
    return [];
  }
};

export interface StockFundamentals {
  price: number;
  marketCap: number;
  trailingPE: number;
  forwardPE: number;
  epsTrailingTwelveMonths: number;
  priceToBook: number;
  revenueGrowth: number;
  profitMargins: number;
  returnOnEquity: number;
  dividendYield: number;
  beta: number;
  currency: string;
  // Analyst Data
  targetLowPrice?: number;
  targetHighPrice?: number;
  targetMeanPrice?: number;
  recommendationKey?: string;
  numberOfAnalystOpinions?: number;
}

export const getStockFundamentals = async (ticker: string): Promise<StockFundamentals | null> => {
  try {
    // Fetch Quote Summary from Yahoo Finance (modules: defaultKeyStatistics, financialData, summaryDetail)
    const encodedUrl = encodeURIComponent(
      `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${ticker}?modules=defaultKeyStatistics,financialData,summaryDetail`
    );
    
    const response = await fetch(`https://corsproxy.io/?${encodedUrl}`);
    
    if (!response.ok) {
        console.warn("Yahoo Finance Fundamentals request failed.");
        return null;
    }

    const data = await response.json();
    const result = data.quoteSummary?.result?.[0];

    if (!result) return null;

    const stats = result.defaultKeyStatistics || {};
    const fin = result.financialData || {};
    const summary = result.summaryDetail || {};

    // Helper to safely extract raw values
    const val = (obj: any) => (obj && obj.raw !== undefined ? obj.raw : null);
    // Helper for strings/other types that might be direct or nested
    const text = (obj: any) => (obj ? obj : null);

    return {
      price: val(fin.currentPrice) || 0,
      marketCap: val(summary.marketCap) || 0,
      trailingPE: val(summary.trailingPE) || 0,
      forwardPE: val(summary.forwardPE) || 0,
      epsTrailingTwelveMonths: val(stats.trailingEps) || 0,
      priceToBook: val(stats.priceToBook) || 0,
      revenueGrowth: val(fin.revenueGrowth) || 0,
      profitMargins: val(fin.profitMargins) || 0,
      returnOnEquity: val(fin.returnOnEquity) || 0,
      dividendYield: val(summary.dividendYield) || 0,
      beta: val(stats.beta) || 0,
      currency: fin.financialCurrency || 'USD',
      // Analyst Data
      targetLowPrice: val(fin.targetLowPrice),
      targetHighPrice: val(fin.targetHighPrice),
      targetMeanPrice: val(fin.targetMeanPrice),
      recommendationKey: fin.recommendationKey || null,
      numberOfAnalystOpinions: val(fin.numberOfAnalystOpinions)
    };

  } catch (error) {
    console.error("Error fetching stock fundamentals:", error);
    return null;
  }
};
