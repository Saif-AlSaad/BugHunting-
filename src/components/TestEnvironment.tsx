import { useCallback, useRef, useState } from "react";
import type { Mission, Bug, TestEnvState, Severity } from "../types";
import { cn } from "../utils/cn";
import { getLevelTheme } from "../game/themes";

interface Props {
  mission: Mission;
  env: TestEnvState;
  discoveredBugs: string[];
  timeLeft: number;
  level: number;
  levelLabel: string;
  hintsUsed: number;
  freeHints: number;
  hintPenalty: number;
  streak: number;
  onStateChange: (fn: (s: TestEnvState) => TestEnvState) => void;
  onBugFound: (bug: Bug) => void;
  onReport: (bug: Bug) => void;
  onRequestHint: () => void;
  onFinish: () => void; 
  onOpenConsole: () => void;
  onQuit: () => void;
}

const ECOM_PRODUCTS = [
  { id: "p1", name: "Mechanical Keyboard", price: 89.99 },
  { id: "p2", name: "USB-C Hub", price: 34.50 },
  { id: "p3", name: "Monitor Stand", price: 45.00 },
  { id: "p4", name: "Webcam HD", price: 69.99 },
];

export default function TestEnvironment({
  mission, env, discoveredBugs, timeLeft, level, levelLabel, hintsUsed, freeHints, hintPenalty, streak,
  onStateChange, onBugFound, onReport, onRequestHint, onFinish, onQuit,
}: Props) {
  const [activeTab, setActiveTab] = useState<string>(
    mission.id === "login" ? "login" : mission.id === "ecommerce" ? "shop" : "transfer"
  );
  const lastActionRef = useRef<{ type: string; time: number; amount: number } | null>(null);
  const theme = getLevelTheme(level);

  const checkBug = useCallback((bugId: string) => {
    const bug = mission.bugs.find(b => b.id === bugId);
    if (bug && !discoveredBugs.includes(bugId)) onBugFound(bug);
  }, [mission, discoveredBugs, onBugFound]);

  // Only bugs planted in the current level's app are simulated. Anything else
  // behaves correctly, so players never see buggy behavior the game won't credit.
  const hasBug = (bugId: string) => mission.bugs.some(b => b.id === bugId);

  // === LOGIN APP ===
  const doLogin = () => {
    const newState = { ...env, loginAttempts: env.loginAttempts + 1 };
    const emptyUser = env.username.trim() === "";
    const emptyPass = env.password === "";
    const spacePass = env.password.trim() === "" && env.password.length > 0;

    if (emptyUser && hasBug("login-01")) {
      newState.loggedIn = true;
      checkBug("login-01");
    } else if (emptyPass && hasBug("login-02")) {
      newState.loggedIn = true;
      checkBug("login-02");
    } else if (spacePass && hasBug("login-03")) {
      newState.loggedIn = true;
      checkBug("login-03");
    } else if (emptyUser || emptyPass || spacePass) {
      newState.loggedIn = false;
    } else {
      newState.loggedIn = true;
    }
    if (hasBug("login-04") && newState.loginAttempts >= 10) {
      checkBug("login-04");
    }
    onStateChange(() => newState);
  };

  const doReset = () => {
    const invalidEmail = !!env.resetEmail && !env.resetEmail.includes("@") && !env.resetEmail.includes(".");
    if (invalidEmail && hasBug("login-06")) {
      checkBug("login-06");
      onStateChange(s => ({ ...s, resetEmail: "" }));
    } else if (!invalidEmail) {
      onStateChange(s => ({ ...s, resetEmail: "" }));
    }
  };

  const doOtpSubmit = () => {
    const reuseAttempt = env.otpUsed && env.otp !== "";
    if (reuseAttempt && hasBug("login-05")) {
      checkBug("login-05");
      onStateChange(s => ({ ...s, otpUsed: true, otp: "" }));
    } else if (!reuseAttempt) {
      onStateChange(s => ({ ...s, otpUsed: true, otp: "" }));
    }
  };

  // === E-COMMERCE APP ===
  const addToCart = (product: typeof ECOM_PRODUCTS[0]) => {
    const existing = env.cart.find(c => c.id === product.id);
    let newCart: typeof env.cart;
    if (existing) {
      newCart = env.cart.map(c => c.id === product.id ? { ...c, qty: c.qty + 1 } : c);
    } else {
      newCart = [...env.cart, { ...product, qty: 1 }];
    }
    onStateChange(s => ({ ...s, cart: newCart }));
  };

  const updateQty = (id: string, qty: number) => {
    let next = qty;
    if (qty <= 0) {
      if (hasBug("ecom-01")) checkBug("ecom-01");
      else next = 1;
    }
    if (qty > 9999) {
      if (hasBug("ecom-06")) checkBug("ecom-06");
      else next = 9999;
    }
    const newCart = env.cart.map(c => c.id === id ? { ...c, qty: next } : c);
    onStateChange(s => ({ ...s, cart: newCart }));
  };

  const applyCoupon = () => {
    if (env.couponApplied) {
      if (hasBug("ecom-02")) {
        checkBug("ecom-02");
        onStateChange(s => ({ ...s, couponApplied: true, couponCount: s.couponCount + 1 }));
      }
    } else {
      onStateChange(s => ({ ...s, couponApplied: true, couponCount: s.couponCount + 1 }));
    }
  };

  const placeOrder = () => {
    let total = 0;
    for (const item of env.cart) total += item.price * item.qty;
    if (env.couponApplied) total *= 0.9;
    const priceBug = hasBug("ecom-03") && env.cart.length > 0;
    const shownTotal = priceBug ? Math.round(total * 100 + 47) / 100 : total;
    if (priceBug && Math.abs(shownTotal - total) > 0.01) {
      checkBug("ecom-03");
    }
    const noAddress = !env.address.trim();
    if (noAddress && hasBug("ecom-04")) {
      checkBug("ecom-04");
      onStateChange(s => ({ ...s, orderPlaced: true }));
    } else if (noAddress) {
      onStateChange(s => ({ ...s }));
    } else {
      onStateChange(s => ({ ...s, orderPlaced: true }));
    }
  };

  const toggleWishlist = (id: string) => {
    const newWish = env.wishlist.includes(id) ? env.wishlist.filter(w => w !== id) : [...env.wishlist, id];
    onStateChange(s => ({ ...s, wishlist: newWish }));
  };

  // === BANKING APP ===
  const doTransfer = () => {
    const now = Date.now();
    const prev = lastActionRef.current;
    const dup = hasBug("bank-06") && !!prev && prev.type === "transfer" && now - prev.time < 500;
    const dupAmount = dup && prev ? prev.amount : 0;
    lastActionRef.current = { type: "transfer", time: now, amount: env.transferAmount };

    const negative = env.transferAmount <= 0;
    const overdraft = env.transferAmount > env.balance;
    const emptyTo = env.transferTo.trim() === "";

    if (negative && hasBug("bank-01")) checkBug("bank-01");
    if (overdraft && hasBug("bank-02")) checkBug("bank-02");
    if (emptyTo && hasBug("bank-05")) checkBug("bank-05");
    if (dup) checkBug("bank-06");

    if ((negative && !hasBug("bank-01")) || (overdraft && !hasBug("bank-02")) || (emptyTo && !hasBug("bank-05"))) {
      return;
    }

    const newBalance = env.balance - env.transferAmount - dupAmount;
    const tx = { id: env.txIdCounter, type: "Transfer Out", amount: env.transferAmount, desc: `To: ${env.transferTo || "(empty)"}` };
    onStateChange(s => {
      let txs = [...s.transactions, tx];
      let counter = s.txIdCounter + 1;
      if (dup) {
        txs = [...txs, { ...tx, id: counter, amount: dupAmount }];
        counter += 1;
      }
      return {
        ...s, balance: newBalance, transferTo: "", transferAmount: 0,
        transactions: txs, txIdCounter: counter,
      };
    });
    if (hasBug("bank-03") && env.transferAmount > 0) {
      checkBug("bank-03");
    }
  };

  const doDeposit = () => {
    const now = Date.now();
    const prev = lastActionRef.current;
    const dup = hasBug("bank-06") && !!prev && prev.type === "deposit" && now - prev.time < 500;
    const dupAmount = dup && prev ? prev.amount : 0;

    const amount = env.depositAmount;
    const exact = Math.round(amount * 100) / 100;
    const processed = hasBug("bank-04") ? Math.floor(amount * 100) / 100 : exact;
    const lost = amount - processed;
    lastActionRef.current = { type: "deposit", time: now, amount: processed };

    if (lost > 0.005) checkBug("bank-04");
    if (dup) checkBug("bank-06");

    const newBalance = env.balance + processed + dupAmount;
    const tx = { id: env.txIdCounter, type: "Deposit", amount: processed, desc: `Cash deposit` };
    onStateChange(s => {
      let txs = [...s.transactions, tx];
      let counter = s.txIdCounter + 1;
      if (dup) {
        txs = [...txs, { ...tx, id: counter, amount: dupAmount }];
        counter += 1;
      }
      return {
        ...s, balance: newBalance, depositAmount: 0,
        transactions: txs, txIdCounter: counter,
      };
    });
  };

  const doWithdraw = () => {
    const now = Date.now();
    const prev = lastActionRef.current;
    const dup = hasBug("bank-06") && !!prev && prev.type === "withdraw" && now - prev.time < 500;
    const dupAmount = dup && prev ? prev.amount : 0;
    lastActionRef.current = { type: "withdraw", time: now, amount: env.withdrawAmount };

    if (env.withdrawAmount > env.balance) {
      if (hasBug("bank-02")) checkBug("bank-02");
      else return;
    }
    if (dup) checkBug("bank-06");

    const newBalance = env.balance - env.withdrawAmount - dupAmount;
    const tx = { id: env.txIdCounter, type: "Withdrawal", amount: env.withdrawAmount, desc: "ATM" };
    onStateChange(s => {
      let txs = [...s.transactions, tx];
      let counter = s.txIdCounter + 1;
      if (dup) {
        txs = [...txs, { ...tx, id: counter, amount: dupAmount }];
        counter += 1;
      }
      return {
        ...s, balance: newBalance, withdrawAmount: 0,
        transactions: txs, txIdCounter: counter,
      };
    });
  };

  // Shared helpers
  const fmt = (n: number) => `$${n.toFixed(2)}`;

  const calcCartTotalCorrect = () => {
    let t = 0;
    for (const c of env.cart) t += c.price * c.qty;
    if (env.couponApplied) t *= 0.9;
    return t;
  };
  // Simulated buggy total (adds $0.47 when the price bug is planted)
  const calcCartTotalBuggy = () => {
    let t = 0;
    for (const c of env.cart) t += c.price * c.qty;
    if (env.couponCount > 0) t *= Math.pow(0.9, env.couponCount);
    if (hasBug("ecom-03") && env.cart.length > 0) t = Math.round((t + 0.47) * 100) / 100;
    return t;
  };

  // Correct per-transaction running balance (used when the history bug isn't planted)
  const runningBalance = (i: number) => {
    let bal = env.balance;
    for (let k = i + 1; k < env.transactions.length; k++) {
      const t = env.transactions[k];
      bal -= t.type === "Transfer Out" || t.type === "Withdrawal" ? t.amount : -t.amount;
    }
    return Math.round(bal * 100) / 100;
  };

  // Tab UI styling varies per level so each level's interface looks distinct.
  const tabClasses = (active: boolean) => {
    const base = "px-3 py-1.5 font-mono text-xs transition-all";
    if (theme.tabStyle === "underline") {
      return {
        className: cn(base, "rounded-none", active ? "font-bold" : "text-slate-400 hover:text-slate-200"),
        style: active ? { color: theme.accent, borderBottom: `2px solid ${theme.accent}` } : undefined,
      };
    }
    if (theme.tabStyle === "box") {
      return {
        className: cn(base, "rounded-lg ring-1", active ? "font-bold" : "text-slate-400 hover:text-slate-200 ring-slate-700/40"),
        style: active
          ? { backgroundColor: theme.soft, color: theme.headerText, borderColor: theme.accent, boxShadow: `0 0 12px ${theme.soft}` }
          : undefined,
      };
    }
    return {
      className: cn(base, "rounded-full", active ? "font-bold" : "text-slate-400 hover:text-slate-200"),
      style: active ? { backgroundColor: theme.accent, color: "#0f172a" } : undefined,
    };
  };

  // === RENDER ===
  return (
    <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-2 py-4 sm:px-6">
      {/* Header */}
      <header className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-900/70 px-4 py-3 ring-1 ring-slate-700/50">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{mission.icon}</span>
          <div>
            <h3 className="font-mono text-sm font-bold text-sky-300" style={{ color: theme.headerText }}>{mission.title}</h3>
            <p className="font-mono text-[10px] text-slate-500">{mission.clientName} · {mission.sprintName} · <span style={{ color: theme.accent }}>{theme.version}</span></p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <span className="font-mono text-xs font-bold text-violet-300" title="Difficulty level">
            🎚 Lv.{level} {levelLabel}
          </span>
          {streak >= 3 && (
            <span className="animate-fade-in-up font-mono text-xs font-bold text-orange-300" title="Consecutive valid, no-hint reports">
              🔥 Streak x{streak >= 8 ? 2 : streak >= 5 ? 1.5 : 1.2} ({streak})
            </span>
          )}
          <span className={cn("font-mono text-sm font-bold", timeLeft < 60 ? "text-rose-400 animate-pulse" : "text-emerald-300")}>
            ⏱ {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
          </span>
          <span className="font-mono text-sm text-amber-300">
            🐛 {discoveredBugs.length}/{mission.bugs.length}
          </span>
          <button
            onClick={onRequestHint}
            disabled={discoveredBugs.length === mission.bugs.length}
            title={hintsUsed < freeHints ? `${freeHints - hintsUsed} free hints left` : `Costs ${hintPenalty} XP`}
            className="rounded-lg bg-violet-500/15 px-3 py-1.5 font-mono text-xs font-bold text-violet-200 ring-1 ring-violet-400/30 transition-all hover:bg-violet-500/25 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
          >
            💡 Hint {hintsUsed < freeHints ? `(${freeHints - hintsUsed} free)` : `(−${hintPenalty} XP)`}
          </button>
                    <button
            onClick={onFinish}
            title="End this level now and see your results"
            className={cn(
              "rounded-lg px-3 py-1.5 font-mono text-xs font-bold ring-1 transition-all active:scale-95",
              discoveredBugs.length === mission.bugs.length
                ? "bg-emerald-500/20 text-emerald-200 ring-emerald-400/40 hover:bg-emerald-500/30"
                : "bg-slate-800/60 text-slate-400 ring-slate-600/40 hover:bg-slate-700/60"
            )}
          >
            🏁 Finish
          </button>
          <button onClick={onQuit} className="font-mono text-xs text-slate-400 hover:text-rose-300">
            ✕ Quit
          </button>
        </div>
      </header>

            {/* Level clear target */}
      <div className={cn(
        "mb-4 rounded-xl px-4 py-3 ring-1",
        discoveredBugs.length === mission.bugs.length
          ? "bg-emerald-500/10 ring-emerald-400/30"
          : "bg-sky-500/5 ring-sky-500/20"
      )}>
        <p className={cn("font-mono text-xs font-bold", discoveredBugs.length === mission.bugs.length ? "text-emerald-300" : "text-sky-300")}>
          {discoveredBugs.length === mission.bugs.length
            ? `✅ All ${mission.bugs.length} bugs found — submit reports for each, then hit Finish to clear Level ${level}.`
            : `🎯 Find & report all ${mission.bugs.length} bugs to clear Level ${level}${level < 100 ? ` and unlock Level ${level + 1}` : ""}.`}
        </p>
      </div>

      {/* Requirements */}
      <div className="mb-4 rounded-xl bg-amber-500/5 px-4 py-3 ring-1 ring-amber-500/20">
        <p className="font-mono text-xs font-bold text-amber-300">📋 Client Requirements:</p>
        <div className="mt-1 flex flex-wrap gap-2">
          {mission.requirements.map((r, i) => (
            <span key={i} className="rounded bg-amber-500/10 px-2 py-0.5 font-mono text-[11px] text-amber-200/80">{r}</span>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex gap-1 overflow-x-auto rounded-xl bg-slate-900/50 p-1">
        {mission.id === "login" && (
          <>
            {[
              { id: "login", label: "🔑 Login" },
              { id: "otp", label: "📱 OTP Reset" },
              { id: "register", label: "📝 Register" },
            ].map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} {...tabClasses(activeTab === t.id)}>
                {t.label}
              </button>
            ))}
          </>
        )}
        {mission.id === "ecommerce" && (
          <>
            {[
              { id: "shop", label: "🛍️ Shop" },
              { id: "cart", label: "🛒 Cart" },
              { id: "checkout", label: "💳 Checkout" },
            ].map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} {...tabClasses(activeTab === t.id)}>
                {t.label}
              </button>
            ))}
          </>
        )}
        {mission.id === "banking" && (
          <>
            {[
              { id: "transfer", label: "💸 Transfer" },
              { id: "deposit", label: "📥 Deposit" },
              { id: "history", label: "📜 History" },
            ].map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} {...tabClasses(activeTab === t.id)}>
                {t.label}
              </button>
            ))}
          </>
        )}
      </div>

      {/* App Content */}
      <div className="flex-1 rounded-2xl border border-slate-700/40 bg-slate-950/70 p-4 sm:p-6" style={{ borderColor: `${theme.accent}66` }}>
        {mission.id === "login" && (
          <>
            {activeTab === "login" && (
              <div className="mx-auto max-w-sm">
                <div className="rounded-xl bg-slate-900 p-6 ring-1 ring-slate-700/50">
                  <h4 className="text-center font-mono text-lg font-bold text-white">LOGIN</h4>
                  {env.loggedIn ? (
                    <div className="mt-4 rounded-lg bg-emerald-500/10 p-4 text-center">
                      <p className="text-lg">✅</p>
                      <p className="mt-1 font-mono text-sm text-emerald-300">Welcome, {env.username || "User"}!</p>
                      <button onClick={() => onStateChange(s => ({ ...s, loggedIn: false }))} className="mt-2 font-mono text-xs text-slate-400 hover:text-sky-300">
                        Logout
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="mt-4">
                        <label className="font-mono text-xs text-slate-400">Username</label>
                        <input value={env.username} onChange={e => onStateChange(s => ({ ...s, username: e.target.value }))}
                          className="mt-1 w-full rounded-lg bg-slate-800 px-3 py-2 font-mono text-sm text-white ring-1 ring-slate-600 focus:outline-none focus:ring-sky-400"
                          placeholder="Enter username" />
                      </div>
                      <div className="mt-3">
                        <label className="font-mono text-xs text-slate-400">Password</label>
                        <input type="password" value={env.password} onChange={e => onStateChange(s => ({ ...s, password: e.target.value }))}
                          className="mt-1 w-full rounded-lg bg-slate-800 px-3 py-2 font-mono text-sm text-white ring-1 ring-slate-600 focus:outline-none focus:ring-sky-400"
                          placeholder="Enter password" />
                      </div>
                      <button onClick={doLogin} className="mt-4 w-full rounded-lg bg-sky-600 py-2 font-mono text-sm font-bold text-white transition-all hover:bg-sky-500 active:scale-95">
                        LOGIN
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
            {activeTab === "otp" && (
              <div className="mx-auto max-w-sm">
                <div className="rounded-xl bg-slate-900 p-6 ring-1 ring-slate-700/50">
                  <h4 className="text-center font-mono text-lg font-bold text-white">RESET PASSWORD</h4>
                  <div className="mt-4">
                    <label className="font-mono text-xs text-slate-400">Email</label>
                    <input value={env.resetEmail} onChange={e => onStateChange(s => ({ ...s, resetEmail: e.target.value }))}
                      className="mt-1 w-full rounded-lg bg-slate-800 px-3 py-2 font-mono text-sm text-white ring-1 ring-slate-600 focus:outline-none focus:ring-sky-400"
                      placeholder="Enter email" />
                    <button onClick={doReset} className="mt-2 w-full rounded-lg bg-violet-600 py-2 font-mono text-sm font-bold text-white transition-all hover:bg-violet-500 active:scale-95">
                      Send OTP
                    </button>
                  </div>
                  <div className="mt-4 border-t border-slate-700 pt-4">
                    <label className="font-mono text-xs text-slate-400">OTP Code</label>
                    <input value={env.otp} onChange={e => onStateChange(s => ({ ...s, otp: e.target.value }))}
                      className="mt-1 w-full rounded-lg bg-slate-800 px-3 py-2 font-mono text-sm text-white ring-1 ring-slate-600 focus:outline-none focus:ring-sky-400"
                      placeholder="Enter 6-digit OTP" />
                    <button onClick={doOtpSubmit} className="mt-2 w-full rounded-lg bg-violet-600 py-2 font-mono text-sm font-bold text-white transition-all hover:bg-violet-500 active:scale-95">
                      Verify OTP
                    </button>
                    {env.otpUsed && <p className="mt-2 text-center font-mono text-xs text-emerald-400">OTP used! Password reset.</p>}
                  </div>
                </div>
              </div>
            )}
            {activeTab === "register" && (
              <div className="mx-auto max-w-sm">
                <div className="rounded-xl bg-slate-900 p-6 ring-1 ring-slate-700/50">
                  <h4 className="text-center font-mono text-lg font-bold text-white">REGISTER</h4>
                  <div className="mt-4 space-y-3">
                    <div>
                      <label className="font-mono text-xs text-slate-400">Username</label>
                      <input className="mt-1 w-full rounded-lg bg-slate-800 px-3 py-2 font-mono text-sm text-white ring-1 ring-slate-600" placeholder="New username" />
                    </div>
                    <div>
                      <label className="font-mono text-xs text-slate-400">Password</label>
                      <input type="password" className="mt-1 w-full rounded-lg bg-slate-800 px-3 py-2 font-mono text-sm text-white ring-1 ring-slate-600" placeholder="Min 8 characters" />
                    </div>
                    <div>
                      <label className="font-mono text-xs text-slate-400">Confirm Password</label>
                      <input type="password" className="mt-1 w-full rounded-lg bg-slate-800 px-3 py-2 font-mono text-sm text-white ring-1 ring-slate-600" placeholder="Confirm password" />
                    </div>
                    <button className="w-full rounded-lg bg-emerald-600 py-2 font-mono text-sm font-bold text-white transition-all hover:bg-emerald-500 active:scale-95">
                      CREATE ACCOUNT
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {mission.id === "ecommerce" && (
          <>
            {activeTab === "shop" && (
              <div>
                <div className="mb-4">
                  <input
                    value={env.searchQuery}
                    onChange={e => {
                      const query = e.target.value;
                      onStateChange(s => ({ ...s, searchQuery: query }));
                      if (query && env.wishlist.length > 0 && hasBug("ecom-05")) {
                        checkBug("ecom-05");
                        setTimeout(() => onStateChange(s2 => ({ ...s2, wishlist: [] })), 400);
                      }
                    }}
                    className="w-full rounded-lg bg-slate-800 px-3 py-2 font-mono text-sm text-white ring-1 ring-slate-600 focus:outline-none focus:ring-sky-400"
                    placeholder="🔍 Search products..."
                  />
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {ECOM_PRODUCTS.map(p => {
                    const inCart = env.cart.find(c => c.id === p.id);
                    const inWish = env.wishlist.includes(p.id);
                    return (
                      <div key={p.id} className="rounded-xl bg-slate-900 p-4 ring-1 ring-slate-700/50">
                        <div className="text-center text-3xl">📦</div>
                        <h5 className="mt-2 font-mono text-sm font-bold text-white">{p.name}</h5>
                        <p className="font-mono text-sm text-emerald-300">{fmt(p.price)}</p>
                        <div className="mt-2 flex gap-1">
                          <button onClick={() => addToCart(p)} className="flex-1 rounded bg-sky-600 py-1 font-mono text-xs text-white hover:bg-sky-500">
                            {inCart ? `In Cart (${inCart.qty})` : "Add to Cart"}
                          </button>
                          <button onClick={() => toggleWishlist(p.id)} className={cn("rounded px-2 text-xs", inWish ? "bg-rose-500/20 text-rose-300" : "bg-slate-700 text-slate-400")}>
                            {inWish ? "❤️" : "🤍"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {activeTab === "cart" && (
              <div className="mx-auto max-w-lg">
                <h4 className="font-mono text-lg font-bold text-white">Shopping Cart</h4>
                {env.cart.length === 0 ? (
                  <p className="mt-4 font-mono text-sm text-slate-500">Cart is empty.</p>
                ) : (
                  <>
                    <div className="mt-3 space-y-2">
                      {env.cart.map(c => (
                        <div key={c.id} className="flex items-center gap-3 rounded-lg bg-slate-900 p-3 ring-1 ring-slate-700/50">
                          <span className="font-mono text-sm text-white">{c.name}</span>
                          <span className="ml-auto font-mono text-sm text-emerald-300">{fmt(c.price)}</span>
                          <div className="flex items-center gap-1">
                            <button onClick={() => updateQty(c.id, c.qty - 1)} className="rounded bg-slate-700 px-2 py-0.5 text-xs text-white hover:bg-slate-600">−</button>
                            <input type="number" value={c.qty} onChange={e => updateQty(c.id, parseInt(e.target.value) || 0)}
                              className="w-14 rounded bg-slate-800 px-2 py-0.5 font-mono text-center text-xs text-white ring-1 ring-slate-600" />
                            <button onClick={() => updateQty(c.id, c.qty + 1)} className="rounded bg-slate-700 px-2 py-0.5 text-xs text-white hover:bg-slate-600">+</button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 rounded-lg bg-slate-900 p-4 ring-1 ring-slate-700/50">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm text-slate-300">Total:</span>
                        <span className="font-mono text-lg font-bold text-emerald-300">{fmt(calcCartTotalBuggy())}</span>
                      </div>
                      <div className="mt-1 flex gap-2">
                        <input value={env.coupon} onChange={e => onStateChange(s => ({ ...s, coupon: e.target.value }))}
                          className="flex-1 rounded bg-slate-800 px-2 py-1 font-mono text-xs text-white ring-1 ring-slate-600" placeholder="Coupon code" />
                        <button onClick={applyCoupon} className="rounded bg-violet-600 px-3 py-1 font-mono text-xs text-white">
                          {env.couponCount > 0 ? `Applied x${env.couponCount}` : "Apply"}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
            {activeTab === "checkout" && (
              <div className="mx-auto max-w-md">
                <h4 className="font-mono text-lg font-bold text-white">Checkout</h4>
                {env.orderPlaced ? (
                  <div className="mt-4 rounded-lg bg-emerald-500/10 p-4 text-center">
                    <p className="text-2xl">✅</p>
                    <p className="mt-1 font-mono text-sm text-emerald-300">Order placed!</p>
                    <button onClick={() => onStateChange(s => ({ ...s, cart: [], orderPlaced: false, couponApplied: false, couponCount: 0 }))}
                      className="mt-2 font-mono text-xs text-slate-400 hover:text-sky-300">
                      New order
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    <div>
                      <label className="font-mono text-xs text-slate-400">Shipping Address</label>
                      <textarea value={env.address} onChange={e => onStateChange(s => ({ ...s, address: e.target.value }))}
                        className="mt-1 w-full rounded-lg bg-slate-800 px-3 py-2 font-mono text-sm text-white ring-1 ring-slate-600" rows={2}
                        placeholder="Enter full address..." />
                    </div>
                    <div>
                      <label className="font-mono text-xs text-slate-400">Payment Method</label>
                      <select value={env.paymentMethod} onChange={e => onStateChange(s => ({ ...s, paymentMethod: e.target.value }))}
                        className="mt-1 w-full rounded-lg bg-slate-800 px-3 py-2 font-mono text-sm text-white ring-1 ring-slate-600">
                        <option value="">Select...</option>
                        <option value="cc">Credit Card</option>
                        <option value="pp">PayPal</option>
                        <option value="btc">Bitcoin</option>
                      </select>
                    </div>
                    <div className="rounded-lg bg-slate-900 p-3 ring-1 ring-slate-700/50">
                      <div className="flex justify-between font-mono text-xs text-slate-400">
                        <span>Correct Total:</span><span>{fmt(calcCartTotalCorrect())}</span>
                      </div>
                      <div className="mt-1 flex justify-between font-mono text-xs text-rose-300">
                        <span>Charged Total:</span><span>{fmt(calcCartTotalBuggy())}</span>
                      </div>
                    </div>
                    <button onClick={placeOrder} disabled={env.cart.length === 0}
                      className="w-full rounded-lg bg-emerald-600 py-2 font-mono text-sm font-bold text-white transition-all hover:bg-emerald-500 disabled:opacity-40 active:scale-95">
                      PLACE ORDER
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {mission.id === "banking" && (
          <>
            <div className="mb-4 rounded-xl bg-slate-900 p-4 ring-1 ring-slate-700/50">
              <p className="font-mono text-xs text-slate-400">Available Balance</p>
              <p className="font-mono text-3xl font-bold text-emerald-300">{fmt(env.balance)}</p>
            </div>

            {activeTab === "transfer" && (
              <div className="mx-auto max-w-md">
                <h4 className="font-mono text-lg font-bold text-white">Transfer Money</h4>
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="font-mono text-xs text-slate-400">To Account</label>
                    <input value={env.transferTo} onChange={e => onStateChange(s => ({ ...s, transferTo: e.target.value }))}
                      className="mt-1 w-full rounded-lg bg-slate-800 px-3 py-2 font-mono text-sm text-white ring-1 ring-slate-600" placeholder="Account number" />
                  </div>
                  <div>
                    <label className="font-mono text-xs text-slate-400">Amount ($)</label>
                    <input type="number" value={env.transferAmount || ""} onChange={e => onStateChange(s => ({ ...s, transferAmount: parseFloat(e.target.value) || 0 }))}
                      className="mt-1 w-full rounded-lg bg-slate-800 px-3 py-2 font-mono text-sm text-white ring-1 ring-slate-600" placeholder="0.00" />
                  </div>
                  <button onClick={doTransfer} className="w-full rounded-lg bg-sky-600 py-2 font-mono text-sm font-bold text-white transition-all hover:bg-sky-500 active:scale-95">
                    TRANSFER
                  </button>
                </div>
              </div>
            )}

            {activeTab === "deposit" && (
              <div className="mx-auto max-w-md">
                <h4 className="font-mono text-lg font-bold text-white">Deposit / Withdraw</h4>
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="font-mono text-xs text-slate-400">Deposit Amount ($)</label>
                    <input type="number" value={env.depositAmount || ""} onChange={e => onStateChange(s => ({ ...s, depositAmount: parseFloat(e.target.value) || 0 }))}
                      className="mt-1 w-full rounded-lg bg-slate-800 px-3 py-2 font-mono text-sm text-white ring-1 ring-slate-600" placeholder="0.00" />
                    <button onClick={doDeposit} className="mt-2 w-full rounded-lg bg-emerald-600 py-2 font-mono text-sm font-bold text-white transition-all hover:bg-emerald-500 active:scale-95">
                      DEPOSIT
                    </button>
                  </div>
                  <div className="border-t border-slate-700 pt-3">
                    <label className="font-mono text-xs text-slate-400">Withdraw Amount ($)</label>
                    <input type="number" value={env.withdrawAmount || ""} onChange={e => onStateChange(s => ({ ...s, withdrawAmount: parseFloat(e.target.value) || 0 }))}
                      className="mt-1 w-full rounded-lg bg-slate-800 px-3 py-2 font-mono text-sm text-white ring-1 ring-slate-600" placeholder="0.00" />
                    <button onClick={doWithdraw} className="mt-2 w-full rounded-lg bg-rose-600 py-2 font-mono text-sm font-bold text-white transition-all hover:bg-rose-500 active:scale-95">
                      WITHDRAW
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "history" && (
              <div className="mx-auto max-w-lg">
                <h4 className="font-mono text-lg font-bold text-white">Transaction History</h4>
                {env.transactions.length === 0 ? (
                  <p className="mt-4 font-mono text-sm text-slate-500">No transactions yet.</p>
                ) : (
                  <div className="mt-3 space-y-2">
                    {[...env.transactions].reverse().map((tx, i) => {
                      const idx = env.transactions.length - 1 - i;
                      const displayBal = hasBug("bank-03")
                        ? env.balance - tx.amount + (tx.type === "Transfer Out" ? tx.amount : 0)
                        : runningBalance(idx);
                      return (
                        <div key={tx.id} className="flex items-center justify-between rounded-lg bg-slate-900 p-3 ring-1 ring-slate-700/50">
                          <div>
                            <p className="font-mono text-sm text-white">{tx.type}</p>
                            <p className="font-mono text-[10px] text-slate-500">{tx.desc}</p>
                          </div>
                          <div className="text-right">
                            <p className={cn("font-mono text-sm font-bold", tx.type.includes("Out") || tx.type === "Withdrawal" ? "text-rose-300" : "text-emerald-300")}>
                              {tx.type.includes("Out") || tx.type === "Withdrawal" ? "-" : "+"}{fmt(tx.amount)}
                            </p>
                            <p className="font-mono text-[10px] text-slate-500">Bal: {fmt(displayBal)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Discovered bugs list */}
      {discoveredBugs.length > 0 && (
        <div className="mt-4 rounded-xl bg-slate-900/70 p-4 ring-1 ring-slate-700/50">
          <h4 className="font-mono text-sm font-bold text-emerald-300">Discovered Bugs ({discoveredBugs.length})</h4>
          <div className="mt-2 space-y-1">
            {discoveredBugs.map(bid => {
              const bug = mission.bugs.find(b => b.id === bid);
              if (!bug) return null;
              const sevColors: Record<Severity, string> = { critical: "text-rose-400", high: "text-amber-400", medium: "text-sky-400", low: "text-slate-400" };
              return (
                <div key={bid} className="flex items-center justify-between rounded-lg bg-slate-800/50 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-emerald-300">🐛</span>
                    <span className="font-mono text-xs text-slate-200">{bug.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn("font-mono text-[10px] font-bold", sevColors[bug.severity])}>
                      {bug.severity.toUpperCase()}
                    </span>
                    <button onClick={() => onReport(bug)} className="rounded bg-sky-600 px-2 py-0.5 font-mono text-[10px] text-white hover:bg-sky-500">
                      Report
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
