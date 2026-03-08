// ═══════════════════════════════════════════════════════
// QUANTUM TRADER — DATABASE (localStorage)
// Manejo de trades por usuario
// ═══════════════════════════════════════════════════════

const DB = {

  // ─── TRADES ───
  getTrades(userId) {
    const key = 'qt_trades_' + userId;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  },

  saveTrades(userId, trades) {
    localStorage.setItem('qt_trades_' + userId, JSON.stringify(trades));
  },

  addTrade(userId, trade) {
    const trades = this.getTrades(userId);
    trade.id = 't_' + Date.now();
    trade.openTime = new Date().toISOString();
    trade.status = 'open';
    trade.result = null;
    trades.push(trade);
    this.saveTrades(userId, trades);

    // Update user trade count
    const users = AUTH.getUsers();
    const user = users.find(u => u.id === userId);
    if (user) { user.tradesCount = trades.length; AUTH.saveUsers(users); }

    return trade;
  },

  closeTrade(userId, tradeId, result) {
    const trades = this.getTrades(userId);
    const trade = trades.find(t => t.id === tradeId);
    if (!trade) return false;
    trade.status = 'closed';
    trade.result = result;
    trade.closeTime = new Date().toISOString();
    this.saveTrades(userId, trades);
    return true;
  },

  // ─── STATS PER USER ───
  getUserStats(userId) {
    const trades = this.getTrades(userId).filter(t => t.status === 'closed');
    const wins = trades.filter(t => t.result === 'tp');
    const losses = trades.filter(t => t.result === 'sl');

    let pnl = 0;
    trades.forEach(t => {
      if (t.result === 'tp') pnl += parseFloat(t.risk) * parseFloat(t.rr);
      else pnl -= parseFloat(t.risk);
    });

    // Weekly trades
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0,0,0,0);
    const weekTrades = this.getTrades(userId).filter(t => new Date(t.openTime) >= weekStart);

    return {
      total: trades.length,
      wins: wins.length,
      losses: losses.length,
      winRate: trades.length > 0 ? Math.round((wins.length / trades.length) * 100) : 0,
      pnl: parseFloat(pnl.toFixed(2)),
      weekTrades: weekTrades.length,
      open: this.getTrades(userId).filter(t => t.status === 'open').length,
    };
  },

  // ─── ADMIN: ALL USERS STATS ───
  getAllUsersStats() {
    const users = AUTH.getUsers().filter(u => u.role !== 'admin' && u.status === 'approved');
    return users.map(u => ({
      ...u,
      stats: this.getUserStats(u.id),
    }));
  },
};
