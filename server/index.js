/*
 * @Author: Liu XiaoBao liuxiaobao@everimaging.com
 * @Date: 2026-03-10 16:32:20
 * @LastEditors: Liu XiaoBao liuxiaobao@everimaging.com
 * @LastEditTime: 2026-03-10 16:46:59
 * @FilePath: \web3-test\server\index.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const { WebSocketServer } = require("ws");
const BigNumber = require("bignumber.js");

// ─── BigNumber 全局配置 ───────────────────────────────────────────────────────
BigNumber.config({
  DECIMAL_PLACES: 20,
  ROUNDING_MODE: BigNumber.ROUND_DOWN,
  EXPONENTIAL_AT: [-20, 20],
});

/** 快捷构造：将任意值转为 BigNumber */
const BN = (n) => new BigNumber(n);

/** 从 Math.random() 生成 BN（random 本身精度无要求，仅作随机因子） */
const BNRand = () => BN(Math.random());

/** 精确格式化为 number（供 lightweight-charts 使用的 OHLCV 数值） */
const fmtNum = (bn, decimals) =>
  parseFloat(bn.toFixed(decimals, BigNumber.ROUND_DOWN));

/** 精确格式化为 string（供订单簿、Ticker 字段使用） */
const fmtStr = (bn, decimals) => bn.toFixed(decimals, BigNumber.ROUND_DOWN);

const PORT = 4000;

// ─── 各币种配置（价格字符串避免 JS 浮点精度问题）───────────────────────────────
const MARKETS_CONFIG = {
  BTCUSDT: {
    basePrice: "65000",
    priceDecimals: 2,
    qtyDecimals: 5,
    volatility: "0.0008",
  },
  ETHUSDT: {
    basePrice: "3200",
    priceDecimals: 2,
    qtyDecimals: 4,
    volatility: "0.001",
  },
  BNBUSDT: {
    basePrice: "580",
    priceDecimals: 2,
    qtyDecimals: 3,
    volatility: "0.001",
  },
  SOLUSDT: {
    basePrice: "140",
    priceDecimals: 3,
    qtyDecimals: 2,
    volatility: "0.0015",
  },
  XRPUSDT: {
    basePrice: "0.52",
    priceDecimals: 5,
    qtyDecimals: 4,
    volatility: "0.002",
  },
  DOGEUSDT: {
    basePrice: "0.12",
    priceDecimals: 5,
    qtyDecimals: 4,
    volatility: "0.0025",
  },
  ADAUSDT: {
    basePrice: "0.45",
    priceDecimals: 5,
    qtyDecimals: 4,
    volatility: "0.002",
  },
  TRXUSDT: {
    basePrice: "0.11",
    priceDecimals: 5,
    qtyDecimals: 4,
    volatility: "0.002",
  },
};

// ─── 模拟市场类 ───────────────────────────────────────────────────────────────
class MockMarket {
  constructor(symbol, config) {
    this.symbol = symbol;
    this.config = config;
    const base = BN(config.basePrice);
    const vol = BN(config.volatility);

    // 所有内部价格均为 BigNumber，确保精度
    this.price = base.times(BN(1).plus(BNRand().minus("0.5").times("0.05")));
    this.openPrice24h = this.price.times(
      BN(1).plus(BNRand().minus("0.5").times("0.08"))
    );
    this.high24h = this.price.times(BN(1).plus(BNRand().times("0.03")));
    this.low24h = this.price.times(BN(1).minus(BNRand().times("0.03")));
    this.volume24h = BNRand().times("5000").plus("1000");
    this.quoteVolume24h = this.volume24h.times(this.price);
    this.tradeCount = 0;

    // 当前 K 线（BigNumber 存储）
    this.candleTime = this._currentMinute();
    this.candleOpen = this.price;
    this.candleHigh = this.price;
    this.candleLow = this.price;
    this.candleClose = this.price;
    this.candleVolume = BN("0");

    // 生成 200 根历史 K 线
    this.history = this._generateHistory(200);
  }

  _currentMinute() {
    // 返回当前分钟的 Unix 秒时间戳（整数）
    return Math.floor(Date.now() / 1000 / 60) * 60;
  }

  _generateHistory(count) {
    const { priceDecimals, qtyDecimals, volatility, basePrice } = this.config;
    const vol = BN(volatility);
    const base = BN(basePrice);

    const candles = [];
    let time = this._currentMinute() - count * 60;
    // 历史起始价在当前价格 ±15% 随机偏移
    let price = this.price.times(
      BN(1).plus(BNRand().minus("0.5").times("0.15"))
    );

    for (let i = 0; i < count; i++) {
      const open = price;

      // 轻微上涨偏置（-0.498 而非 -0.5），使行情看起来更自然
      const closeChange = BNRand().minus("0.498").times(vol).times("4");
      const close = open.times(BN(1).plus(closeChange));

      // 影线幅度
      const wickAmp = BNRand().times(vol).times("2");
      const high = BigNumber.max(open, close).times(
        BN(1).plus(wickAmp.times(BNRand()))
      );
      const low = BigNumber.min(open, close).times(
        BN(1).minus(wickAmp.times(BNRand()))
      );

      // 交易量：高价币量小，低价币量大
      const volFactor = base.gt("1000") ? "0.01" : "10";
      const volume = BNRand().times("3").plus("0.1").times(volFactor);

      candles.push({
        time,
        open: fmtNum(open, priceDecimals),
        high: fmtNum(high, priceDecimals),
        low: fmtNum(low, priceDecimals),
        close: fmtNum(close, priceDecimals),
        volume: fmtNum(volume, qtyDecimals || 2),
      });

      price = close;
      time += 60;
    }

    // 以历史末尾价格同步当前价格
    this.price = price;
    return candles;
  }

  // ─── 每 tick 价格更新，返回当前 K 线快照 ─────────────────────────────────────
  tick() {
    const { volatility, priceDecimals, qtyDecimals, basePrice } = this.config;
    const vol = BN(volatility);
    const base = BN(basePrice);

    // 均值回归随机游走
    // revert = (base - price) / base * 0.005  ── 向基准价轻微回归
    const revert = base.minus(this.price).dividedBy(base).times("0.005");
    const randomShock = BNRand().minus("0.5").times("2").times(vol);
    const change = randomShock.plus(revert);

    const rawPrice = this.price.times(BN(1).plus(change));
    // 价格下限：不低于基准价的 50%，防止归零
    this.price = BigNumber.max(rawPrice, base.times("0.5"));

    // 更新 24h 统计
    const tradeVol = BNRand().times("0.5").plus("0.01");
    this.volume24h = this.volume24h.plus(tradeVol);
    this.quoteVolume24h = this.quoteVolume24h.plus(tradeVol.times(this.price));
    if (this.price.gt(this.high24h)) this.high24h = this.price;
    if (this.price.lt(this.low24h)) this.low24h = this.price;

    // 判断是否开启新 K 线周期
    const currentMinute = this._currentMinute();
    if (currentMinute > this.candleTime) {
      // 封存旧 K 线
      const closed = {
        time: this.candleTime,
        open: fmtNum(this.candleOpen, priceDecimals),
        high: fmtNum(this.candleHigh, priceDecimals),
        low: fmtNum(this.candleLow, priceDecimals),
        close: fmtNum(this.candleClose, priceDecimals),
        volume: fmtNum(this.candleVolume, qtyDecimals || 2),
        isClosed: true,
      };
      this.history.push(closed);
      if (this.history.length > 500) this.history.shift();

      // 开新 K 线
      this.candleTime = currentMinute;
      this.candleOpen = this.price;
      this.candleHigh = this.price;
      this.candleLow = this.price;
      this.candleVolume = BN("0");
    }

    // 更新当前 K 线 OHLCV
    if (this.price.gt(this.candleHigh)) this.candleHigh = this.price;
    if (this.price.lt(this.candleLow)) this.candleLow = this.price;
    this.candleClose = this.price;
    this.candleVolume = this.candleVolume.plus(
      BNRand().times("0.3").plus("0.01")
    );

    return {
      time: this.candleTime,
      open: fmtNum(this.candleOpen, priceDecimals),
      high: fmtNum(this.candleHigh, priceDecimals),
      low: fmtNum(this.candleLow, priceDecimals),
      close: fmtNum(this.candleClose, priceDecimals),
      volume: fmtNum(this.candleVolume, qtyDecimals || 2),
      isClosed: false,
    };
  }

  // ─── 生成订单簿 ───────────────────────────────────────────────────────────────
  getOrderBook() {
    const { priceDecimals, qtyDecimals } = this.config;

    // 价差 = 当前价 × 0.015%（精确 BigNumber 乘法）
    const halfSpread = this.price.times("0.00015").dividedBy("2");

    const bids = [];
    const asks = [];
    let bidPrice = this.price.minus(halfSpread);
    let askPrice = this.price.plus(halfSpread);

    for (let i = 0; i < 20; i++) {
      // 越远离盘口，档位数量越大（模拟真实深度分布）
      const depthFactor = BN(1).plus(BN(i).times("0.3"));
      const bidQty = BNRand().times("2").plus("0.05").times(depthFactor);
      const askQty = BNRand().times("2").plus("0.05").times(depthFactor);

      bids.push({
        price: fmtStr(bidPrice, priceDecimals),
        quantity: fmtStr(bidQty, qtyDecimals || 2),
      });
      asks.push({
        price: fmtStr(askPrice, priceDecimals),
        quantity: fmtStr(askQty, qtyDecimals || 2),
      });

      // 每档步进：价格 × 随机系数（BigNumber 精确乘除）
      const bidStep = this.price.times(
        BNRand().times("0.0003").plus("0.00005")
      );
      const askStep = this.price.times(
        BNRand().times("0.0003").plus("0.00005")
      );
      bidPrice = bidPrice.minus(bidStep);
      askPrice = askPrice.plus(askStep);
    }

    return { bids, asks, lastUpdateId: Date.now() };
  }

  // ─── 生成 Ticker 快照 ─────────────────────────────────────────────────────────
  getTicker() {
    const { priceDecimals } = this.config;

    // change = price - openPrice（BigNumber 减法，避免浮点误差）
    const change = this.price.minus(this.openPrice24h);
    // changePct = change / openPrice × 100（BigNumber 除法）
    const changePct = change.dividedBy(this.openPrice24h).times("100");

    return {
      symbol: this.symbol,
      lastPrice: fmtStr(this.price, priceDecimals),
      priceChange: fmtStr(change, priceDecimals),
      // 涨跌幅采用四舍五入（ROUND_HALF_UP），展示更准确
      priceChangePercent: changePct.toFixed(2, BigNumber.ROUND_HALF_UP),
      highPrice: fmtStr(this.high24h, priceDecimals),
      lowPrice: fmtStr(this.low24h, priceDecimals),
      volume: this.volume24h.toFixed(2, BigNumber.ROUND_DOWN),
      quoteVolume: this.quoteVolume24h.toFixed(2, BigNumber.ROUND_DOWN),
      openPrice: fmtStr(this.openPrice24h, priceDecimals),
    };
  }

  // ─── 生成随机成交记录 ─────────────────────────────────────────────────────────
  getRandomTrade() {
    const { priceDecimals, qtyDecimals } = this.config;

    // 滑点 = 当前价 × 随机系数 × 0.02%（精确 BigNumber 乘法）
    const slippage = BNRand().minus("0.5").times(this.price).times("0.0002");
    const tradePrice = this.price.plus(slippage);
    const qty = BNRand().times("0.5").plus("0.001");
    this.tradeCount++;

    return {
      id: `${this.symbol}-${this.tradeCount}`,
      price: fmtStr(tradePrice, priceDecimals),
      quantity: fmtStr(qty, qtyDecimals || 3),
      time: Date.now(),
      isBuyerMaker: Math.random() > 0.5,
    };
  }
}

// ─── 初始化所有市场 ───────────────────────────────────────────────────────────
const markets = {};
for (const [symbol, config] of Object.entries(MARKETS_CONFIG)) {
  markets[symbol] = new MockMarket(symbol, config);
}

// ─── WebSocket 服务器 ─────────────────────────────────────────────────────────
const wss = new WebSocketServer({ port: PORT });

// 订阅关系：symbol → Set<ws>
const subscribers = {};
for (const symbol of Object.keys(MARKETS_CONFIG)) {
  subscribers[symbol] = new Set();
}

function send(ws, type, symbol, data) {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify({ type, symbol, data }));
  }
}

function broadcast(symbol, type, data) {
  for (const ws of subscribers[symbol]) {
    send(ws, type, symbol, data);
  }
}

wss.on("connection", (ws) => {
  console.log(`[WS] 客户端连接，当前连接数: ${wss.clients.size}`);

  ws.on("message", (raw) => {
    try {
      const msg = JSON.parse(raw.toString());

      if (msg.type === "subscribe" && msg.symbol) {
        const symbol = msg.symbol.toUpperCase();
        if (!markets[symbol]) return;
        subscribers[symbol].add(ws);
        console.log(`[WS] 订阅 ${symbol}`);
        // 立即推送历史 K 线 + 初始快照
        send(ws, "kline_history", symbol, markets[symbol].history);
        send(ws, "orderbook", symbol, markets[symbol].getOrderBook());
        send(ws, "ticker", symbol, markets[symbol].getTicker());
      }

      if (msg.type === "unsubscribe" && msg.symbol) {
        const symbol = msg.symbol.toUpperCase();
        subscribers[symbol]?.delete(ws);
        console.log(`[WS] 取消订阅 ${symbol}`);
      }
    } catch {
      // ignore malformed messages
    }
  });

  ws.on("close", () => {
    for (const set of Object.values(subscribers)) set.delete(ws);
    console.log(`[WS] 客户端断开，当前连接数: ${wss.clients.size}`);
  });
});

// ─── 定时推送 ─────────────────────────────────────────────────────────────────

// 每 800ms：价格 tick → 推送 K 线 + Ticker
setInterval(() => {
  for (const [symbol, market] of Object.entries(markets)) {
    if (subscribers[symbol].size === 0) continue;
    const bar = market.tick();
    broadcast(symbol, "kline", bar);
    broadcast(symbol, "ticker", market.getTicker());
  }
}, 800);

// 每 600ms：推送订单簿
setInterval(() => {
  for (const [symbol, market] of Object.entries(markets)) {
    if (subscribers[symbol].size === 0) continue;
    broadcast(symbol, "orderbook", market.getOrderBook());
  }
}, 600);

// 随机推送成交（每 300~1500ms 一笔，模拟真实成交流）
function scheduleNextTrade(symbol) {
  const delay = Math.random() * 1200 + 300;
  setTimeout(() => {
    if (subscribers[symbol].size > 0) {
      broadcast(symbol, "trade", markets[symbol].getRandomTrade());
    }
    scheduleNextTrade(symbol);
  }, delay);
}
for (const symbol of Object.keys(MARKETS_CONFIG)) {
  scheduleNextTrade(symbol);
}

console.log(`\n🚀 CEX Mock WebSocket Server 启动（BigNumber 精确计算）`);
console.log(`   地址: ws://localhost:${PORT}`);
console.log(`   支持币对: ${Object.keys(MARKETS_CONFIG).join(", ")}\n`);
