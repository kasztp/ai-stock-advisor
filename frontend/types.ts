
export interface StockSummary {
  companyName: string;
  ticker: string;
  currentPrice: number;
  marketCap: string;
  changePercent: number;
  website?: string;
}

export interface Metric {
  value: string;
  commentary: string;
  rating: 'Poor' | 'Fair' | 'Good' | 'Excellent';
}

export interface GrowthAnalysis {
  revenueGrowth: Metric;
  epsGrowth: Metric;
  profitMargins: Metric;
  roe: Metric;
}

export interface ValueAnalysis {
  peRatio: Metric;
  pbRatio: Metric;
  dividendYield: Metric;
  dcfAnalysis: Metric;
}

export interface NewsArticle {
  title: string;
  source: string;
  summary: string;
  sentiment: 'Positive' | 'Negative' | 'Neutral';
  url?: string;
  date?: string;
}

export interface NewsSentiment {
  overallSentiment: 'Positive' | 'Negative' | 'Neutral';
  summary: string;
  articles: NewsArticle[];
}

export interface Recommendation {
  finalVerdict: 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell';
  confidenceScore: number; // 0 to 1
  summary: string;
  entryPoint: string;
  exitStrategy: string;
}

export interface Source {
  title: string;
  url: string;
}

export interface HistoricalDataPoint {
  date: string;
  price: number;
}

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
  targetLowPrice?: number;
  targetHighPrice?: number;
  targetMeanPrice?: number;
  recommendationKey?: string;
  numberOfAnalystOpinions?: number;
  longName?: string;
  website?: string;
}

export interface AnalystEstimates {
  targetLow: number;
  targetHigh: number;
  targetMean: number;
  consensus: string;
  numberOfAnalysts: number;
}

export interface Competitor {
  name: string;
  ticker: string;
  marketCap: string;
  peRatio: string;
  revenueGrowth: string;
  comparisonNote: string;
}

export interface AnalysisResult {
  summary: StockSummary;
  historicalData: HistoricalDataPoint[];
  chartSource?: string;
  growthAnalysis: GrowthAnalysis;
  valueAnalysis: ValueAnalysis;
  newsSentiment: NewsSentiment;
  recommendation: Recommendation;
  sources?: Source[];
  analystEstimates?: AnalystEstimates;
  competitors: Competitor[];
}

// Result returned specifically by the Gemini Service (excludes chart data)
export type GeminiAnalysisResult = Omit<AnalysisResult, 'historicalData' | 'chartSource' | 'analystEstimates'>;
