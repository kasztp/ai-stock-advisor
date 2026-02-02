import yfinance as yf
from google import genai
from google.genai import types
import json
from .models import HistoricalDataPoint, StockFundamentals
from .prompts import generate_analysis_prompt


async def fetch_stock_history(ticker: str) -> list[HistoricalDataPoint]:
    try:
        stock = yf.Ticker(ticker)
        hist = stock.history(period="5y")

        if hist.empty:
            return []

        data = []
        for date, row in hist.iterrows():
            data.append(
                HistoricalDataPoint(date=date.strftime("%Y-%m-%d"), price=row["Close"])
            )
        return data
    except Exception as e:
        print(f"Error fetching history for {ticker}: {e}")
        raise e


async def fetch_stock_fundamentals(ticker: str) -> StockFundamentals:
    try:
        stock = yf.Ticker(ticker)
        info = stock.info

        def get(key, default=0.0):
            return info.get(key, default)

        return StockFundamentals(
            price=get("currentPrice", 0.0),
            marketCap=get("marketCap", 0.0),
            trailingPE=get("trailingPE", 0.0),
            forwardPE=get("forwardPE", 0.0),
            epsTrailingTwelveMonths=get("trailingEps", 0.0),
            priceToBook=get("priceToBook", 0.0),
            revenueGrowth=get("revenueGrowth", 0.0),
            profitMargins=get("profitMargins", 0.0),
            returnOnEquity=get("returnOnEquity", 0.0),
            dividendYield=get("dividendYield", 0.0),
            beta=get("beta", 0.0),
            currency=info.get("currency", "USD"),
            targetLowPrice=info.get("targetLowPrice"),
            targetHighPrice=info.get("targetHighPrice"),
            targetMeanPrice=info.get("targetMeanPrice"),
            recommendationKey=info.get("recommendationKey"),
            numberOfAnalystOpinions=info.get("numberOfAnalystOpinions"),
            longName=info.get("longName"),
            website=info.get("website"),
        )
    except Exception as e:
        print(f"Error fetching fundamentals for {ticker}: {e}")
        raise e


async def analyze_stock_with_gemini(
    ticker: str,
    fundamentals: StockFundamentals | None,
    api_key: str,
    include_search: bool = False,
    model: str = "gemini-2.5-flash-lite",
) -> dict:
    try:
        client = genai.Client(api_key=api_key)
        prompt = generate_analysis_prompt(ticker, fundamentals)

        # Configure tools conditionally
        tools = []
        if include_search:
            tools.append(types.Tool(google_search=types.GoogleSearch()))

        response = client.models.generate_content(
            model=model,
            contents=prompt,
            config=types.GenerateContentConfig(
                tools=tools if tools else None,
                temperature=0.0,
            ),
        )

        if response.text:
            json_text = response.text
            json_text = json_text.replace("```json", "").replace("```", "").strip()
            result = json.loads(json_text)
        else:
            raise Exception(
                "No text content returned from Gemini (possibly blocked by safety filters)"
            )

        if (
            response.candidates
            and response.candidates[0].grounding_metadata
            and response.candidates[0].grounding_metadata.grounding_chunks
        ):
            chunks = response.candidates[0].grounding_metadata.grounding_chunks
            sources = []
            for chunk in chunks:
                if chunk.web:
                    sources.append({"title": chunk.web.title, "url": chunk.web.uri})
            if sources:
                result["sources"] = sources

        return result

    except Exception as e:
        print(f"Error calling Gemini API: {e}")
        raise e
