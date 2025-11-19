
import React, { useState, useEffect, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ComposedChart, Bar, Line } from 'recharts';
import { fetchStockDetails, fetchStockNews, NewsItem } from '../services/geminiService';
import { Loader2, Wifi, Newspaper, ExternalLink, BarChart2, Activity, TrendingUp } from 'lucide-react';
import { format, subDays, subMonths, subYears } from 'date-fns';

interface StockChartProps {
  symbol: string;
}

type ChartType = 'area' | 'line' | 'candle';
type TimeRange = '1D' | '1W' | '1M' | '6M' | '1Y';

// Custom Shape for Candlestick
const CandleStickShape = (props: any) => {
  const { x, y, width, height, payload } = props;
  const { open, close, high, low } = payload;
  
  const isUp = close >= open;
  const color = isUp ? '#10b981' : '#ef4444';
  
  // Calculate wick positions using interpolation based on the bar's height and value range.
  // This avoids relying on `yAxis.scale` which may be undefined in some contexts.
  
  const bodyMax = Math.max(open, close);
  const bodyMin = Math.min(open, close);
  const bodyRange = bodyMax - bodyMin;
  
  let yHigh = y;
  let yLow = y + height;

  // Only calculate wicks if the body has a valid range to derive scale
  if (bodyRange > 0) {
      const pixelsPerUnit = height / bodyRange;
      
      // Calculate High Wick Y (Top)
      // high - bodyMax is the value difference above the body
      const highDiff = high - bodyMax;
      yHigh = y - (highDiff * pixelsPerUnit);

      // Calculate Low Wick Y (Bottom)
      // bodyMin - low is the value difference below the body
      const lowDiff = bodyMin - low;
      yLow = (y + height) + (lowDiff * pixelsPerUnit);
  }

  // Center the wick
  const wickX = x + width / 2;

  return (
    <g>
      {/* Wick */}
      <line x1={wickX} y1={yHigh} x2={wickX} y2={yLow} stroke={color} strokeWidth={1} />
      {/* Body */}
      <rect x={x} y={y} width={width} height={Math.max(height, 1)} fill={color} />
    </g>
  );
};

export const StockChart: React.FC<StockChartProps> = ({ symbol }) => {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [changePercent, setChangePercent] = useState(0);
  const [currency, setCurrency] = useState('INR');
  const [news, setNews] = useState<NewsItem[]>([]);
  
  // UI State
  const [timeRange, setTimeRange] = useState<TimeRange>('1D');
  const [chartType, setChartType] = useState<ChartType>('area');

  // Helper to generate data based on range
  const generateData = (range: TimeRange, targetPrice: number, dailyChangePercent: number) => {
     const data = [];
     let points = 0;
     let intervalMinutes = 0;
     let startDate = new Date();
     let volatility = 0;

     switch (range) {
        case '1D':
            points = 40;
            intervalMinutes = 10; // 10 min candles
            startDate.setHours(9, 15, 0, 0); // Market open
            volatility = 0.002; // Low volatility intraday
            break;
        case '1W':
            points = 35; // 5 days * 7 hours approx
            startDate = subDays(new Date(), 7);
            intervalMinutes = 60; // Hourly
            volatility = 0.008;
            break;
        case '1M':
            points = 30;
            startDate = subDays(new Date(), 30);
            intervalMinutes = 24 * 60; // Daily
            volatility = 0.015;
            break;
        case '6M':
            points = 26; // Weeks
            startDate = subMonths(new Date(), 6);
            intervalMinutes = 7 * 24 * 60; // Weekly
            volatility = 0.03;
            break;
        case '1Y':
            points = 52; // Weeks
            startDate = subYears(new Date(), 1);
            intervalMinutes = 7 * 24 * 60; // Weekly
            volatility = 0.04;
            break;
     }

     // For 1D, we use the anchor logic from before to match current price exactly
     // For others, we walk BACKWARDS from current price to generate history
     
     let currentBase = targetPrice;
     
     // We generate points in reverse order (latest to oldest) then reverse array
     for (let i = 0; i < points; i++) {
        // Simulate Open, High, Low, Close
        const close = currentBase;
        // Random movement for previous close
        const change = (Math.random() - 0.5) * volatility * currentBase;
        const prevClose = close - change;
        
        // For the candle
        const open = prevClose; 
        // High/Low with some noise
        // Ensure High is >= Max(Open, Close) and Low is <= Min(Open, Close)
        const maxBody = Math.max(open, close);
        const minBody = Math.min(open, close);
        
        const high = maxBody * (1 + Math.random() * volatility * 0.5);
        const low = minBody * (1 - Math.random() * volatility * 0.5);

        // Time label
        let timeLabel = '';
        const pointDate = new Date();
        
        if (range === '1D') {
             // Intraday time calculation relative to end of day
             // We'll just cheat and map 0..points to 9:15 -> 3:30
             const totalMinutes = 9 * 60 + 15 + ((points - 1 - i) * 10);
             const h = Math.floor(totalMinutes / 60);
             const m = totalMinutes % 60;
             timeLabel = `${h}:${m.toString().padStart(2, '0')}`;
        } else {
             // Historical dates
             const d = new Date();
             if (range === '1W') d.setHours(d.getHours() - i); // Rough approximation
             else if (range === '1M') d.setDate(d.getDate() - i);
             else if (range === '6M') d.setDate(d.getDate() - (i * 7));
             else if (range === '1Y') d.setDate(d.getDate() - (i * 7));
             
             timeLabel = format(d, range === '1W' ? 'dd MMM' : 'MMM dd');
        }

        data.unshift({
            time: timeLabel,
            price: parseFloat(close.toFixed(2)), // For Line/Area
            open: parseFloat(open.toFixed(2)),
            close: parseFloat(close.toFixed(2)),
            high: parseFloat(high.toFixed(2)),
            low: parseFloat(low.toFixed(2)),
            // For Recharts Bar (Candle Body)
            body: [Math.min(open, close), Math.max(open, close)] 
        });

        currentBase = prevClose;
     }

     return data;
  };

  // Initial Data Fetch
  useEffect(() => {
    let mounted = true;
    
    const initData = async () => {
        // Only fetch external data if we don't have price yet or if symbol changed
        // We don't re-fetch API on timeRange change, we just re-simulate based on cached price
        if (currentPrice === 0) {
            setLoading(true);
            const [realData, newsData] = await Promise.all([
                fetchStockDetails(symbol),
                fetchStockNews(symbol)
            ]);
            
            if (!mounted) return;

            if (realData) {
                setCurrentPrice(realData.price);
                setChangePercent(realData.changePercent);
                setCurrency(realData.currency);
            } else {
                // Fallback
                const mockPrice = 1000 + Math.random() * 500;
                setCurrentPrice(mockPrice);
                setChangePercent((Math.random() * 4) - 2);
            }
            setNews(newsData);
            setLoading(false);
        }
    };

    initData();

    return () => { mounted = false; };
  }, [symbol]);

  // Re-generate chart data when TimeRange or Price changes
  useEffect(() => {
      if (currentPrice > 0) {
          const newData = generateData(timeRange, currentPrice, changePercent);
          setChartData(newData);
      }
  }, [timeRange, currentPrice, changePercent]);

  // Live Simulation Timer (Only for 1D view)
  useEffect(() => {
     if (loading || chartData.length === 0 || timeRange !== '1D') return;

     const interval = setInterval(() => {
        setChartData(prev => {
            const last = prev[prev.length - 1];
            const volatility = last.price * 0.0005;
            const movement = (Math.random() - 0.5) * 2 * volatility;
            const newPrice = last.price + movement;
            
            setCurrentPrice(parseFloat(newPrice.toFixed(2)));
            
            const newData = [...prev];
            // Generate new OHLC for the updated live candle
            const newOpen = last.open; // Keep open same for this "tick" simulation
            const newClose = newPrice;
            const newHigh = Math.max(last.high, newClose);
            const newLow = Math.min(last.low, newClose);

            newData[newData.length - 1] = {
                ...last,
                price: parseFloat(newClose.toFixed(2)),
                close: parseFloat(newClose.toFixed(2)),
                high: parseFloat(newHigh.toFixed(2)),
                low: parseFloat(newLow.toFixed(2)),
                body: [Math.min(newOpen, newClose), Math.max(newOpen, newClose)]
            };
            return newData;
        });
     }, 2000);

     return () => clearInterval(interval);
  }, [loading, timeRange]);

  const isPositive = changePercent >= 0;
  const trendColor = isPositive ? '#10b981' : '#ef4444'; 

  if (loading) {
      return (
          <div className="mt-4 border border-slate-200 rounded-xl p-8 bg-white shadow-sm flex justify-center items-center space-x-2 text-slate-400">
              <Loader2 className="animate-spin" size={20} />
              <span className="text-sm font-medium">Fetching market data...</span>
          </div>
      );
  }

  // Calculate min/max for Y-Axis domain
  const minPrice = Math.min(...chartData.map(d => d.low));
  const maxPrice = Math.max(...chartData.map(d => d.high));
  const domainPadding = (maxPrice - minPrice) * 0.1;

  return (
    <div className="mt-4 border border-slate-200 rounded-xl p-4 bg-white shadow-sm select-none transition-all hover:shadow-md group">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
           <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-900 text-lg tracking-tight">{symbol.replace('$','')}</span>
              <span className={`text-xs font-bold px-2 py-1 rounded-full flex items-center ${isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                {isPositive ? '▲' : '▼'} {Math.abs(changePercent).toFixed(2)}%
              </span>
           </div>
           <div className="flex items-center space-x-2 mt-1">
             <span className="text-xs text-slate-500 font-medium">NSE • {currency}</span>
             {timeRange === '1D' && (
                <span className="flex items-center space-x-1 text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded border border-red-100 animate-pulse">
                    <Wifi size={10} />
                    <span>LIVE</span>
                </span>
             )}
           </div>
        </div>
        
        <div className="flex flex-col items-end space-y-2">
            <div className="text-right">
                <div className="font-bold text-xl text-slate-900 transition-all duration-300">
                    {currency === 'INR' ? '₹' : '$'}{currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
            </div>
            {/* Chart Type Toggles */}
            <div className="flex bg-slate-100 rounded-lg p-0.5">
                <button 
                    onClick={() => setChartType('area')}
                    className={`p-1 rounded-md transition-all ${chartType === 'area' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    title="Area Chart"
                >
                    <Activity size={14} />
                </button>
                <button 
                    onClick={() => setChartType('line')}
                    className={`p-1 rounded-md transition-all ${chartType === 'line' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    title="Line Chart"
                >
                    <TrendingUp size={14} />
                </button>
                <button 
                    onClick={() => setChartType('candle')}
                    className={`p-1 rounded-md transition-all ${chartType === 'candle' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    title="Candlestick Chart"
                >
                    <BarChart2 size={14} />
                </button>
            </div>
        </div>
      </div>
      
      {/* Chart Area */}
      <div className="h-56 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`gradient-${symbol}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={trendColor} stopOpacity={0.2}/>
                <stop offset="95%" stopColor={trendColor} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
                dataKey="time" 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 10, fill: '#94a3b8'}}
                interval={Math.floor(chartData.length / 5)}
                dy={10}
            />
            <YAxis 
                domain={[minPrice - domainPadding, maxPrice + domainPadding]} 
                hide={true}
            />
            <Tooltip 
                contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    padding: '8px 12px'
                }}
                itemStyle={{ color: '#1e293b', fontWeight: 600, fontSize: '14px' }}
                labelStyle={{ color: '#64748b', fontSize: '12px', marginBottom: '4px' }}
                cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            
            {/* Conditional Rendering based on Chart Type */}
            {chartType === 'area' && (
                <Area 
                    type="monotone" 
                    dataKey="price" 
                    stroke={trendColor} 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill={`url(#gradient-${symbol})`} 
                    activeDot={{ r: 4, strokeWidth: 0, fill: trendColor }}
                    isAnimationActive={true}
                />
            )}
            {chartType === 'line' && (
                <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke={trendColor} 
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 0, fill: trendColor }}
                />
            )}
            {chartType === 'candle' && (
                <Bar 
                    dataKey="body" 
                    shape={<CandleStickShape />} 
                    isAnimationActive={false} // Candles look weird animating
                />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      
      {/* Footer Controls */}
      <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-100">
         <div className="flex space-x-2">
             {(['1D', '1W', '1M', '6M', '1Y'] as TimeRange[]).map((period) => (
                 <button 
                    key={period} 
                    onClick={() => setTimeRange(period)}
                    className={`text-xs font-medium px-3 py-1 rounded-md transition-colors ${
                        timeRange === period 
                        ? 'bg-indigo-50 text-indigo-600 font-bold' 
                        : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                    }`}
                 >
                    {period}
                 </button>
             ))}
         </div>
         <button className="text-xs font-semibold text-indigo-600 hover:underline flex items-center">
            Full Analysis <ExternalLink size={12} className="ml-1"/>
         </button>
      </div>

      {/* News Widget */}
      {news.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-100 animate-fade-in bg-slate-50/50 -mx-4 -mb-4 px-4 py-3 rounded-b-xl">
            <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Newspaper size={12} className="text-indigo-500" />
                    <span>Relevant News</span>
                </span>
            </div>
            <div className="space-y-2.5">
                {news.map((item, idx) => (
                    <a key={idx} href={item.url} target="_blank" rel="noreferrer" className="flex justify-between items-start group/news cursor-pointer hover:bg-white hover:shadow-sm p-1.5 -mx-1.5 rounded-lg transition-all">
                        <div className="flex-1 pr-3">
                            <p className="text-xs font-medium text-slate-700 group-hover/news:text-indigo-600 leading-snug line-clamp-2">{item.title}</p>
                            <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                                <span>{item.source}</span>
                                <span className="w-0.5 h-0.5 bg-slate-300 rounded-full"></span>
                                <span>{item.timeAgo}</span>
                            </p>
                        </div>
                        <ExternalLink size={12} className="text-slate-300 group-hover/news:text-indigo-400 mt-0.5 flex-shrink-0 opacity-0 group-hover/news:opacity-100 transition-opacity"/>
                    </a>
                ))}
            </div>
        </div>
      )}
    </div>
  );
};
