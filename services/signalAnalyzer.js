const botScraper = require('./botScraper');
const timezoneConverter = require('./timezoneConverter');

class SignalAnalyzer {
  constructor() {
    this.cache = {
      PUT:  { signals: [], fetchedAt: null },
      CALL: { signals: [], fetchedAt: null }
    };
    this.isRefreshing = false;
    this.CACHE_DURATION = 3 * 60 * 60 * 1000;
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
        signals: signals.map(s => ({ ...s, pairDisplay: 'GOLD' })),
        fetchedAt: Date.now()
      };

      // ✅ Log all fetched signals
      const bot = timezoneConverter.getCurrentBotTime();
      console.log(`\n📊 ===== ${type} SIGNALS (${signals.length} total) =====`);
      console.log(`⏰ Bot time now (UTC+6): ${bot.hour}:${String(bot.minute).padStart(2,'0')}:${String(bot.second).padStart(2,'0')}`);
      signals.forEach((s, i) => {
        const converted = timezoneConverter.convertToUserTime(s.time, 2);
        console.log(`  ${i+1}. Bot: ${s.time} → UTC+2: ${converted.localTime} | ${type}`);
      });
      console.log(`==========================================\n`);

      return this.cache[type].signals;

    } catch (err) {
      console.error(`❌ Error ${type}:`, err.message);
      return [];
    }
  }

  async refreshAll() {
    if (this.isRefreshing) return;
    this.isRefreshing = true;
    console.log('🔄 Starting refresh...');
    await this.generateSignals('PUT');
    await new Promise(r => setTimeout(r, 1000));
    await this.generateSignals('CALL');
    this.isRefreshing = false;

    // ✅ Log next upcoming signals after refresh
    const all = this.getAllMergedSignals();
    const upcoming = timezoneConverter.findNextSignal(all, 2);
    console.log(`\n🎯 ===== NEXT UPCOMING SIGNALS (UTC+2) =====`);
    upcoming.slice(0, 10).forEach((s, i) => {
      console.log(`  ${i+1}. ${s.type} @ ${s.localTime} — in ${s.minutesUntil}min`);
    });
    console.log(`==========================================\n`);
  }

  startBackgroundRefresh() {
    setTimeout(() => this.refreshAll(), 5000);
    setInterval(() => this.refreshAll(), this.CACHE_DURATION);
    console.log('⏰ Refresh every 3h');
  }

  getAllMergedSignals() {
    return [
      ...this.cache.PUT.signals,
      ...this.cache.CALL.signals
    ];
  }

  clearCache() {
    this.cache.PUT  = { signals: [], fetchedAt: null };
    this.cache.CALL = { signals: [], fetchedAt: null };
    console.log('🗑️ Cache cleared');
  }
}

module.exports = new SignalAnalyzer();
