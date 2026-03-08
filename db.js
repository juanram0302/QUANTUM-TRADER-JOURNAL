// ═══════════════════════════════════════════════════════
// QUANTUM TRADER — DATABASE (Firebase Firestore)
// ═══════════════════════════════════════════════════════

import { db } from "./firebase.js";
import {
  collection, doc, addDoc, updateDoc, getDocs,
  query, where, orderBy, serverTimestamp, getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ─── ADD TRADE ───
export async function addTrade(userId, trade) {
  const ref = await addDoc(collection(db, "trades"), {
    ...trade, userId, status: "open", result: null,
    openTime: serverTimestamp(), closeTime: null,
  });
  await updateDoc(doc(db, "users", userId), {
    tradesCount: (trade.tradesCount || 0) + 1
  });
  return ref.id;
}

// ─── CLOSE TRADE ───
export async function closeTrade(tradeId, result) {
  await updateDoc(doc(db, "trades", tradeId), {
    status: "closed", result, closeTime: serverTimestamp()
  });
}

// ─── GET USER TRADES ───
export async function getUserTrades(userId) {
  const q = query(
    collection(db, "trades"),
    where("userId", "==", userId),
    orderBy("openTime", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ─── GET USER STATS ───
export async function getUserStats(userId) {
  const trades = await getUserTrades(userId);
  const closed = trades.filter(t => t.status === "closed");
  const wins   = closed.filter(t => t.result === "tp");

  let pnl = 0;
  closed.forEach(t => {
    if (t.result === "tp") pnl += parseFloat(t.risk) * parseFloat(t.rr);
    else pnl -= parseFloat(t.risk);
  });

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0,0,0,0);
  const weekTrades = trades.filter(t => {
    const d = t.openTime?.toDate ? t.openTime.toDate() : new Date(t.openTime);
    return d >= weekStart;
  });

  return {
    total: closed.length,
    wins: wins.length,
    losses: closed.length - wins.length,
    winRate: closed.length > 0 ? Math.round((wins.length / closed.length) * 100) : 0,
    pnl: parseFloat(pnl.toFixed(2)),
    weekTrades: weekTrades.length,
    open: trades.filter(t => t.status === "open").length,
  };
}

// ─── ADMIN: GET ALL USERS ───
export async function getAllUsers() {
  const snap = await getDocs(collection(db, "users"));
  return snap.docs.map(d => ({ uid: d.id, ...d.data() }));
}

// ─── ADMIN: UPDATE USER STATUS ───
export async function setUserStatus(uid, status) {
  const data = { status };
  if (status === "approved") data.approvedAt = serverTimestamp();
  await updateDoc(doc(db, "users", uid), data);
}

// ─── ADMIN: UPDATE NOTES ───
export async function updateUserNotes(uid, notes) {
  await updateDoc(doc(db, "users", uid), { notes });
}
