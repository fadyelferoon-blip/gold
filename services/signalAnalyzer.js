const oandaService = require('./oandaService');

class SignalAnalyzer {

  async generateSignals() {
    try {
      const candles = await oandaService.getCandles('XAU_USD', 'M1', 500);

      if (!candles || candles.length === 0) return [];

      const signals = [];

      for (let i = 1; i < candles.length; i++) {
        const prev = candles[i - 1];
        const curr = candles[i];

        let type = null;

        // 🔥 Basic baseline logic (placeholder for real bot strategy)
        if (curr.close > curr.open && curr.close > prev.close) {
          type = 'CALL';
        }

        if (curr.close < curr.open && curr.close < prev.close) {
          type = 'PUT';
        }

        if (!type) continue;

        const time = new Date(curr.time);

        signals.push({
          pair: 'GOLD',
          type,
          time: time.toISOString().slice(11, 19),
          rawTime: curr.time,
          winrate: 100
        });
      }

      return signals;

    } catch (err) {
      console.error('Signal Analyzer Error:', err.message);
      return [];
    }
  }

  async getAllMergedSignals() {
    return this.generateSignals();
  }

}

module.exports = new SignalAnalyzer();
