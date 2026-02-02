import { AnalysisResult } from '../../types';
import { StockFundamentals } from '../../types'; // Re-using the type from types.ts if available, or we might need to define it here if it was only in stockService

const API_BASE_URL = 'http://localhost:8000/api';

export const getStockHistory = async (ticker: string) => {
    const response = await fetch(`${API_BASE_URL}/stock/${ticker}/history`);
    if (!response.ok) {
        throw new Error('Failed to fetch stock history');
    }
    return response.json();
};

export const getStockFundamentals = async (ticker: string): Promise<StockFundamentals> => {
    const response = await fetch(`${API_BASE_URL}/stock/${ticker}/fundamentals`);
    if (!response.ok) {
        throw new Error('Failed to fetch stock fundamentals');
    }
    return response.json();
};

export const getStockAnalysis = async (ticker: string, fundamentals: StockFundamentals | null, includeSearch: boolean = false, model: string = 'gemini-2.5-flash-lite'): Promise<AnalysisResult> => {
    const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ticker, fundamentals, includeSearch, gemini_model: model }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to get analysis');
    }

    return response.json();
};
