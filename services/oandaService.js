const axios = require('axios');

class OandaService {
  constructor() {
    this.baseUrl = 'https://api-fxpractice.oanda.com/v3';
    this.token = process.env.OANDA_TOKEN;

    this.cache = null;
    this.lastFetch = 0;
    this.cacheTime = 30 * 1000; // 30 seconds
  }

  async getCandles(instrument = 'XAU_USD', granularity = 'M1', count = 500) {
    try {
      const now = Date.now();

      // cache
      if (this.cache && (now - this.lastFetch) < this.cacheTime) {
        return this.cache;
      }

      const res = await axios.get(
        `${this.baseUrl}/instruments/${instrument}/candles`,
        {
          params: {
            granularity,
            count
          },
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        }
      );

      const candles = res.data.candles.map(c => ({
        time: c.time,
        open: parseFloat(c.mid.o),
        high: parseFloat(c.mid.h),
        low: parseFloat(c.mid.l),
        close: parseFloat(c.mid.c)
      }));

      this.cache = candles;
      this.lastFetch = now;

      return candles;

    } catch (err) {
      console.error('OANDA ERROR:', err.message);
      return [];
    }
  }
}

module.exports = new OandaService();
