
export const calculateSMA = (data: number[], period: number): (number | null)[] => {
  if (data.length < period) return data.map(() => null);

  const sma = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      sma.push(null);
      continue;
    }
    const slice = data.slice(i - period + 1, i + 1);
    const sum = slice.reduce((a, b) => a + b, 0);
    sma.push(sum / period);
  }
  return sma;
};

export const calculateRSI = (data: number[], period: number = 14): (number | null)[] => {
  if (data.length <= period) return data.map(() => null);

  const changes: number[] = [];
  for (let i = 1; i < data.length; i++) {
    changes.push(data[i] - data[i - 1]);
  }

  const rsi: (number | null)[] = Array(period).fill(null); // First 'period' points are null

  let gainSum = 0;
  let lossSum = 0;

  // First avg gain/loss (Simple Average)
  for (let i = 0; i < period; i++) {
    const change = changes[i];
    if (change > 0) gainSum += change;
    else lossSum += Math.abs(change);
  }

  let avgGain = gainSum / period;
  let avgLoss = lossSum / period;

  // First RSI
  let rs = avgGain / (avgLoss || 1);
  rsi.push(100 - (100 / (1 + rs)));

  // Subsequent RSI (Wilder's Smoothing)
  for (let i = period; i < changes.length; i++) {
    const change = changes[i];
    const currentGain = change > 0 ? change : 0;
    const currentLoss = change < 0 ? Math.abs(change) : 0;

    avgGain = ((avgGain * (period - 1)) + currentGain) / period;
    avgLoss = ((avgLoss * (period - 1)) + currentLoss) / period;

    rs = avgGain / (avgLoss || 1); // Avoid divide by zero
    rsi.push(100 - (100 / (1 + rs)));
  }

  return rsi;
};
