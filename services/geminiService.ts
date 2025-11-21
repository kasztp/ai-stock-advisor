
import { GoogleGenAI } from "@google/genai";
import { GeminiAnalysisResult, Source } from '../types';
import { StockFundamentals } from './stockService';

const getStockAnalysis = async (ticker: string, fundamentals: StockFundamentals | null): Promise<GeminiAnalysisResult> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Prepare the injected data string
  let fundamentalContext = "";
  if (fundamentals) {
    fundamentalContext = `
    USE THE FOLLOWING REAL-TIME FINANCIAL DATA FOR YOUR ANALYSIS. DO NOT SEARCH FOR THESE NUMBERS, USE THESE EXACT VALUES:
    - Current Price: ${fundamentals.price} ${fundamentals.currency}
    - Market Cap: ${(fundamentals.marketCap / 1000000000).toFixed(2)} Billion
    - Trailing P/E: ${fundamentals.trailingPE ? fundamentals.trailingPE.toFixed(2) : 'N/A'}
    - Forward P/E: ${fundamentals.forwardPE ? fundamentals.forwardPE.toFixed(2) : 'N/A'}
    - EPS (TTM): ${fundamentals.epsTrailingTwelveMonths}
    - P/B Ratio: ${fundamentals.priceToBook ? fundamentals.priceToBook.toFixed(2) : 'N/A'}
    - Revenue Growth (YoY): ${(fundamentals.revenueGrowth * 100).toFixed(2)}%
    - Profit Margins: ${(fundamentals.profitMargins * 100).toFixed(2)}%
    - ROE: ${(fundamentals.returnOnEquity * 100).toFixed(2)}%
    - Dividend Yield: ${(fundamentals.dividendYield * 100).toFixed(2)}%
    - Beta: ${fundamentals.beta ? fundamentals.beta.toFixed(2) : 'N/A'}
    
    ANALYST CONSENSUS (For Reference):
    - Recommendation: ${fundamentals.recommendationKey ? fundamentals.recommendationKey.toUpperCase() : 'N/A'}
    - Mean Target Price: ${fundamentals.targetMeanPrice || 'N/A'}
    - Low Target: ${fundamentals.targetLowPrice || 'N/A'}
    - High Target: ${fundamentals.targetHighPrice || 'N/A'}
    `;
  } else {
    fundamentalContext = "Financial data could not be retrieved automatically. You must perform a Google Search to find the latest financial metrics for this stock.";
  }

  const prompt = `
    Analyze the stock with the ticker "${ticker.toUpperCase()}". 
    Provide a detailed analysis based on growth and value investing principles.

    ${fundamentalContext}
    
    1. FINANCIAL DATA ANALYSIS:
    - If the financial data was provided above, interpret it to rate the stock's health.
    - If a value is 'N/A' or 0 (e.g., P/E for unprofitable companies), explain why in the commentary.
    
    2. NEWS SENTIMENT & QUALITATIVE RESEARCH (USE GOOGLE SEARCH):
    - Use the 'googleSearch' tool to find the latest news and qualitative context.
    - Find recent news articles specifically about "${ticker.toUpperCase()}".
    - CRITICAL: Verify that the article content is DIRECTLY related to this company.
    - URL VALIDATION: Provide specific permalinks. Reject generic landing pages.
    
    3. COMPETITOR ANALYSIS (USE GOOGLE SEARCH):
    - Identify 3 major competitors for "${ticker.toUpperCase()}".
    - Use Google Search to find their approximate current Market Cap, P/E Ratio, and Revenue Growth.
    - Compare them briefly to the main ticker.

    4. ANALYSIS & RECOMMENDATION:
    - Perform a qualitative Discounted Cash Flow (DCF) assessment based on the provided growth/margin numbers. 
      (e.g., "Based on 18% revenue growth and improving margins, the intrinsic value is likely higher...")
    - Synthesize all information into a clear recommendation.
    - Consider the Analyst Consensus provided above, but form your own opinion based on the fundamentals and news.
    - For each metric, provide the value (from the injected data), a brief commentary, and a rating ('Poor', 'Fair', 'Good', 'Excellent').

    IMPORTANT: You must return the result as a valid JSON object. Do not add any markdown formatting like \`\`\`json. 
    Do not include any text outside of the JSON object.
    
    The JSON object must strictly follow this structure:
    {
      "summary": {
        "companyName": "string",
        "ticker": "string",
        "currentPrice": number,
        "marketCap": "string",
        "changePercent": number
      },
      "growthAnalysis": {
        "revenueGrowth": { "value": "string", "commentary": "string", "rating": "Poor|Fair|Good|Excellent" },
        "epsGrowth": { "value": "string", "commentary": "string", "rating": "Poor|Fair|Good|Excellent" },
        "profitMargins": { "value": "string", "commentary": "string", "rating": "Poor|Fair|Good|Excellent" },
        "roe": { "value": "string", "commentary": "string", "rating": "Poor|Fair|Good|Excellent" }
      },
      "valueAnalysis": {
        "peRatio": { "value": "string", "commentary": "string", "rating": "Poor|Fair|Good|Excellent" },
        "pbRatio": { "value": "string", "commentary": "string", "rating": "Poor|Fair|Good|Excellent" },
        "dividendYield": { "value": "string", "commentary": "string", "rating": "Poor|Fair|Good|Excellent" },
        "dcfAnalysis": { "value": "string", "commentary": "string", "rating": "Poor|Fair|Good|Excellent" }
      },
      "newsSentiment": {
        "overallSentiment": "Positive|Negative|Neutral",
        "summary": "string",
        "articles": [
          { 
            "title": "string", 
            "source": "string", 
            "summary": "string", 
            "sentiment": "Positive|Negative|Neutral", 
            "url": "string", 
            "date": "string" 
          }
        ]
      },
      "competitors": [
        {
          "name": "string",
          "ticker": "string",
          "marketCap": "string",
          "peRatio": "string",
          "revenueGrowth": "string",
          "comparisonNote": "string"
        }
      ],
      "recommendation": {
        "finalVerdict": "Strong Buy|Buy|Hold|Sell|Strong Sell",
        "confidenceScore": number (0-1),
        "summary": "string",
        "entryPoint": "string",
        "exitStrategy": "string"
      }
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.0, // Set to 0 for maximum consistency
      },
    });

    let jsonText = response.text || '';
    jsonText = jsonText.replace(/```json\n?|```/g, '').trim();
    
    let result: GeminiAnalysisResult;
    try {
        result = JSON.parse(jsonText);
    } catch (e) {
        console.error("Failed to parse JSON:", jsonText);
        throw new Error("The AI response was not valid JSON.");
    }

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: Source[] = chunks
      .map((chunk: any) => chunk.web)
      .filter((web: any) => web)
      .map((web: any) => ({
        title: web.title,
        url: web.uri
      }));

    if (sources.length > 0) {
      result.sources = sources;
    }

    return result;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
};

export { getStockAnalysis };
