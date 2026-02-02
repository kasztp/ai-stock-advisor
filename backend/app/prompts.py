from .models import StockFundamentals


def generate_analysis_prompt(
    ticker: str, fundamentals: StockFundamentals | None
) -> str:
    fundamental_context = ""
    if fundamentals:
        fundamental_context = f"""
        USE THE FOLLOWING REAL-TIME FINANCIAL DATA FOR YOUR ANALYSIS. DO NOT SEARCH FOR THESE NUMBERS, USE THESE EXACT VALUES:
        - Current Price: {fundamentals.price} {fundamentals.currency}
        - Market Cap: {(fundamentals.marketCap / 1000000000):.2f} Billion
        - Trailing P/E: {fundamentals.trailingPE:.2f}
        - Forward P/E: {fundamentals.forwardPE:.2f}
        - EPS (TTM): {fundamentals.epsTrailingTwelveMonths}
        - P/B Ratio: {fundamentals.priceToBook:.2f}
        - Revenue Growth (YoY): {(fundamentals.revenueGrowth * 100):.2f}%
        - Profit Margins: {(fundamentals.profitMargins * 100):.2f}%
        - ROE: {(fundamentals.returnOnEquity * 100):.2f}%
        - Dividend Yield: {(fundamentals.dividendYield * 100):.2f}%
        - Beta: {fundamentals.beta:.2f}
        - Website: {fundamentals.website if fundamentals.website else 'N/A'}
        
        ANALYST CONSENSUS (For Reference):
        - Recommendation: {fundamentals.recommendationKey.upper() if fundamentals.recommendationKey else 'N/A'}
        - Mean Target Price: {fundamentals.targetMeanPrice if fundamentals.targetMeanPrice else 'N/A'}
        """
    else:
        fundamental_context = "Financial data could not be retrieved automatically. You must perform a Google Search to find the latest financial metrics for this stock."

    return f"""
    Analyze the stock with the ticker "{ticker.upper()}" {f'({fundamentals.longName})' if fundamentals and fundamentals.longName else ''}. 
    Provide a detailed analysis based on growth and value investing principles.

    CRITICAL: Ensure you are analyzing the EXACT company matching ticker {ticker.upper()}. 
    {f"The expected company name is {fundamentals.longName} and the website is {fundamentals.website}." if fundamentals and fundamentals.longName else ""}

    {fundamental_context}
    
    1. FINANCIAL DATA ANALYSIS:
    - If the financial data was provided above, interpret it to rate the stock's health.
    - If a value is 'N/A' or 0 (e.g., P/E for unprofitable companies), explain why in the commentary.
    
    2. NEWS SENTIMENT & QUALITATIVE RESEARCH (USE GOOGLE SEARCH):
    - Use the 'google_search' tool to find the latest news and qualitative context.
    - Find recent news articles specifically about "{ticker.upper()}".
    - CRITICAL: Verify that the article content is DIRECTLY related to this company.
    
    3. COMPETITOR ANALYSIS (USE GOOGLE SEARCH):
    - Identify 3 major competitors for "{ticker.upper()}".
    - Use Google Search to find their approximate current Market Cap, P/E Ratio, and Revenue Growth.
    - Compare them briefly to the main ticker.

    4. ANALYSIS & RECOMMENDATION:
    - Perform a qualitative Discounted Cash Flow (DCF) assessment based on the provided growth/margin numbers. 
    - Synthesize all information into a clear recommendation.
    - Consider the Analyst Consensus provided above, but form your own opinion based on the fundamentals and news.
    - For each metric, provide the value (from the injected data), a brief commentary, and a rating ('Poor', 'Fair', 'Good', 'Excellent').

    IMPORTANT: You must return the result as a valid JSON object. Do not add any markdown formatting like ```json. 
    Do not include any text outside of the JSON object.
    
    The JSON object must strictly follow this structure:
    {{
        "summary": {{
        "companyName": "string",
        "ticker": "string",
        "currentPrice": number,
        "marketCap": "string",
        "changePercent": number,
        "website": "string"
        }},
        "growthAnalysis": {{
        "revenueGrowth": {{ "value": "string", "commentary": "string", "rating": "Poor|Fair|Good|Excellent" }},
        "epsGrowth": {{ "value": "string", "commentary": "string", "rating": "Poor|Fair|Good|Excellent" }},
        "profitMargins": {{ "value": "string", "commentary": "string", "rating": "Poor|Fair|Good|Excellent" }},
        "roe": {{ "value": "string", "commentary": "string", "rating": "Poor|Fair|Good|Excellent" }}
        }},
        "valueAnalysis": {{
        "peRatio": {{ "value": "string", "commentary": "string", "rating": "Poor|Fair|Good|Excellent" }},
        "pbRatio": {{ "value": "string", "commentary": "string", "rating": "Poor|Fair|Good|Excellent" }},
        "dividendYield": {{ "value": "string", "commentary": "string", "rating": "Poor|Fair|Good|Excellent" }},
        "dcfAnalysis": {{ "value": "string", "commentary": "string", "rating": "Poor|Fair|Good|Excellent" }}
        }},
        "newsSentiment": {{
        "overallSentiment": "Positive|Negative|Neutral",
        "summary": "string",
        "articles": [
            {{ 
            "title": "string", 
            "source": "string", 
            "summary": "string", 
            "sentiment": "Positive|Negative|Neutral", 
            "url": "string", 
            "date": "string" 
            }}
        ]
        }},
        "competitors": [
        {{
            "name": "string",
            "ticker": "string",
            "marketCap": "string",
            "peRatio": "string",
            "revenueGrowth": "string",
            "comparisonNote": "string"
        }}
        ],
        "recommendation": {{
        "finalVerdict": "Strong Buy|Buy|Hold|Sell|Strong Sell",
        "confidenceScore": number (0-1),
        "summary": "string",
        "entryPoint": "string",
        "exitStrategy": "string"
        }}
    }}
    """
