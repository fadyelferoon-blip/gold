const signalAnalyzer = require('../services/signalAnalyzer');
const timezoneConverter = require('../services/timezoneConverter');

exports.getUpcomingSignals = async (req, res) => {
  try {
    const userTimezone = req.query.timezone
      ? parseInt(req.query.timezone)
      : 2;

    const signals = await signalAnalyzer.getAllMergedSignals();

    if (!signals.length) {
      return res.json({
        success: false,
        message: 'No signals available'
      });
    }

    const upcoming = timezoneConverter.findNextSignal(
      signals,
      userTimezone
    );

    res.json({
      success: true,
      signals: upcoming.slice(0, 20),
      count: upcoming.length,
      userTimezone,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: 'Failed to get signals',
      error: err.message
    });
  }
};

exports.generateMXNSignals = async (req, res) => {
  try {
    const { uid, deviceId, timezone } = req.body;

    if (!uid || !deviceId) {
      return res.status(400).json({
        success: false,
        message: 'Missing uid or deviceId'
      });
    }

    const userTimezone = timezone ? parseInt(timezone) : 2;

    const signals = await signalAnalyzer.getAllMergedSignals();

    if (!signals.length) {
      return res.json({
        success: false,
        message: 'No signals available'
      });
    }

    const upcoming = timezoneConverter.findNextSignal(
      signals,
      userTimezone
    );

    const next = upcoming[0];

    if (!next) {
      return res.json({
        success: false,
        message: 'No valid signals'
      });
    }

    res.json({
      success: true,
      nextSignal: {
        pair: next.pair,
        type: next.type,
        time: next.localTime,
        originalTime: next.time,
        secondsUntil: next.secondsUntil,
        countdown: timezoneConverter.formatCountdown(next.secondsUntil)
      },
      upcomingSignals: upcoming.slice(0, 10),
      userTimezone,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};

exports.clearCache = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'No cache layer in new system (live candles mode)'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error'
    });
  }
};
