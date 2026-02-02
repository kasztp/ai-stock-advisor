from fastapi import APIRouter, HTTPException
from typing import List
import os
from .models import HistoricalDataPoint, StockFundamentals, AnalysisRequest
from .services import (
    fetch_stock_history,
    fetch_stock_fundamentals,
    analyze_stock_with_gemini,
)

router = APIRouter()


@router.get("/stock/{ticker}/history", response_model=List[HistoricalDataPoint])
async def get_stock_history(ticker: str):
    try:
        return await fetch_stock_history(ticker)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stock/{ticker}/fundamentals", response_model=StockFundamentals)
async def get_stock_fundamentals(ticker: str):
    try:
        return await fetch_stock_fundamentals(ticker)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analyze")
async def analyze_stock(request: AnalysisRequest):
    print(
        f"Analyzing stock {request.ticker} with gemini_model: {request.gemini_model}, includeSearch: {request.includeSearch}"
    )
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured")

    try:
        return await analyze_stock_with_gemini(
            request.ticker,
            request.fundamentals,
            api_key,
            request.includeSearch,
            request.gemini_model,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
