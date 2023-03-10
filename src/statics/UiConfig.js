const CONFIG = {
  headless: false,
  api: {
    host: "127.0.0.1",
    port: 3000,
    timeout: 10 * 60 * 1000 // 10 minutes
  },
  ui: {
    ssl: false,
    host: "127.0.0.1",
    port: 3000,
    path: "/"
  },
  adapter: "sqlite",
  
  userChartConfig: {
    //patterns:['hasInvertedHammer']
    indicators: [
      "macd",
      "macdSignal",
      "macdHistogram",
      "mystdev",
      "dmPlus",
      "dmLow",
      "momentum"
    ]
    //overlays: []
  }
};

if (typeof window === "undefined") module.exports = CONFIG;
else window.CONFIG = CONFIG;
