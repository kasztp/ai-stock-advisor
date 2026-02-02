from pydantic import BaseModel
from typing import Optional


class HistoricalDataPoint(BaseModel):
    date: str
    price: float


class StockFundamentals(BaseModel):
    price: float
    marketCap: float
    trailingPE: float
    forwardPE: float
    epsTrailingTwelveMonths: float
    priceToBook: float
    revenueGrowth: float
    profitMargins: float
    returnOnEquity: float
    dividendYield: float
    beta: float
    currency: str
    targetLowPrice: Optional[float] = None
    targetHighPrice: Optional[float] = None
    targetMeanPrice: Optional[float] = None
    recommendationKey: Optional[str] = None
    numberOfAnalystOpinions: Optional[int] = None
    longName: Optional[str] = None
    website: Optional[str] = None


class AnalysisRequest(BaseModel):
    ticker: str
    fundamentals: Optional[StockFundamentals] = None
    includeSearch: bool = False
    gemini_model: str = "gemini-2.5-flash-lite"
