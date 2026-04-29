const botScraper = require('./botScraper');

class SignalAnalyzer {
  constructor() {
    this.cache = {
      PUT: { signals: [], fetchedAt: null },
      CALL: { signals: [], fetchedAt: null }
    };

    this.isRefreshing = false;
    this.CACHE_DURATION = 3 * 60 * 60 * 1000; // 3 hours
  }

  isCacheValid(type) {
    const c = this.cache[type];
    return c.fetchedAt && c.signals.length > 0 &&
      (Date.now() - c.fetchedAt) < this.CACHE_DURATION;
  }

  isCacheReady() {
    return this.isCacheValid('PUT') && this.isCacheValid('CALL');
  }

  async generateSignals(type) {
    if (this.isCacheValid(type)) {
      console.log(`✅ Using cached ${type}`);
      return this.cache[type].signals;
    }

    console.log(`🔄 Fetching ${type} signals...`);

    try {
      const signals = await botScraper.scrapeSignals(type);

      this.cache[type] = {
        signals: signals.map(s => ({
          ...s,
          pairDisplay: 'GOLD'
        })),
        fetchedAt: Date.now()
      };

      return this.cache[type].signals;

    } catch (err) {
      console.error(`❌ Error ${type}:`, err.message);
      return [];
    }
  }

  async refreshAll() {
    if (this.isRefreshing) return;

    this.isRefreshing = true;

    await this.generateSignals('PUT');
    await new Promise(r => setTimeout(r, 1000));
    await this.generateSignals('CALL');

    this.isRefreshing = false;
  }

  startBackgroundRefresh() {
    setTimeout(() => this.refreshAll(), 5000);
    setInterval(() => this.refreshAll(), this.CACHE_DURATION);
  }

  // 🔥 NEW: single clean merge function
  getAllMergedSignals() {
    return [
      ...this.cache.PUT.signals,
      ...this.cache.CALL.signals
    ];
  }

  clearCache() {
    this.cache.PUT = { signals: [], fetchedAt: null };
    this.cache.CALL = { signals: [], fetchedAt: null };
  }
}

module.exports = new SignalAnalyzer();
