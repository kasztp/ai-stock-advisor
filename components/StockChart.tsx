
import React, { useState, useMemo } from 'react';
import { HistoricalDataPoint } from '../types';
import { calculateSMA, calculateRSI } from '../utils/technicalAnalysis';

interface StockChartProps {
  data: HistoricalDataPoint[];
  color?: string;
  source?: string;
}

type TimeRange = '1M' | '3M' | '6M' | '1Y' | '2Y' | '5Y';

const StockChart: React.FC<StockChartProps> = ({ data, color = '#22d3ee', source }) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('1Y');
  
  // Indicator Toggles
  const [showSMA50, setShowSMA50] = useState(false);
  const [showSMA200, setShowSMA200] = useState(false);
  const [showRSI, setShowRSI] = useState(false);

  // Chart dimensions
  const width = 800;
  const height = 450;
  const padding = 50; 

  // 1. Sort data once (Must use full dataset for accurate technical analysis)
  const sortedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [data]);

  // 2. Calculate indicators on the FULL dataset first.
  // This fixes the issue where slicing data first causes SMAs to return null.
  const fullIndicators = useMemo(() => {
    if (sortedData.length === 0) return { sma50: [], sma200: [], rsi: [] };
    
    const prices = sortedData.map(d => d.price);
    return {
        sma50: calculateSMA(prices, 50),
        sma200: calculateSMA(prices, 200),
        rsi: calculateRSI(prices, 14)
    };
  }, [sortedData]);

  // 3. Filter Data & Indicators together based on TimeRange
  const processedData = useMemo(() => {
    if (sortedData.length === 0) return null;
    
    const now = new Date(sortedData[sortedData.length - 1].date);
    let cutoffDate = new Date(now);
    switch(timeRange) {
        case '1M': cutoffDate.setMonth(now.getMonth() - 1); break;
        case '3M': cutoffDate.setMonth(now.getMonth() - 3); break;
        case '6M': cutoffDate.setMonth(now.getMonth() - 6); break;
        case '1Y': cutoffDate.setFullYear(now.getFullYear() - 1); break;
        case '2Y': cutoffDate.setFullYear(now.getFullYear() - 2); break;
        case '5Y': cutoffDate.setFullYear(now.getFullYear() - 5); break;
        default: cutoffDate.setFullYear(now.getFullYear() - 1); break;
    }

    // Find the starting index for the visible window
    const startIndex = sortedData.findIndex(d => new Date(d.date) >= cutoffDate);
    // If startIndex is -1 (data not found) or 0 (use all data), handle accordingly
    const effectiveStartIndex = startIndex === -1 ? 0 : startIndex;

    // Slice the data and the indicators to match the view
    const filteredPoints = sortedData.slice(effectiveStartIndex);
    const visibleSMA50 = fullIndicators.sma50.slice(effectiveStartIndex);
    const visibleSMA200 = fullIndicators.sma200.slice(effectiveStartIndex);
    const visibleRSI = fullIndicators.rsi.slice(effectiveStartIndex);

    if (filteredPoints.length < 2) return null;

    const prices = filteredPoints.map(d => d.price);
    
    // Determine Price Y-Axis Scale (Left Axis)
    let minPrice = Math.min(...prices);
    let maxPrice = Math.max(...prices);

    // If SMAs are shown, include them in the Price scale auto-zoom
    if (showSMA50) {
        const valid = visibleSMA50.filter(v => v !== null) as number[];
        if(valid.length) {
            minPrice = Math.min(minPrice, ...valid);
            maxPrice = Math.max(maxPrice, ...valid);
        }
    }
    if (showSMA200) {
        const valid = visibleSMA200.filter(v => v !== null) as number[];
        if(valid.length) {
            minPrice = Math.min(minPrice, ...valid);
            maxPrice = Math.max(maxPrice, ...valid);
        }
    }
    
    // Add buffer to Price Scale
    const priceRange = maxPrice - minPrice;
    const paddedMinPrice = Math.max(0, minPrice - priceRange * 0.1);
    const paddedMaxPrice = maxPrice + priceRange * 0.1;
    const effectivePriceRange = paddedMaxPrice - paddedMinPrice;

    // Chart Area Dimensions
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;

    const points = filteredPoints.map((d, i) => {
      const x = padding + (i / (filteredPoints.length - 1)) * chartWidth;
      
      // Price Y (Left Axis)
      const y = height - padding - ((d.price - paddedMinPrice) / (effectivePriceRange || 1)) * chartHeight;
      
      // SMA Ys (Left Axis)
      const sma50Val = visibleSMA50[i];
      const ySMA50 = sma50Val !== null 
          ? height - padding - ((sma50Val - paddedMinPrice) / (effectivePriceRange || 1)) * chartHeight
          : null;

      const sma200Val = visibleSMA200[i];
      const ySMA200 = sma200Val !== null 
          ? height - padding - ((sma200Val - paddedMinPrice) / (effectivePriceRange || 1)) * chartHeight
          : null;
          
      // RSI Y (Right Axis, Fixed 0-100 scale)
      const rsiVal = visibleRSI[i];
      const yRSI = rsiVal !== null
          ? height - padding - (rsiVal / 100) * chartHeight
          : null;

      return { x, y, ...d, ySMA50, ySMA200, yRSI, rsiVal, sma50Val, sma200Val };
    });

    return { minPrice: paddedMinPrice, maxPrice: paddedMaxPrice, points };
  }, [sortedData, fullIndicators, timeRange, showSMA50, showSMA200]); // showRSI affects rendering, not data scaling for price

  if (!processedData) return (
    <div className="bg-gray-800/50 p-6 rounded-xl shadow-lg border border-gray-700">
         <h3 className="text-xl font-bold text-white mb-4">Price History</h3>
         <div className="text-gray-400 text-center py-10">Loading chart data...</div>
    </div>
  );

  // Helpers for SVG paths
  const generatePath = (pts: typeof processedData.points, key: 'y' | 'ySMA50' | 'ySMA200' | 'yRSI') => {
      return pts
        .filter(p => p[key] !== null)
        .map((p, i) => {
            // If it's NOT the very first point in the array, but it IS the first valid point for this line, use M
            // Actually, we should just check if we have started drawing. 
            // But since we filter nulls, 'i' here is the index in the filtered array.
            // So i===0 is always the start of the path.
            const command = i === 0 ? 'M' : 'L';
            return `${command} ${p.x},${p[key]}`;
        })
        .join(' ');
  };

  const pointsString = processedData.points.map(p => `${p.x},${p.y}`).join(' ');
  const areaPath = `${pointsString} ${processedData.points[processedData.points.length-1].x},${height - padding} ${padding},${height - padding}`;
  
  const sma50Path = generatePath(processedData.points, 'ySMA50');
  const sma200Path = generatePath(processedData.points, 'ySMA200');
  const rsiPath = generatePath(processedData.points, 'yRSI');

  // Logic for Legend / Status Line
  const lastPoint = processedData.points[processedData.points.length - 1];
  const activePoint = hoverIndex !== null ? processedData.points[hoverIndex] : lastPoint;

  // RSI Guide lines (30/70)
  const chartHeight = height - 2 * padding;
  const yRSI70 = height - padding - (70 / 100) * chartHeight;
  const yRSI30 = height - padding - (30 / 100) * chartHeight;

  return (
    <div className="bg-gray-800/50 p-6 rounded-xl shadow-lg border border-gray-700">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
             <h3 className="text-xl font-bold text-white">Technical Analysis</h3>
             
             <div className="flex flex-wrap gap-4 items-center">
                 {/* Indicators */}
                 <div className="flex gap-3 bg-gray-900/50 p-1.5 rounded-lg border border-gray-700">
                     <label className="flex items-center space-x-2 text-xs text-gray-300 cursor-pointer select-none hover:text-white">
                         <input type="checkbox" checked={showSMA50} onChange={e => setShowSMA50(e.target.checked)} className="rounded bg-gray-700 border-gray-600 text-orange-500 focus:ring-0 focus:ring-offset-0" />
                         <span className={showSMA50 ? "text-orange-500 font-bold" : ""}>SMA 50</span>
                     </label>
                     <label className="flex items-center space-x-2 text-xs text-gray-300 cursor-pointer select-none hover:text-white">
                         <input type="checkbox" checked={showSMA200} onChange={e => setShowSMA200(e.target.checked)} className="rounded bg-gray-700 border-gray-600 text-purple-500 focus:ring-0 focus:ring-offset-0" />
                         <span className={showSMA200 ? "text-purple-500 font-bold" : ""}>SMA 200</span>
                     </label>
                     <label className="flex items-center space-x-2 text-xs text-gray-300 cursor-pointer select-none hover:text-white">
                         <input type="checkbox" checked={showRSI} onChange={e => setShowRSI(e.target.checked)} className="rounded bg-gray-700 border-gray-600 text-yellow-400 focus:ring-0 focus:ring-offset-0" />
                         <span className={showRSI ? "text-yellow-400 font-bold" : ""}>RSI (Overlay)</span>
                     </label>
                 </div>

                 {/* Time Range */}
                 <div className="flex bg-gray-700/50 rounded-lg p-1">
                    {(['1M', '3M', '6M', '1Y', '2Y', '5Y'] as TimeRange[]).map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                                timeRange === range 
                                ? 'bg-cyan-600 text-white shadow' 
                                : 'text-gray-400 hover:text-white hover:bg-gray-600'
                            }`}
                        >
                            {range}
                        </button>
                    ))}
                 </div>
             </div>
        </div>
        
        <div className="w-full aspect-[16/9] relative select-none group">
            {/* DYNAMIC LEGEND OVERLAY */}
            <div className="absolute top-2 left-12 z-20 text-xs font-mono pointer-events-none flex flex-wrap gap-4 bg-gray-900/80 backdrop-blur-sm px-3 py-1.5 rounded border border-gray-700/50 shadow-lg">
                <span className="text-gray-400">{activePoint.date}</span>
                <span className="text-white font-bold border-b-2 border-cyan-400">Price: ${activePoint.price.toFixed(2)}</span>
                {showSMA50 && (
                    <span className="text-orange-500 font-bold border-b-2 border-orange-500">
                        SMA50: {activePoint.sma50Val ? activePoint.sma50Val.toFixed(2) : 'N/A'}
                    </span>
                )}
                {showSMA200 && (
                    <span className="text-purple-500 font-bold border-b-2 border-purple-500">
                        SMA200: {activePoint.sma200Val ? activePoint.sma200Val.toFixed(2) : 'N/A'}
                    </span>
                )}
                {showRSI && (
                    <span className="text-yellow-400 font-bold border-b-2 border-yellow-400">
                        RSI: {activePoint.rsiVal ? activePoint.rsiVal.toFixed(1) : 'N/A'}
                    </span>
                )}
            </div>

            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                <defs>
                    <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.2" />
                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                    </linearGradient>
                    <clipPath id="chartArea">
                         <rect x={padding} y={padding} width={width - 2*padding} height={height - 2*padding} />
                    </clipPath>
                </defs>

                {/* Grid Lines */}
                <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#374151" strokeDasharray="4" />
                <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#374151" strokeDasharray="4" />

                {/* LEFT Y Axis (Price) */}
                <text x={padding - 10} y={padding} fill="#9ca3af" fontSize="11" textAnchor="end" alignmentBaseline="middle">
                    ${processedData.maxPrice.toFixed(0)}
                </text>
                <text x={padding - 10} y={height - padding} fill="#9ca3af" fontSize="11" textAnchor="end" alignmentBaseline="middle">
                    ${processedData.minPrice.toFixed(0)}
                </text>
                
                {/* RIGHT Y Axis (RSI) - Only if RSI is active */}
                {showRSI && (
                    <g>
                         <line x1={width-padding} y1={padding} x2={width-padding} y2={height-padding} stroke="#4b5563" />
                         <text x={width - padding + 5} y={padding} fill="#facc15" fontSize="10" textAnchor="start" alignmentBaseline="middle">100</text>
                         <text x={width - padding + 5} y={yRSI70} fill="#facc15" fontSize="10" textAnchor="start" alignmentBaseline="middle">70</text>
                         <text x={width - padding + 5} y={yRSI30} fill="#facc15" fontSize="10" textAnchor="start" alignmentBaseline="middle">30</text>
                         <text x={width - padding + 5} y={height - padding} fill="#facc15" fontSize="10" textAnchor="start" alignmentBaseline="middle">0</text>
                         
                         {/* Dotted lines for RSI levels across chart */}
                         <line x1={padding} y1={yRSI70} x2={width - padding} y2={yRSI70} stroke="#facc15" strokeOpacity="0.2" strokeDasharray="2" />
                         <line x1={padding} y1={yRSI30} x2={width - padding} y2={yRSI30} stroke="#facc15" strokeOpacity="0.2" strokeDasharray="2" />
                    </g>
                )}

                {/* Main Chart Content */}
                <g clipPath="url(#chartArea)">
                    {/* Price Area & Line */}
                    <polygon points={areaPath} fill="url(#chartGradient)" />
                    <polyline points={pointsString} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    
                    {/* SMAs (Orange & Purple) - CHANGED FROM POLYLINE TO PATH */}
                    {showSMA50 && <path d={sma50Path} fill="none" stroke="#f97316" strokeWidth="2" strokeDasharray="5,2" />}
                    {showSMA200 && <path d={sma200Path} fill="none" stroke="#a855f7" strokeWidth="2" strokeDasharray="5,2" />}

                    {/* RSI (Yellow) - CHANGED FROM POLYLINE TO PATH */}
                    {showRSI && <path d={rsiPath} fill="none" stroke="#facc15" strokeWidth="2" />}
                </g>


                {/* X Axis Date Labels */}
                <text x={padding} y={height - 15} fill="#9ca3af" fontSize="11" textAnchor="start">
                    {processedData.points[0].date}
                </text>
                <text x={width - padding} y={height - 15} fill="#9ca3af" fontSize="11" textAnchor="end">
                    {processedData.points[processedData.points.length - 1].date}
                </text>


                {/* Interactive Overlay (Columns) */}
                {processedData.points.map((point, index) => {
                     const colWidth = (width - 2 * padding) / (processedData.points.length - 1);
                     return (
                        <rect
                            key={`hit-${index}`}
                            x={point.x - colWidth / 2}
                            y={0}
                            width={Math.max(colWidth, 4)} 
                            height={height}
                            fill="transparent"
                            onMouseEnter={() => setHoverIndex(index)}
                            onMouseLeave={() => setHoverIndex(null)}
                            className="cursor-crosshair"
                        />
                     );
                })}

                {/* Active Cursor Elements */}
                {hoverIndex !== null && (
                    <g pointerEvents="none">
                        {/* Vertical Cursor Line */}
                        <line 
                            x1={activePoint.x} y1={padding} 
                            x2={activePoint.x} y2={height - padding} 
                            stroke="#4b5563" strokeDasharray="4" 
                        />
                        
                        {/* Horizontal Crosshair for Price */}
                        <line 
                            x1={padding} y1={activePoint.y} 
                            x2={width - padding} y2={activePoint.y} 
                            stroke="#4b5563" strokeDasharray="4" 
                        />

                        {/* Price Dot */}
                        <circle cx={activePoint.x} cy={activePoint.y} r="4" fill={color} stroke="white" strokeWidth="2" />
                        
                        {/* SMA Dots */}
                        {showSMA50 && activePoint.ySMA50 && (
                            <circle cx={activePoint.x} cy={activePoint.ySMA50} r="3" fill="#f97316" stroke="white" strokeWidth="1" />
                        )}
                         {showSMA200 && activePoint.ySMA200 && (
                            <circle cx={activePoint.x} cy={activePoint.ySMA200} r="3" fill="#a855f7" stroke="white" strokeWidth="1" />
                        )}
                        {/* RSI Dot */}
                         {showRSI && activePoint.yRSI && (
                            <circle cx={activePoint.x} cy={activePoint.yRSI} r="3" fill="#facc15" stroke="white" strokeWidth="1" />
                        )}

                        {/* Tooltip Box */}
                        <g transform={`translate(${Math.min(Math.max(activePoint.x - 80, 0), width - 160)}, ${Math.max(activePoint.y - 80, 10)})`}>
                            <rect width="160" height="70" rx="4" fill="#111827" stroke="#374151" className="shadow-xl opacity-95" />
                            <text x="80" y="20" fill="#9ca3af" fontSize="11" textAnchor="middle" fontWeight="bold">{activePoint.date}</text>
                            <text x="80" y="40" fill="white" fontSize="16" fontWeight="bold" textAnchor="middle">
                                ${activePoint.price.toFixed(2)}
                            </text>
                            <text x="80" y="58" fill="#facc15" fontSize="10" textAnchor="middle">
                                {showRSI ? `RSI: ${activePoint.rsiVal?.toFixed(1)}` : ''}
                            </text>
                        </g>
                    </g>
                )}
            </svg>
        </div>
        {source && (
            <div className="mt-2 text-right">
                <p className="text-xs text-gray-500">Data Source: {source}</p>
            </div>
        )}
    </div>
  );
};

export default StockChart;
