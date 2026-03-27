import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../utils/api";
import NotificationBell from "../components/NotificationBell";

/* ─── GOOGLE FONTS ─── */
const FONT_LINK = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400;1,700&family=Plus+Jakarta+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap";
const DASHBOARD_PAGES = new Set(['dashboard', 'invoices', 'transactions', 'customers', 'reports', 'staff', 'support', 'wallet', 'settings']);

/* ─── CSS ─── */
const css = `
@import url('${FONT_LINK}');
:root{
  --bg:#0a0a0b;--bg2:#111114;--bg3:#18181d;--bg4:#1e1e25;
  --border:#ffffff0f;--border2:#ffffff18;--border3:#ffffff24;
  --gold:#f5a623;--gold2:#e8931a;--gold-dim:#f5a62320;--gold-dim2:#f5a62340;
  --text:#f0ede8;--text2:#9e9b94;--text3:#5a5750;
  --green:#22c55e;--green-dim:#22c55e18;
  --red:#ef4444;--red-dim:#ef444418;
  --blue:#3b82f6;--blue-dim:#3b82f618;
  --purple:#a855f7;--purple-dim:#a855f718;
  --radius:12px;--radius2:8px;
}
.vd *{margin:0;padding:0;box-sizing:border-box}
.vd{display:flex;height:100vh;background:var(--bg);color:var(--text);font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;overflow:hidden;-webkit-font-smoothing:antialiased}

/* SIDEBAR */
.vd-sidebar{width:224px;min-width:224px;background:var(--bg2);border-right:1px solid var(--border);display:flex;flex-direction:column;position:relative;overflow:hidden}
.vd-sidebar::before{content:'';position:absolute;top:-80px;left:-60px;width:220px;height:220px;background:radial-gradient(circle,#f5a62312 0%,transparent 70%);pointer-events:none}
.vd-logo-wrap{padding:22px 20px 18px;border-bottom:1px solid var(--border)}
.vd-logo{display:flex;align-items:center;gap:11px}
.vd-logo-mark{width:34px;height:34px;background:var(--gold);border-radius:9px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.vd-logo-v{font-family:'Playfair Display',serif;font-size:18px;font-weight:700;font-style:italic;color:#0a0a0b;line-height:1}
.vd-logo-name{font-family:'Playfair Display',serif;font-size:18px;font-weight:700;font-style:italic;color:var(--text);letter-spacing:-.3px;line-height:1}
.vd-logo-name em{font-style:normal;color:var(--gold)}
.vd-logo-tag{font-family:'JetBrains Mono',monospace;font-size:8.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--text3)}
.vd-store-pill{margin:12px 20px 0;background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:8px 12px;display:flex;align-items:center;gap:8px;cursor:pointer;transition:.2s}
.vd-store-pill:hover{border-color:var(--border2)}
.vd-store-dot{width:7px;height:7px;border-radius:50%;background:var(--green);flex-shrink:0;box-shadow:0 0 6px var(--green)}
.vd-store-name{font-size:12px;font-weight:500;color:var(--text);flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.vd-nav{flex:1;padding:16px 12px;overflow-y:auto}
.vd-nav::-webkit-scrollbar{width:3px}
.vd-nav::-webkit-scrollbar-thumb{background:var(--bg4);border-radius:2px}
.vd-nav-section{margin-bottom:20px}
.vd-nav-label{font-size:9.5px;font-weight:500;letter-spacing:.12em;text-transform:uppercase;color:var(--text3);padding:0 8px;margin-bottom:6px;font-family:'JetBrains Mono',monospace}
.vd-nav-item{display:flex;align-items:center;gap:10px;padding:9px 10px;border-radius:var(--radius2);cursor:pointer;transition:.15s;color:var(--text2);font-size:13px;font-weight:500;position:relative;border:none;background:none;width:100%;text-align:left}
.vd-nav-item:hover{background:var(--bg3);color:var(--text)}
.vd-nav-item.active{background:var(--gold-dim);color:var(--gold)}
.vd-nav-item.active::before{content:'';position:absolute;left:0;top:50%;transform:translateY(-50%);width:3px;height:16px;background:var(--gold);border-radius:0 3px 3px 0}
.vd-nav-badge{margin-left:auto;background:var(--gold);color:#0a0a0b;font-size:9px;font-weight:700;padding:2px 6px;border-radius:20px}
.vd-sidebar-bottom{padding:14px 12px;border-top:1px solid var(--border)}
.vd-user-card{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:var(--radius2);cursor:pointer;transition:.15s}
.vd-user-card:hover{background:var(--bg3)}
.vd-avatar{width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,var(--gold),#e05e1a);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#0a0a0b;flex-shrink:0}
.vd-user-name{font-size:12px;font-weight:600;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.vd-user-role{font-size:10px;color:var(--text3)}
.vd-user-actions{margin-top:10px;padding:0 10px}
.vd-signout-btn{width:100%;display:flex;align-items:center;justify-content:center;gap:8px;padding:9px 12px;border-radius:var(--radius2);background:transparent;border:1px solid var(--border2);color:var(--text2);font-size:12px;font-weight:600;font-family:'Plus Jakarta Sans',sans-serif;cursor:pointer;transition:.15s}
.vd-signout-btn:hover{background:var(--bg3);color:var(--text);border-color:var(--border3)}
.vd-powered{padding:8px 20px 14px;text-align:center;font-family:'JetBrains Mono',monospace;font-size:8px;letter-spacing:.12em;text-transform:uppercase;color:var(--text3);opacity:.5}
.vd-powered span{color:#f5a62355}
.vd-presence-pill{display:inline-flex;align-items:center;gap:7px;padding:5px 10px;border-radius:999px;background:var(--bg3);border:1px solid var(--border2);font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.05em;color:var(--text2)}
.vd-presence-pill.live{border-color:var(--green-dim);background:var(--green-dim);color:var(--green)}
.vd-presence-dot{width:7px;height:7px;border-radius:50%;background:var(--text3);flex-shrink:0}
.vd-presence-pill.live .vd-presence-dot{background:var(--green);box-shadow:0 0 10px var(--green)}
.vd-typing-card{display:flex;gap:12px;margin-bottom:8px;padding:12px 14px;border-radius:12px;background:var(--bg3);border:1px solid var(--border)}
.vd-typing-copy{display:flex;flex-direction:column;gap:5px}
.vd-typing-label{font-size:11px;color:var(--text2);font-weight:600}
.vd-typing-sub{font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--text3);letter-spacing:.05em}
.vd-typing-dots{display:inline-flex;gap:4px;align-items:center}
.vd-typing-dots span{width:6px;height:6px;border-radius:50%;background:var(--gold);opacity:.35;animation:vdTyping 1s infinite ease-in-out}
.vd-typing-dots span:nth-child(2){animation-delay:.15s}
.vd-typing-dots span:nth-child(3){animation-delay:.3s}

/* MAIN */
.vd-main{flex:1;display:flex;flex-direction:column;overflow:hidden}
.vd-topbar{height:60px;border-bottom:1px solid var(--border);display:flex;align-items:center;padding:0 28px;gap:16px;background:var(--bg);flex-shrink:0}
.vd-page-title{font-family:'Playfair Display',serif;font-size:19px;font-weight:700;font-style:italic;color:var(--text);flex:1;letter-spacing:-.3px}
.vd-topbar-actions{display:flex;align-items:center;gap:10px}
.vd-content{flex:1;overflow-y:auto;padding:28px;scroll-behavior:smooth}
.vd-content::-webkit-scrollbar{width:6px}
.vd-content::-webkit-scrollbar-thumb{background:var(--bg4);border-radius:3px}

/* SHARED */
.vd-btn{display:inline-flex;align-items:center;gap:7px;padding:8px 16px;border-radius:var(--radius2);font-size:13px;font-weight:600;cursor:pointer;transition:.15s;border:none;font-family:'Plus Jakarta Sans',sans-serif;white-space:nowrap}
.vd-btn-ghost{background:transparent;color:var(--text2);border:1px solid var(--border2) !important}
.vd-btn-ghost:hover{background:var(--bg3);color:var(--text)}
.vd-btn-gold{background:var(--gold);color:#0a0a0b}
.vd-btn-gold:hover{background:var(--gold2);transform:translateY(-1px);box-shadow:0 4px 20px #f5a62340}
.vd-btn-sm{padding:6px 12px;font-size:12px}
.vd-icon-btn{width:36px;height:36px;border-radius:var(--radius2);background:var(--bg3);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:.15s;color:var(--text2);position:relative}
.vd-icon-btn:hover{background:var(--bg4);color:var(--text)}
.vd-notif-dot::after{content:'';position:absolute;top:7px;right:7px;width:6px;height:6px;border-radius:50%;background:var(--gold);border:1.5px solid var(--bg)}
.vd-search-wrap{position:relative}
.vd-search-input{background:var(--bg3);border:1px solid var(--border2);border-radius:var(--radius2);padding:8px 12px 8px 34px;font-size:12px;color:var(--text);font-family:'Plus Jakarta Sans',sans-serif;outline:none;transition:.15s;width:220px}
.vd-search-input:focus{border-color:var(--gold);width:260px}
.vd-search-input::placeholder{color:var(--text3)}
.vd-search-icon{position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--text3);font-size:13px;pointer-events:none}
.vd-card{background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;animation:vdFadeUp .4s ease both;animation-delay:.15s}
.vd-card-header{display:flex;align-items:center;justify-content:space-between;padding:18px 20px;border-bottom:1px solid var(--border);flex-wrap:wrap;gap:10px}
.vd-card-title{font-family:'Playfair Display',serif;font-size:14px;font-weight:700;font-style:italic;color:var(--text)}
.vd-card-sub{font-size:11px;color:var(--text3);margin-top:2px;font-family:'JetBrains Mono',monospace;letter-spacing:.04em}
.vd-section-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;flex-wrap:wrap;gap:10px}
.vd-section-title{font-family:'Playfair Display',serif;font-size:16px;font-weight:700;font-style:italic;color:var(--text)}
.vd-see-all{font-size:11px;font-weight:600;color:var(--gold);cursor:pointer;font-family:'JetBrains Mono',monospace;letter-spacing:.05em;background:none;border:none}
.vd-badge{display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:20px;font-size:10px;font-weight:600;font-family:'JetBrains Mono',monospace;letter-spacing:.06em;text-transform:uppercase}
.vd-badge-green{background:var(--green-dim);color:var(--green)}
.vd-badge-gold{background:var(--gold-dim);color:var(--gold)}
.vd-badge-red{background:var(--red-dim);color:var(--red)}
.vd-badge-blue{background:var(--blue-dim);color:var(--blue)}
.vd-badge-purple{background:var(--purple-dim);color:var(--purple)}
.vd-badge-gray{background:var(--bg4);color:var(--text3)}
.vd-filter-row{display:flex;gap:6px;align-items:center}
.vd-filter-btn{padding:6px 12px;border-radius:6px;font-size:11px;font-weight:600;cursor:pointer;color:var(--text3);transition:.15s;background:var(--bg3);border:1px solid var(--border);font-family:'JetBrains Mono',monospace;letter-spacing:.05em}
.vd-filter-btn:hover{color:var(--text);border-color:var(--border2)}
.vd-filter-btn.active{background:var(--gold-dim);color:var(--gold);border-color:var(--gold-dim2)}
.vd-live-dot{width:7px;height:7px;border-radius:50%;background:var(--green);animation:vdPulse 2s infinite;display:inline-block;margin-right:5px;vertical-align:middle}

/* STATS GRID */
.vd-stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:26px}
.vd-stat-card{background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:20px;position:relative;overflow:hidden;transition:.2s;animation:vdFadeUp .4s ease both}
.vd-stat-card:hover{border-color:var(--border2);transform:translateY(-2px)}
.vd-stat-card.highlight{border-color:var(--gold-dim2)}
.vd-stat-label{font-family:'JetBrains Mono',monospace;font-size:9.5px;font-weight:500;letter-spacing:.1em;text-transform:uppercase;color:var(--text3);margin-bottom:10px}
.vd-stat-val{font-family:'Playfair Display',serif;font-size:28px;font-weight:700;color:var(--text);letter-spacing:-.5px;margin-bottom:8px;line-height:1}
.vd-stat-val.gold{color:var(--gold)}
.vd-stat-unit{font-size:13px;font-weight:400;color:var(--text3);font-family:'Plus Jakarta Sans',sans-serif}
.vd-stat-trend{display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:600;padding:3px 8px;border-radius:20px}
.vd-trend-up{background:var(--green-dim);color:var(--green)}

/* GRID2 */
.vd-grid2{display:grid;grid-template-columns:1fr 370px;gap:18px;margin-bottom:18px}

/* CHART */
.vd-chart-wrap{padding:20px;height:200px}
.vd-chart-svg{width:100%;height:160px}
.vd-tab-row{display:flex;gap:4px}
.vd-tab{padding:5px 12px;border-radius:6px;font-size:11px;font-weight:600;cursor:pointer;color:var(--text3);transition:.15s;font-family:'JetBrains Mono',monospace;letter-spacing:.06em;background:none;border:none}
.vd-tab.active{background:var(--bg4);color:var(--text)}

/* QUICK ACTIONS */
.vd-quick-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:16px}
.vd-quick-item{background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius2);padding:14px;cursor:pointer;transition:.2s;text-align:center}
.vd-quick-item:hover{background:var(--bg4);border-color:var(--border2);transform:translateY(-1px)}
.vd-quick-icon{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;margin:0 auto 8px;font-size:16px}
.vd-quick-label{font-size:12px;font-weight:600;color:var(--text)}
.vd-quick-desc{font-size:10px;color:var(--text3);margin-top:2px;font-family:'JetBrains Mono',monospace;letter-spacing:.04em}

/* INVOICE LIST */
.vd-invoice-item{display:flex;align-items:center;gap:14px;padding:14px 20px;border-bottom:1px solid var(--border);cursor:pointer;transition:.15s}
.vd-invoice-item:last-child{border-bottom:none}
.vd-invoice-item:hover{background:var(--bg3)}
.vd-inv-icon{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:14px}
.vd-inv-icon.paid{background:var(--green-dim)}.vd-inv-icon.pending{background:var(--gold-dim)}.vd-inv-icon.expired{background:var(--bg4)}
.vd-inv-name{font-size:13px;font-weight:600;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.vd-inv-meta{font-size:11px;color:var(--text3);margin-top:2px;font-family:'JetBrains Mono',monospace;letter-spacing:.04em}
.vd-inv-usdt{font-family:'Playfair Display',serif;font-size:15px;font-weight:700;color:var(--text);text-align:right}
.vd-inv-status{font-size:10px;font-weight:600;margin-top:3px;font-family:'JetBrains Mono',monospace;letter-spacing:.06em;text-align:right}
.vd-inv-status.paid{color:var(--green)}.vd-inv-status.pending{color:var(--gold)}.vd-inv-status.expired{color:var(--text3)}

/* ACTIVITY */
.vd-activity-item{display:flex;gap:12px;padding:12px 20px;border-bottom:1px solid var(--border)}
.vd-activity-item:last-child{border-bottom:none}
.vd-act-dot-wrap{display:flex;flex-direction:column;align-items:center;padding-top:4px}
.vd-act-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
.vd-act-line{width:1px;flex:1;min-height:20px;background:var(--border);margin-top:4px}
.vd-act-text{font-size:12px;color:var(--text2);line-height:1.5}
.vd-act-text strong{color:var(--text);font-weight:600}
.vd-act-time{font-size:10px;color:var(--text3);margin-top:2px;font-family:'JetBrains Mono',monospace}

/* TRANSACTIONS */
.vd-tx-summary{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:20px}
.vd-tx-sum-card{background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:18px;position:relative;overflow:hidden}
.vd-tx-sum-card::before{content:'';position:absolute;top:0;left:0;width:3px;height:100%;border-radius:3px 0 0 3px}
.vd-tx-sum-card.s-green::before{background:var(--green)}
.vd-tx-sum-card.s-gold::before{background:var(--gold)}
.vd-tx-sum-card.s-blue::before{background:var(--blue)}
.vd-tx-sum-label{font-family:'JetBrains Mono',monospace;font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--text3);margin-bottom:8px}
.vd-tx-sum-val{font-family:'Playfair Display',serif;font-size:24px;font-weight:700;letter-spacing:-.5px;line-height:1}
.vd-tx-sum-val.green{color:var(--green)}.vd-tx-sum-val.gold{color:var(--gold)}.vd-tx-sum-val.blue{color:var(--blue)}
.vd-tx-sum-note{font-size:11px;color:var(--text3);margin-top:6px}
.vd-tx-table{width:100%;border-collapse:collapse}
.vd-tx-table th{font-family:'JetBrains Mono',monospace;font-size:9.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--text3);padding:12px 20px;text-align:left;border-bottom:1px solid var(--border);font-weight:500}
.vd-tx-table th:last-child{text-align:right}
.vd-tx-table td{padding:14px 20px;border-bottom:1px solid var(--border);vertical-align:middle;font-size:13px}
.vd-tx-table tr:last-child td{border-bottom:none}
.vd-tx-table tr:hover td{background:var(--bg3)}
.vd-tx-name{font-weight:600;color:var(--text);display:block}
.vd-tx-ref{font-size:11px;color:var(--text3);margin-top:2px;font-family:'JetBrains Mono',monospace}
.vd-tx-id{font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--text3);letter-spacing:.04em}
.vd-tx-amount{font-family:'Playfair Display',serif;font-size:15px;font-weight:700;color:var(--text);text-align:right;display:block}
.vd-tx-amount.green{color:var(--green)}
.vd-tx-date{font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--text3);letter-spacing:.04em}

/* CUSTOMERS */
.vd-cust-summary-row{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:20px}
.vd-cust-sum{background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:16px 18px}
.vd-cust-sum-lbl{font-family:'JetBrains Mono',monospace;font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--text3);margin-bottom:8px}
.vd-cust-sum-val{font-family:'Playfair Display',serif;font-size:22px;font-weight:700;color:var(--text);letter-spacing:-.4px}
.vd-cust-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px;margin-top:4px}
.vd-cust-card{background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:20px;cursor:pointer;transition:.2s}
.vd-cust-card:hover{border-color:var(--border2);transform:translateY(-2px)}
.vd-cust-avatar{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-family:'Playfair Display',serif;font-size:16px;font-weight:700;font-style:italic;flex-shrink:0}
.vd-cust-name{font-size:14px;font-weight:600;color:var(--text);margin-bottom:3px}
.vd-cust-since{font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--text3);letter-spacing:.04em}
.vd-cust-stats{display:grid;grid-template-columns:1fr 1fr 1fr;gap:1px;background:var(--border);border-radius:8px;overflow:hidden;margin-top:16px}
.vd-cust-stat{background:var(--bg3);padding:10px 12px;text-align:center}
.vd-cust-stat-val{font-family:'Playfair Display',serif;font-size:16px;font-weight:700;color:var(--text);letter-spacing:-.3px}
.vd-cust-stat-val.gold{color:var(--gold)}
.vd-cust-stat-lbl{font-family:'JetBrains Mono',monospace;font-size:8.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--text3);margin-top:3px}
.vd-cust-last{display:flex;align-items:center;justify-content:space-between;margin-top:14px;padding-top:14px;border-top:1px solid var(--border)}
.vd-cust-last-label{font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--text3);letter-spacing:.04em}

/* REPORTS */
.vd-report-stat-row{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:20px}
.vd-rstat{background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:18px;position:relative;overflow:hidden;animation:vdFadeUp .4s ease both;animation-delay:.15s}
.vd-rstat::after{content:'';position:absolute;top:0;right:0;width:60px;height:60px;border-radius:0 var(--radius) 0 60px;opacity:.04}
.vd-rstat.r-gold::after{background:var(--gold)}
.vd-rstat.r-green::after{background:var(--green)}
.vd-rstat.r-blue::after{background:var(--blue)}
.vd-rstat.r-purple::after{background:var(--purple)}
.vd-rstat-lbl{font-family:'JetBrains Mono',monospace;font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--text3);margin-bottom:8px}
.vd-rstat-val{font-family:'Playfair Display',serif;font-size:26px;font-weight:700;letter-spacing:-.5px;line-height:1;margin-bottom:6px}
.vd-rstat-val.gold{color:var(--gold)}.vd-rstat-val.green{color:var(--green)}.vd-rstat-val.blue{color:var(--blue)}.vd-rstat-val.purple{color:var(--purple)}
.vd-rstat-delta{font-size:11px;font-weight:600;display:inline-flex;align-items:center;gap:3px;padding:2px 7px;border-radius:20px}
.vd-reports-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-bottom:18px}
.vd-breakdown-item{display:flex;align-items:center;gap:14px;padding:14px 20px;border-bottom:1px solid var(--border)}
.vd-breakdown-item:last-child{border-bottom:none}
.vd-breakdown-rank{font-family:'Playfair Display',serif;font-size:18px;font-weight:700;font-style:italic;color:var(--text3);min-width:28px}
.vd-breakdown-name{font-size:13px;font-weight:600;color:var(--text)}
.vd-breakdown-count{font-size:11px;color:var(--text3);margin-top:2px;font-family:'JetBrains Mono',monospace}
.vd-breakdown-bar-wrap{width:120px;flex-shrink:0}
.vd-breakdown-bar-track{height:4px;background:var(--bg4);border-radius:2px;overflow:hidden;margin-bottom:4px}
.vd-breakdown-bar-fill{height:100%;border-radius:2px;background:var(--gold);transition:.6s}
.vd-breakdown-bar-fill{height:100%;border-radius:2px;background:var(--gold);transition:.6s}
.vd-breakdown-amount{font-family:'Playfair Display',serif;font-size:14px;font-weight:700;color:var(--text);text-align:right}
.vd-bar-chart-wrap{padding:20px 20px 8px;display:flex;align-items:flex-end;gap:8px;height:180px}
.vd-bar-col{flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;height:100%}
.vd-bar-track{flex:1;width:100%;display:flex;align-items:flex-end;justify-content:center}
.vd-bar-fill{width:100%;border-radius:4px 4px 0 0;transition:.8s;background:var(--gold);opacity:.7;min-height:4px}
.vd-bar-fill.active{opacity:1}
.vd-bar-label{font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--text3);letter-spacing:.06em}
.vd-export-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;padding:16px}
.vd-export-item{background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius2);padding:16px;cursor:pointer;transition:.2s;display:flex;gap:14px;align-items:center}
.vd-export-item:hover{background:var(--bg4);border-color:var(--border2)}
.vd-export-icon{width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0}
.vd-export-label{font-size:13px;font-weight:600;color:var(--text);margin-bottom:3px}
.vd-export-desc{font-size:11px;color:var(--text3);font-family:'JetBrains Mono',monospace;letter-spacing:.03em}
.vd-donut-wrap{display:flex;align-items:center;gap:24px;padding:20px}
.vd-donut-legend{flex:1}
.vd-donut-item{display:flex;align-items:center;gap:10px;margin-bottom:12px}
.vd-donut-item:last-child{margin-bottom:0}
.vd-donut-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0}
.vd-donut-lbl{flex:1;font-size:12px;color:var(--text2)}
.vd-donut-pct{font-family:'Playfair Display',serif;font-size:14px;font-weight:700;color:var(--text)}

/* STAFF */
.vd-staff-summary{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:20px}
.vd-staff-sum{background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:16px 18px}
.vd-staff-sum-lbl{font-family:'JetBrains Mono',monospace;font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--text3);margin-bottom:8px}
.vd-staff-sum-val{font-family:'Playfair Display',serif;font-size:24px;font-weight:700;color:var(--text);letter-spacing:-.4px}
.vd-staff-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px;margin-bottom:20px}
.vd-staff-card{background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:20px;transition:.2s;position:relative}
.vd-staff-card:hover{border-color:var(--border2)}
.vd-staff-card.owner{border-color:var(--gold-dim2)}
.vd-staff-avatar{width:46px;height:46px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:700;color:#0a0a0b;flex-shrink:0;font-family:'Playfair Display',serif;font-style:italic}
.vd-staff-name{font-size:14px;font-weight:600;color:var(--text);margin-bottom:4px}
.vd-staff-email{font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--text3);letter-spacing:.03em}
.vd-staff-perms{background:var(--bg3);border-radius:var(--radius2);padding:12px;margin-bottom:14px;margin-top:18px}
.vd-staff-perm-title{font-family:'JetBrains Mono',monospace;font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--text3);margin-bottom:10px}
.vd-perm-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
.vd-perm-row:last-child{margin-bottom:0}
.vd-perm-label{font-size:12px;color:var(--text2)}
.vd-perm-check{width:18px;height:18px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:9px}
.vd-perm-yes{background:var(--green-dim);color:var(--green)}
.vd-perm-no{background:var(--bg4);color:var(--text3)}
.vd-staff-foot{display:flex;align-items:center;justify-content:space-between}
.vd-staff-last{font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--text3);letter-spacing:.03em}
.vd-invite-card{background:var(--bg2);border:2px dashed var(--border2);border-radius:var(--radius);padding:32px;text-align:center;cursor:pointer;transition:.2s}
.vd-invite-card:hover{border-color:var(--gold-dim2);background:var(--gold-dim)}
.vd-invite-icon{font-size:28px;margin-bottom:10px;opacity:.5}
.vd-invite-label{font-size:13px;font-weight:600;color:var(--text2)}
.vd-invite-sub{font-size:11px;color:var(--text3);margin-top:4px;font-family:'JetBrains Mono',monospace}
.vd-empty{text-align:center;padding:60px 20px;color:var(--text3)}
.vd-empty-icon{font-size:36px;margin-bottom:12px;opacity:.3}
.vd-empty-text{font-size:13px;margin-bottom:16px}

/* MODAL */
.vd-overlay{position:fixed;inset:0;background:#00000085;backdrop-filter:blur(6px);z-index:100;display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;transition:.25s}
.vd-overlay.show{opacity:1;pointer-events:all}
.vd-modal{background:var(--bg2);border:1px solid var(--border2);border-radius:18px;width:490px;max-width:calc(100vw - 40px);max-height:calc(100vh - 60px);overflow-y:auto;transform:translateY(20px) scale(.97);transition:.25s;box-shadow:0 40px 100px #00000070}
.vd-overlay.show .vd-modal{transform:translateY(0) scale(1)}
.vd-modal-header{padding:26px 26px 0;display:flex;align-items:flex-start;justify-content:space-between}
.vd-modal-title{font-family:'Playfair Display',serif;font-size:22px;font-weight:700;font-style:italic;color:var(--text)}
.vd-modal-sub{font-size:12px;color:var(--text3);margin-top:5px;font-family:'JetBrains Mono',monospace;letter-spacing:.05em}
.vd-close-btn{width:32px;height:32px;border-radius:8px;background:var(--bg4);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--text2);transition:.15s;flex-shrink:0}
.vd-close-btn:hover{background:var(--bg3);color:var(--text)}
.vd-modal-body{padding:24px 26px}
.vd-form-group{margin-bottom:18px}
.vd-form-label{font-size:11px;font-weight:600;color:var(--text2);margin-bottom:7px;display:block;letter-spacing:.08em;text-transform:uppercase;font-family:'JetBrains Mono',monospace}
.vd-form-input{width:100%;background:var(--bg3);border:1px solid var(--border2);border-radius:var(--radius2);padding:11px 14px;font-size:13px;color:var(--text);font-family:'Plus Jakarta Sans',sans-serif;outline:none;transition:.15s}
.vd-form-input:focus{border-color:var(--gold);box-shadow:0 0 0 3px var(--gold-dim)}
.vd-form-input::placeholder{color:var(--text3)}
.vd-form-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.vd-asset-select{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px}
.vd-asset-opt{background:var(--bg3);border:1.5px solid var(--border);border-radius:var(--radius2);padding:10px;text-align:center;cursor:pointer;transition:.15s}
.vd-asset-opt.selected{border-color:var(--gold);background:var(--gold-dim)}
.vd-asset-opt-icon{font-size:18px;margin-bottom:4px}
.vd-asset-opt-name{font-size:11px;font-weight:600;color:var(--text);font-family:'JetBrains Mono',monospace}
.vd-asset-opt-bal{font-size:9px;color:var(--text3);margin-top:1px}
.vd-expiry-row{display:flex;gap:8px}
.vd-expiry-opt{flex:1;background:var(--bg3);border:1.5px solid var(--border);border-radius:var(--radius2);padding:8px;text-align:center;cursor:pointer;font-size:11px;font-weight:600;color:var(--text3);transition:.15s;font-family:'JetBrains Mono',monospace}
.vd-expiry-opt.selected{border-color:var(--gold);color:var(--gold);background:var(--gold-dim)}
.vd-amount-wrap{position:relative}
.vd-amount-wrap .vd-form-input{padding-right:65px;font-family:'Playfair Display',serif;font-size:22px;font-weight:700}
.vd-amount-currency{position:absolute;right:14px;top:50%;transform:translateY(-50%);font-size:11px;font-weight:600;color:var(--text3);font-family:'JetBrains Mono',monospace}
.vd-invoice-preview{background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius2);padding:16px;margin-bottom:18px}
.vd-preview-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;font-size:12px}
.vd-preview-row:last-child{margin-bottom:0;padding-top:10px;border-top:1px solid var(--border)}
.vd-preview-label{color:var(--text3);font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.06em;text-transform:uppercase}
.vd-preview-val{color:var(--text);font-weight:600}
.vd-preview-val.gold{color:var(--gold);font-family:'Playfair Display',serif;font-size:18px;font-weight:700;font-style:italic}
.vd-modal-footer{padding:0 26px 26px;display:flex;gap:10px}
.vd-modal-footer .vd-btn{flex:1;justify-content:center;padding:13px}
.vd-success-state{text-align:center;padding:20px 0}
.vd-success-icon{width:64px;height:64px;border-radius:50%;background:var(--green-dim);border:2px solid var(--green);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:28px}
.vd-success-title{font-family:'Playfair Display',serif;font-size:22px;font-weight:700;font-style:italic;color:var(--gold);margin-bottom:6px}
.vd-success-sub{font-size:12px;color:var(--text3);line-height:1.6;font-family:'JetBrains Mono',monospace}
.vd-qr-mock{width:120px;height:120px;background:var(--bg4);border-radius:10px;margin:20px auto;display:grid;grid-template-columns:repeat(7,1fr);gap:2px;padding:10px}
.vd-qr-c{background:var(--text);border-radius:1px}.vd-qr-c.e{background:transparent}
.vd-share-row{display:flex;gap:8px;margin-top:16px}
.vd-share-input{flex:1;background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius2);padding:9px 12px;font-size:11px;color:var(--text2);font-family:'JetBrains Mono',monospace;outline:none;letter-spacing:.03em}
.vd-copy-btn{padding:9px 14px;background:var(--bg4);border:1px solid var(--border2);border-radius:var(--radius2);font-size:11px;font-weight:600;color:var(--text);cursor:pointer;white-space:nowrap;transition:.15s;font-family:'Plus Jakarta Sans',sans-serif}
.vd-copy-btn:hover{background:var(--bg3)}
.vd-copy-btn.copied{background:var(--green-dim);color:var(--green);border-color:var(--green)}

/* TOAST */
.vd-toast{position:fixed;bottom:24px;right:24px;background:var(--bg3);border:1px solid var(--border2);border-radius:var(--radius);padding:14px 18px;display:flex;align-items:center;gap:10px;font-size:13px;color:var(--text);z-index:200;transform:translateY(80px);opacity:0;transition:.3s;box-shadow:0 20px 60px #00000060}
.vd-toast.show{transform:translateY(0);opacity:1}

/* ANIMATIONS */
@keyframes vdFadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes vdPulse{0%,100%{opacity:1}50%{opacity:.5}}
@keyframes vdSpin{to{transform:rotate(360deg)}}
@keyframes vdTyping{0%,80%,100%{transform:translateY(0);opacity:.25}40%{transform:translateY(-3px);opacity:1}}
`;

/* ─── DATA ─── */
const INVOICES_DATA = [
  {id:'INV-00119',name:'Balogun Traders',ref:'Ankara fabric x20',amount:'1,200.00',status:'paid',time:'2 min ago',date:'Jan 20, 2026'},
  {id:'INV-00118',name:'Fatima Stores',ref:'Lace material x10',amount:'450.00',status:'pending',time:'18 min ago',date:'Jan 20, 2026'},
  {id:'INV-00117',name:'Chukwu & Sons',ref:'Silk fabric bulk',amount:'3,800.00',status:'paid',time:'1 hr ago',date:'Jan 20, 2026'},
  {id:'INV-00116',name:'Kemi Fashion',ref:'Design consultation',amount:'150.00',status:'expired',time:'3 hrs ago',date:'Jan 19, 2026'},
  {id:'INV-00115',name:'Adewale Ltd',ref:'Monthly supply',amount:'6,500.00',status:'paid',time:'Yesterday',date:'Jan 19, 2026'},
  {id:'INV-00114',name:'Grace Couture',ref:'Wedding fabric',amount:'2,100.00',status:'pending',time:'Yesterday',date:'Jan 18, 2026'},
  {id:'INV-00113',name:'Balogun Traders',ref:'Ankara fabric x30',amount:'1,800.00',status:'paid',time:'2 days ago',date:'Jan 18, 2026'},
  {id:'INV-00112',name:'Nkechi Designs',ref:'Embroidery thread',amount:'320.00',status:'paid',time:'2 days ago',date:'Jan 17, 2026'},
];
const ACTIVITIES = [
  {dot:'#22c55e',text:<><strong>INV-00119</strong> paid by Balogun Traders — 1,200 USDT settled</>,time:'2 minutes ago'},
  {dot:'#f5a623',text:<><strong>INV-00118</strong> created for Fatima Stores — awaiting payment</>,time:'18 minutes ago'},
  {dot:'#22c55e',text:<><strong>INV-00117</strong> paid — 3,800 USDT confirmed on-chain</>,time:'1 hour ago'},
  {dot:'#ef4444',text:<><strong>INV-00116</strong> expired — no payment from Kemi Fashion</>,time:'3 hours ago'},
  {dot:'#3b82f6',text:<>New customer <strong>Adewale Ltd</strong> added to directory</>,time:'Yesterday'},
];
const CUSTOMERS = [
  {name:'Balogun Traders',initials:'BT',color:'#f5a623',since:'Oct 2025',invoices:18,paid:16,total:'24,600',last:'Jan 20, 2026',status:'active'},
  {name:'Adewale Ltd',initials:'AL',color:'#22c55e',since:'Aug 2025',invoices:12,paid:12,total:'18,400',last:'Jan 19, 2026',status:'active'},
  {name:'Chukwu & Sons',initials:'CS',color:'#3b82f6',since:'Sep 2025',invoices:9,paid:8,total:'15,200',last:'Jan 20, 2026',status:'active'},
  {name:'Grace Couture',initials:'GC',color:'#a855f7',since:'Nov 2025',invoices:7,paid:5,total:'9,800',last:'Jan 18, 2026',status:'pending'},
  {name:'Fatima Stores',initials:'FS',color:'#f5a623',since:'Dec 2025',invoices:5,paid:4,total:'6,750',last:'Jan 20, 2026',status:'pending'},
  {name:'Kemi Fashion',initials:'KF',color:'#ef4444',since:'Jan 2026',invoices:4,paid:3,total:'4,200',last:'Jan 19, 2026',status:'active'},
  {name:'Nkechi Designs',initials:'ND',color:'#22c55e',since:'Jan 2026',invoices:3,paid:3,total:'3,100',last:'Jan 17, 2026',status:'active'},
  {name:'Tunde Supplies',initials:'TS',color:'#3b82f6',since:'Dec 2025',invoices:6,paid:5,total:'11,200',last:'Jan 15, 2026',status:'active'},
];
const STAFF_DATA = [
  {name:'Amaka Okafor',initials:'AO',color:'linear-gradient(135deg,#f5a623,#e05e1a)',email:'amaka@veya.app',role:'owner',roleLabel:'Owner',lastSeen:'Now',perms:{invoices:true,reports:true,staff:true,export:true,settings:true}},
  {name:'Emeka Eze',initials:'EE',color:'linear-gradient(135deg,#3b82f6,#1d4ed8)',email:'emeka@veya.app',role:'manager',roleLabel:'Manager',lastSeen:'1 hr ago',perms:{invoices:true,reports:true,staff:false,export:true,settings:false}},
  {name:'Blessing Obi',initials:'BO',color:'linear-gradient(135deg,#22c55e,#15803d)',email:'blessing@veya.app',role:'cashier',roleLabel:'Cashier',lastSeen:'3 hrs ago',perms:{invoices:true,reports:false,staff:false,export:false,settings:false}},
  {name:'Tunde Adeyemi',initials:'TA',color:'linear-gradient(135deg,#a855f7,#7e22ce)',email:'tunde@veya.app',role:'cashier',roleLabel:'Cashier',lastSeen:'Yesterday',perms:{invoices:true,reports:false,staff:false,export:false,settings:false}},
];
const CHARTS = {
  '7d':[320,580,420,890,650,1100,780],
  '1m':[2100,3400,2800,4200,3100,5600,4800],
  '3m':[8200,11000,9400,13500,11800,15200,18000],
};
const QR_PATTERN = [1,0,1,0,1,0,1,0,1,1,0,1,1,0,1,0,0,1,0,1,1,0,1,0,1,1,0,0,1,0,1,0,1,0,1,0,1,1,0,1,0,0,1,1,0,1,0,0,1];
const STATUS_ICONS = {paid:'✓',pending:'◉',expired:'○'};
const PERM_LABELS = {invoices:'Create Invoices',reports:'View Reports',staff:'Manage Staff',export:'Export Data',settings:'Store Settings'};
const ROLE_BADGE = {owner:'vd-badge-gold',manager:'vd-badge-blue',cashier:'vd-badge-green'};
const PAGE_TITLES = {dashboard:'Dashboard',invoices:'Invoices',transactions:'Transactions',customers:'Customers',reports:'Reports',staff:'Staff & Permissions',wallet:'RGB Wallet',settings:'Settings'};

/* ─── ANIMATED NUMBER ─── */
function useAnimatedNum(target, duration = 1200) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(ease * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target]);
  return val.toLocaleString();
}

/* ─── SVG CHART ─── */
function RevenueChart({ data }) {
  const W = 500, H = 140, pad = 20;
  const max = Math.max(...data);
  const pts = data.map((v, i) => ({
    x: pad + (i / (data.length - 1)) * (W - pad * 2),
    y: H - pad - ((v / max) * (H - pad * 2)),
  }));
  const area = pts.map((p, i) => i === 0 ? `M${p.x},${p.y}` : `C${pts[i-1].x+30},${pts[i-1].y} ${p.x-30},${p.y} ${p.x},${p.y}`).join(' ');
  const filled = area + ` L${pts[pts.length-1].x},${H-pad} L${pts[0].x},${H-pad} Z`;
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  return (
    <svg className="vd-chart-svg" viewBox="0 0 500 160" preserveAspectRatio="none">
      <defs>
        <linearGradient id="vdChartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f5a623" stopOpacity="0.22"/>
          <stop offset="100%" stopColor="#f5a623" stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={filled} fill="url(#vdChartGrad)"/>
      <path d={area} fill="none" stroke="#f5a623" strokeWidth="2" strokeLinecap="round"/>
      {pts.map((p, i) => i === pts.length - 1 ? (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="8" fill="#f5a62328"/>
          <circle cx={p.x} cy={p.y} r="4" fill="#f5a623"/>
        </g>
      ) : null)}
      {[0,1,2,3].map(i => (
        <line key={i} x1={pad} y1={pad+i*((H-pad*2)/3)} x2={W-pad} y2={pad+i*((H-pad*2)/3)} stroke="#ffffff07" strokeWidth="1"/>
      ))}
      {days.map((d, i) => (
        <text key={d} x={pad+(i/6)*(W-pad*2)} y={H-2} textAnchor="middle" fontSize="9.5" fill="#5a5750" fontFamily="JetBrains Mono" letterSpacing="0.05em">{d}</text>
      ))}
    </svg>
  );
}

/* ─── DONUT CHART ─── */
function DonutChart() {
  const total=164,paid=142,pending=14,expired=8;
  const r=52,cx=64,cy=64,circ=2*Math.PI*r;
  const segs = [
    {d:(paid/total)*circ,color:'#22c55e',label:'Paid',pct:Math.round((paid/total)*100)+'%',off:0},
    {d:(pending/total)*circ,color:'#f5a623',label:'Pending',pct:Math.round((pending/total)*100)+'%',off:(paid/total)*circ},
    {d:(expired/total)*circ,color:'#ef4444',label:'Expired',pct:Math.round((expired/total)*100)+'%',off:(paid/total)*circ+(pending/total)*circ},
  ];
  return (
    <div className="vd-donut-wrap">
      <svg width="128" height="128" viewBox="0 0 128 128">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1e1e25" strokeWidth="20"/>
        {segs.map((s,i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth="20"
            strokeDasharray={`${s.d} ${circ-s.d}`} strokeDashoffset={-s.off+circ/4} strokeLinecap="butt"/>
        ))}
        <text x={cx} y={cy-6} textAnchor="middle" fontFamily="'Playfair Display',serif" fontSize="20" fontWeight="700" fill="#f0ede8">{total}</text>
        <text x={cx} y={cy+12} textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontSize="9" fill="#5a5750" letterSpacing="0.05em">INVOICES</text>
      </svg>
      <div className="vd-donut-legend">
        {segs.map((s,i) => (
          <div className="vd-donut-item" key={i}>
            <div className="vd-donut-dot" style={{background:s.color}}/>
            <div className="vd-donut-lbl">{s.label}</div>
            <div className="vd-donut-pct">{s.pct}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── INVOICE ITEM ─── */
function InvoiceItem({inv}) {
  return (
    <div className="vd-invoice-item">
      <div className={`vd-inv-icon ${inv.status}`}>{STATUS_ICONS[inv.status]}</div>
      <div style={{flex:1,minWidth:0}}>
        <div className="vd-inv-name">{inv.name}</div>
        <div className="vd-inv-meta">{inv.id} · {inv.ref}</div>
      </div>
      <div>
        <div className="vd-inv-usdt">{inv.amount}</div>
        <div className={`vd-inv-status ${inv.status}`}>{inv.status.toUpperCase()}</div>
      </div>
    </div>
  );
}

/* ─── INVOICE MODAL ─── */
function InvoiceModal({show, onClose, onCreated}) {
  const [step, setStep] = useState(1);
  const [asset, setAsset] = useState(0);
  const [expiry, setExpiry] = useState('1 Day');
  const [amount, setAmount] = useState('');
  const [customer, setCustomer] = useState('');
  const [ref, setRef] = useState('');
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const invCountRef = useRef(119);

  const preview = {
    amount: (parseFloat(amount||0)).toLocaleString('en',{minimumFractionDigits:2,maximumFractionDigits:2})+' USDT',
    customer: customer || '—', ref: ref || '—', expiry,
  };

  const handleGenerate = async () => {
    try {
      const response = await api.post('/invoices', {
        amount: parseFloat(amount),
        customerName: customer,
        reference: ref || `Payment for ${customer}`,
        expiryHours: expiry === '1 Hr' ? 1 : expiry === '6 Hrs' ? 6 : expiry === '1 Day' ? 24 : 48
      });

      const newInvoice = response.data;
      invCountRef.current++;
      setResult({
        invId: newInvoice.invoiceNum,
        fAmt: Number(newInvoice.amount || 0).toLocaleString(),
        customer: customer || 'Customer',
        expiry
      });

      onCreated(newInvoice);
      setStep(2);
    } catch (error) {
      console.error('Failed to create invoice:', error);
      alert(error.response?.data?.error || 'Failed to create invoice');
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => { setStep(1); setAmount(''); setCustomer(''); setRef(''); setResult(null); setCopied(false); }, 300);
  };

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const assets = [{icon:'💵',name:'tUSDT',bal:'Bal: 2,450'},{icon:'🟠',name:'BTC',bal:'Bal: 0.042'},{icon:'🔷',name:'RGB20',bal:'Custom'}];
  const expiries = ['1 Hr','6 Hrs','1 Day','2 Days'];

  return (
    <div className={`vd-overlay${show?' show':''}`} onClick={e => e.target === e.currentTarget && handleClose()}>
      <div className="vd-modal">
        {step === 1 ? (
          <>
            <div className="vd-modal-header">
              <div><div className="vd-modal-title">New Invoice</div><div className="vd-modal-sub">Create a USDT invoice for your customer</div></div>
              <button className="vd-close-btn" onClick={handleClose}>✕</button>
            </div>
            <div className="vd-modal-body">
              <div className="vd-form-group">
                <label className="vd-form-label">Asset</label>
                <div className="vd-asset-select">
                  {assets.map((a,i) => (
                    <div key={i} className={`vd-asset-opt${asset===i?' selected':''}`} onClick={() => setAsset(i)}>
                      <div className="vd-asset-opt-icon">{a.icon}</div>
                      <div className="vd-asset-opt-name">{a.name}</div>
                      <div className="vd-asset-opt-bal">{a.bal}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="vd-form-group">
                <label className="vd-form-label">Amount</label>
                <div className="vd-amount-wrap">
                  <input className="vd-form-input" type="number" placeholder="0.00" value={amount} onChange={e=>setAmount(e.target.value)}/>
                  <span className="vd-amount-currency">USDT</span>
                </div>
              </div>
              <div className="vd-form-row">
                <div className="vd-form-group" style={{margin:0}}>
                  <label className="vd-form-label">Customer Name</label>
                  <input className="vd-form-input" placeholder="e.g. Ade Stores" value={customer} onChange={e=>setCustomer(e.target.value)}/>
                </div>
                <div className="vd-form-group" style={{margin:0}}>
                  <label className="vd-form-label">Reference</label>
                  <input className="vd-form-input" placeholder="e.g. Fabric supply" value={ref} onChange={e=>setRef(e.target.value)}/>
                </div>
              </div>
              <div className="vd-form-group" style={{marginTop:18}}>
                <label className="vd-form-label">Invoice Expiry</label>
                <div className="vd-expiry-row">
                  {expiries.map(e => (
                    <div key={e} className={`vd-expiry-opt${expiry===e?' selected':''}`} onClick={()=>setExpiry(e)}>{e}</div>
                  ))}
                </div>
              </div>
              <div className="vd-form-group" style={{marginBottom:0}}>
                <label className="vd-form-label">Preview</label>
                <div className="vd-invoice-preview">
                  {[['Customer',preview.customer],['Reference',preview.ref],['Expiry',preview.expiry],['Total',preview.amount]].map(([l,v],i) => (
                    <div className="vd-preview-row" key={i}>
                      <span className="vd-preview-label">{l}</span>
                      <span className={`vd-preview-val${i===3?' gold':''}`}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="vd-modal-footer">
              <button className="vd-btn vd-btn-ghost" onClick={handleClose}>Cancel</button>
              <button className="vd-btn vd-btn-gold" onClick={handleGenerate}>Generate Invoice →</button>
            </div>
          </>
        ) : (
          <>
            <div className="vd-modal-header">
              <div><div className="vd-modal-title">Invoice Created</div><div className="vd-modal-sub">Share with your customer to receive payment</div></div>
              <button className="vd-close-btn" onClick={handleClose}>✕</button>
            </div>
            <div className="vd-modal-body">
              <div className="vd-success-state">
                <div className="vd-success-icon">✓</div>
                <div className="vd-success-title">{result?.fAmt} USDT</div>
                <div className="vd-success-sub">Invoice for <strong>{result?.customer}</strong> · Expires in {result?.expiry}<br/><span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,letterSpacing:'.06em'}}>{result?.invId} · Settled via Veya</span></div>
              </div>
              <div style={{textAlign:'center'}}>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,letterSpacing:'.15em',textTransform:'uppercase',color:'var(--text3)',marginBottom:8}}>Scan to Pay</div>
                <div className="vd-qr-mock">
                  {QR_PATTERN.map((v,i) => <div key={i} className={`vd-qr-c${v?'':' e'}`}/>)}
                </div>
              </div>
              <div className="vd-share-row">
                <input className="vd-share-input" readOnly value={`veya.app/pay/${result?.invId?.toLowerCase().replace('-','/')}`}/>
                <button className={`vd-copy-btn${copied?' copied':''}`} onClick={handleCopy}>{copied?'Copied!':'Copy Link'}</button>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginTop:10}}>
                <button className="vd-btn vd-btn-ghost" style={{justifyContent:'center',fontSize:12}}>📲 Share via WhatsApp</button>
                <button className="vd-btn vd-btn-ghost" style={{justifyContent:'center',fontSize:12}}>📄 Download PDF</button>
              </div>
            </div>
            <div className="vd-modal-footer">
              <button className="vd-btn vd-btn-ghost" onClick={()=>setStep(1)}>← Create Another</button>
              <button className="vd-btn vd-btn-gold" onClick={handleClose}>Done</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── TOAST ─── */
function Toast({message, show}) {
  return <div className={`vd-toast${show?' show':''}`}><span>✅</span><span>{message}</span></div>;
}

/* ─── PAGE: DASHBOARD ─── */
function PageDashboard({ user, onNewInvoice, onNav, realStats, realInvoices, loading }) {
  const [chartTab, setChartTab] = useState('7d');

  return (
    <>
      <div className="vd-stats-grid">
        {!user?.permissions || user?.permissions?.canViewReports ? (
          loading ? (
            <>
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="vd-stat-card" style={{ opacity: 0.6 }}>
                  <div className="vd-stat-label">Loading...</div>
                  <div className="vd-stat-val">—</div>
                </div>
              ))}
            </>
          ) : (
            <>
              <div className="vd-stat-card highlight">
                <div className="vd-stat-label">Total Volume</div>
                <div className="vd-stat-val">{Number(realStats.totalVolume || 0).toLocaleString()} <span className="vd-stat-unit">USDT</span></div>
                <span className="vd-stat-trend vd-trend-up">From real transactions</span>
              </div>
              <div className="vd-stat-card">
                <div className="vd-stat-label">Paid Invoices</div>
                <div className="vd-stat-val">{realStats.invoicesPaid}</div>
                <span className="vd-stat-trend vd-trend-up">Settled</span>
              </div>
              <div className="vd-stat-card">
                <div className="vd-stat-label">Pending</div>
                <div className="vd-stat-val">{realStats.pending}</div>
                <span className="vd-stat-trend">Awaiting payment</span>
              </div>
              <div className="vd-stat-card">
                <div className="vd-stat-label">Customers</div>
                <div className="vd-stat-val">{realStats.customers}</div>
                <span className="vd-stat-trend vd-trend-up">Total customers</span>
              </div>
            </>
          )
        ) : (
          <div className="vd-stat-card highlight" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
            <div className="vd-stat-val" style={{ fontSize: '24px', fontStyle: 'italic', color: 'var(--gold)' }}>Welcome back, {user?.firstName}!</div>
            <div className="vd-stat-label" style={{ marginTop: '8px', textTransform: 'none', letterSpacing: '0' }}>You are logged in to <strong>{user?.merchant?.storeName}</strong> as a <strong>{user?.staffRole || 'Staff Member'}</strong>.</div>
          </div>
        )}
      </div>
      <div className="vd-grid2">
        {(!user?.permissions || user?.permissions?.canViewReports) && (
          <div className="vd-card">
            <div className="vd-card-header">
              <div><div className="vd-card-title"><span className="vd-live-dot"/>Revenue Overview</div><div className="vd-card-sub">Settlement volume in USDT</div></div>
              <div className="vd-tab-row">
                {['7d','1m','3m'].map(t => (
                  <button key={t} className={`vd-tab${chartTab===t?' active':''}`} onClick={()=>setChartTab(t)}>{t.toUpperCase()}</button>
                ))}
              </div>
            </div>
            <div className="vd-chart-wrap">
              {realInvoices.filter(i => i.status === 'PAID').length === 0 ? (
                <div style={{height:140,display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text3)',flexDirection:'column',gap:8}}>
                  <span style={{fontSize:32,opacity:0.3}}>📊</span>
                  <span style={{fontSize:12}}>No revenue data yet. Create your first invoice to see the chart.</span>
                </div>
              ) : (
                <RevenueChart data={CHARTS[chartTab]}/>
              )}
            </div>
          </div>
        )}
        <div className="vd-card" style={(!user?.permissions || user?.permissions?.canViewReports) ? {} : { gridColumn: '1 / -1' }}>
          <div className="vd-card-header"><div><div className="vd-card-title">Quick Actions</div><div className="vd-card-sub">Common tasks</div></div></div>
          <div className="vd-quick-grid">
            {[
              {icon:'📄',label:'New Invoice',desc:'Create & share',bg:'var(--gold-dim)',onClick:onNewInvoice},
              {icon:'🔗',label:'Pay Link',desc:'Shareable URL',bg:'var(--blue-dim)',onClick:()=>{}},
              {icon:'📊',label:'Export CSV',desc:'Transaction report',bg:'var(--green-dim)',onClick:()=>onNav('reports')},
              {icon:'👥',label:'Add Customer',desc:'Save contact',bg:'var(--purple-dim)',onClick:()=>onNav('customers')},
            ].map(({icon,label,desc,bg,onClick},i) => (
              <div key={i} className="vd-quick-item" onClick={onClick}>
                <div className="vd-quick-icon" style={{background:bg}}>{icon}</div>
                <div className="vd-quick-label">{label}</div>
                <div className="vd-quick-desc">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="vd-grid2">
        <div className="vd-card">
          <div className="vd-card-header">
            <div className="vd-card-title">Recent Invoices</div>
            <button className="vd-see-all" onClick={() => onNav('invoices')}>See all →</button>
          </div>
          <div>
            {loading ? (
              <div className="vd-empty">Loading your invoices...</div>
            ) : realInvoices.length === 0 ? (
              <div className="vd-empty">
                <div className="vd-empty-icon">📄</div>
                <div className="vd-empty-text">No invoices yet. Create your first invoice →</div>
              </div>
            ) : (
              realInvoices.slice(0, 4).map((inv) => (
                <div key={inv.id} className="vd-invoice-item">
                  <div className={`vd-inv-icon ${inv.status.toLowerCase()}`}>
                    {inv.status === 'PAID' ? '✓' : inv.status === 'PENDING' ? '◉' : '○'}
                  </div>
                  <div style={{flex:1, minWidth:0}}>
                    <div className="vd-inv-name">{inv.customer?.name || 'Customer'}</div>
                    <div className="vd-inv-meta">{inv.invoiceNum} · {inv.reference}</div>
                  </div>
                  <div>
                    <div className="vd-inv-usdt">{Number(inv.amount || 0).toLocaleString()} USDT</div>
                    <div className={`vd-inv-status ${inv.status.toLowerCase()}`}>
                      {inv.status.toLowerCase()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="vd-card">
          <div className="vd-card-header">
            <div className="vd-card-title">Live Activity</div>
            <button className="vd-see-all" onClick={() => onNav('transactions')}>View log →</button>
          </div>
          <div>
            {loading ? (
              <div className="vd-empty">Loading activity...</div>
            ) : realInvoices.length === 0 ? (
              <div className="vd-empty">No activity yet</div>
            ) : (
              realInvoices.slice(0, 4).map((inv, i) => (
                <div className="vd-activity-item" key={inv.id} style={{cursor:'pointer'}} onClick={() => window.open(`/pay/${inv.invoiceNum}`, '_blank')}>
                  <div className="vd-act-dot-wrap">
                    <div className="vd-act-dot" style={{
                      background: inv.status === 'PAID' ? '#22c55e' :
                                 inv.status === 'PENDING' ? '#f5a623' : '#ef4444'
                    }}/>
                    {i < 3 && <div className="vd-act-line"/>}
                  </div>
                  <div style={{flex:1}}>
                    <div className="vd-act-text">
                      <strong>{inv.invoiceNum}</strong>
                      {inv.status === 'PAID' ? ' paid by ' : ' created for '}
                      {inv.customer?.name || 'customer'} — {Number(inv.amount || 0).toLocaleString()} USDT
                      {inv.status === 'PAID' ? ' settled' : ' awaiting payment'}
                    </div>
                    <div className="vd-act-time">
                      {new Date(inv.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── PAGE: INVOICES ─── */
function PageInvoices({realInvoices, onNewInvoice, loading}) {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all'
    ? realInvoices
    : realInvoices.filter(i => i.status?.toLowerCase() === filter);
  return (
    <>
      <div className="vd-section-row">
        <div className="vd-section-title">All Invoices</div>
        <button className="vd-btn vd-btn-gold" onClick={onNewInvoice}><span>+</span> New Invoice</button>
      </div>
      <div className="vd-card">
        <div className="vd-card-header">
          <div className="vd-search-wrap"><span className="vd-search-icon">🔍</span><input className="vd-search-input" placeholder="Search invoices..." style={{width:260}}/></div>
          <div className="vd-filter-row">
            {['all','paid','pending','expired'].map(f => (
              <button key={f} className={`vd-filter-btn${filter===f?' active':''}`} onClick={()=>setFilter(f)}>{f.charAt(0).toUpperCase()+f.slice(1)}</button>
            ))}
            <button className="vd-btn vd-btn-ghost vd-btn-sm">Export</button>
          </div>
        </div>
        <div>
          {loading ? (
            <div className="vd-empty">Loading your invoices...</div>
          ) : filtered.length ? filtered.map((inv) => (
            <div key={inv.id} className="vd-invoice-item" onClick={() => window.open(`/pay/${inv.invoiceNum}`, '_blank')}>
              <div className={`vd-inv-icon ${inv.status.toLowerCase()}`}>{inv.status === 'PAID' ? '✓' : inv.status === 'PENDING' ? '◉' : '○'}</div>
              <div style={{flex:1,minWidth:0}}>
                <div className="vd-inv-name">{inv.customer?.name || 'Customer'}</div>
                <div className="vd-inv-meta">{inv.invoiceNum} · {inv.reference}</div>
              </div>
              <div style={{display:'flex', alignItems:'center', gap:15}}>
                <div style={{textAlign:'right'}}>
                  <div className="vd-inv-usdt">{Number(inv.amount || 0).toLocaleString()} USDT</div>
                  <div className={`vd-inv-status ${inv.status.toLowerCase()}`}>{inv.status.toLowerCase()}</div>
                </div>
                <button 
                  className="vd-btn vd-btn-ghost vd-btn-sm" 
                  style={{fontSize:11, padding:'4px 8px'}}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(`${window.location.origin}/pay/${inv.invoiceNum}`);
                    alert('Payment link copied to clipboard!');
                  }}
                >
                  Link
                </button>
              </div>
            </div>
          )) : (
            <div className="vd-empty"><div className="vd-empty-icon">{STATUS_ICONS[filter]||'◫'}</div><div className="vd-empty-text">No {filter} invoices</div></div>
          )}
        </div>
      </div>
    </>
  );
}

/* ─── PAGE: TRANSACTIONS ─── */
function PageTransactions({ invoices, loading }) {
  const [filter, setFilter] = useState('all');

  const getFilteredInvoices = () => {
    const now = new Date();
    const paid = invoices.filter(i => i.status === 'PAID');
    if (filter === '7d') {
      const cutoff = new Date(now); cutoff.setDate(cutoff.getDate() - 7);
      return paid.filter(i => new Date(i.createdAt) >= cutoff);
    }
    if (filter === '30d') {
      const cutoff = new Date(now); cutoff.setDate(cutoff.getDate() - 30);
      return paid.filter(i => new Date(i.createdAt) >= cutoff);
    }
    return paid;
  };

  const filteredInvoices = getFilteredInvoices();
  const totalSettled = filteredInvoices.reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
  const avgInvoiceValue = filteredInvoices.length > 0 ? totalSettled / filteredInvoices.length : 0;
  const fastestMinutes = filteredInvoices.length > 0
    ? Math.min(...filteredInvoices.map(inv => {
        if (inv.settledAt && inv.createdAt) {
          return Math.round((new Date(inv.settledAt) - new Date(inv.createdAt)) / 60000);
        }
        return Infinity;
      }).filter(v => v !== Infinity))
    : 0;

  return (
    <>
      <div className="vd-section-row">
        <div className="vd-section-title">Transactions</div>
        <div className="vd-filter-row">
          {[['all','All Time'],['7d','7 Days'],['30d','30 Days']].map(([f,l]) => (
            <button key={f} className={`vd-filter-btn${filter===f?' active':''}`} onClick={() => setFilter(f)}>{l}</button>
          ))}
          <button className="vd-btn vd-btn-ghost vd-btn-sm">↓ Export CSV</button>
        </div>
      </div>
      <div className="vd-tx-summary">
        <div className="vd-tx-sum-card s-green">
          <div className="vd-tx-sum-label">Total Settled</div>
          <div className="vd-tx-sum-val green">{totalSettled.toLocaleString()} <span style={{fontSize:14,color:'var(--text3)'}}>USDT</span></div>
          <div className="vd-tx-sum-note">{filteredInvoices.length} {filteredInvoices.length === 1 ? 'invoice' : 'invoices'} settled</div>
        </div>
        <div className="vd-tx-sum-card s-gold">
          <div className="vd-tx-sum-label">Avg. Invoice Value</div>
          <div className="vd-tx-sum-val gold">{avgInvoiceValue.toLocaleString()} <span style={{fontSize:14,color:'var(--text3)'}}>USDT</span></div>
          <div className="vd-tx-sum-note">Across {filteredInvoices.length} paid invoices</div>
        </div>
        <div className="vd-tx-sum-card s-blue">
          <div className="vd-tx-sum-label">Fastest Settlement</div>
          <div className="vd-tx-sum-val blue">{fastestMinutes || '—'} <span style={{fontSize:14,color:'var(--text3)'}}>mins</span></div>
          <div className="vd-tx-sum-note">On-chain RGB confirmation</div>
        </div>
      </div>
      <div className="vd-card">
        <div className="vd-card-header">
          <div><div className="vd-card-title">Transaction Ledger</div><div className="vd-card-sub">All settled payments · RGB on-chain</div></div>
          <div className="vd-search-wrap"><span className="vd-search-icon">🔍</span><input className="vd-search-input" placeholder="Search transactions..."/></div>
        </div>
        <table className="vd-tx-table">
          <thead><tr><th>Customer</th><th>Invoice ID</th><th>Status</th><th>Date</th><th style={{textAlign:'right'}}>Amount</th></tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="vd-empty">Loading transactions...</td></tr>
            ) : filteredInvoices.length === 0 ? (
              <tr><td colSpan="5" className="vd-empty">No settled transactions yet</td></tr>
            ) : (
              filteredInvoices.map((inv) => (
                <tr key={inv.id}>
                  <td><span className="vd-tx-name">{inv.customer?.name || 'Customer'}</span><span className="vd-tx-ref">{inv.reference}</span></td>
                  <td><span className="vd-tx-id">{inv.invoiceNum}</span></td>
                  <td><span className="vd-badge vd-badge-green">PAID</span></td>
                  <td><span className="vd-tx-date">{new Date(inv.createdAt).toLocaleDateString()}</span></td>
                  <td><span className="vd-tx-amount green">{Number(inv.amount || 0).toLocaleString()} USDT</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ─── PAGE: CUSTOMERS ─── */
function PageCustomers({ realCustomers, loading, onMount }) {
  const [search, setSearch] = useState('');

  useEffect(() => { onMount?.(); }, []);

  const filteredCustomers = realCustomers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalLifetime = realCustomers.reduce((sum, c) => sum + (c.totalPaid || 0), 0);
  const avgLifetime = realCustomers.length > 0 ? Math.round(totalLifetime / realCustomers.length) : 0;
  const repeatCount = realCustomers.filter(c => (c.invoiceCount || 0) > 1).length;
  const repeatRate = realCustomers.length > 0 ? Math.round((repeatCount / realCustomers.length) * 100) : 0;

  return (
    <>
      <div className="vd-section-row">
        <div className="vd-section-title">Customers</div>
        <div style={{display:'flex', gap:10, alignItems:'center'}}>
          <div className="vd-search-wrap">
            <span className="vd-search-icon">🔍</span>
            <input
              className="vd-search-input"
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="vd-btn vd-btn-gold vd-btn-sm">+ Add Customer</button>
        </div>
      </div>
      <div className="vd-cust-summary-row">
        <div className="vd-cust-sum">
          <div className="vd-cust-sum-lbl">Total Customers</div>
          <div className="vd-cust-sum-val">{realCustomers.length}</div>
        </div>
        <div className="vd-cust-sum">
          <div className="vd-cust-sum-lbl">Repeat Customers</div>
          <div className="vd-cust-sum-val">{repeatCount}</div>
        </div>
        <div className="vd-cust-sum">
          <div className="vd-cust-sum-lbl">Avg. Lifetime Value</div>
          <div className="vd-cust-sum-val" style={{color:'var(--gold)'}}>{avgLifetime.toLocaleString()} USDT</div>
        </div>
        <div className="vd-cust-sum">
          <div className="vd-cust-sum-lbl">Repeat Rate</div>
          <div className="vd-cust-sum-val" style={{color:'var(--green)'}}>{repeatRate}%</div>
        </div>
      </div>
      <div className="vd-cust-grid">
        {loading ? (
          <div className="vd-empty">Loading customers...</div>
        ) : filteredCustomers.length === 0 ? (
          <div className="vd-empty">No customers yet</div>
        ) : (
          filteredCustomers.map((c) => (
            <div key={c.id} className="vd-cust-card">
              <div style={{display:'flex', alignItems:'flex-start', gap:14}}>
                <div className="vd-cust-avatar" style={{background:`${c.color || '#f5a623'}20`, color:c.color || '#f5a623'}}>
                  {(c.name || 'C').split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
                </div>
                <div>
                  <div className="vd-cust-name">{c.name}</div>
                  <div className="vd-cust-since">Customer since {new Date(c.createdAt).toLocaleDateString()}</div>
                  <div style={{marginTop:6}}>
                    <span className={`vd-badge ${(c.invoiceCount || 0) > 0 ? 'vd-badge-green' : 'vd-badge-gray'}`}>
                      {(c.invoiceCount || 0) > 0 ? 'active' : 'inactive'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="vd-cust-stats">
                <div className="vd-cust-stat">
                  <div className="vd-cust-stat-val">{c.invoiceCount || 0}</div>
                  <div className="vd-cust-stat-lbl">Invoices</div>
                </div>
                <div className="vd-cust-stat">
                  <div className="vd-cust-stat-val">{c.invoiceCount || 0}</div>
                  <div className="vd-cust-stat-lbl">Paid</div>
                </div>
                <div className="vd-cust-stat">
                  <div className="vd-cust-stat-val gold">{Number(c.totalPaid || 0).toLocaleString()}</div>
                  <div className="vd-cust-stat-lbl">USDT Total</div>
                </div>
              </div>
              <div className="vd-cust-last">
                <div className="vd-cust-last-label">
                  Customer since {new Date(c.createdAt).toLocaleDateString()}
                </div>
                <button className="vd-btn vd-btn-ghost vd-btn-sm" style={{fontSize:11}}>View →</button>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}

/* ─── EXPORT HELPER ─── */
const exportData = (format, type) => {
  alert(`Export ${type} as ${format} — Coming soon!`);
};

/* ─── PAGE: REPORTS ─── */
function PageReports({ realInvoices, realStats, realCustomers, loading }) {
  const paidInvoices = realInvoices.filter(i => i.status === 'PAID');
  const pendingInvoices = realInvoices.filter(i => i.status === 'PENDING');
  const expiredInvoices = realInvoices.filter(i => i.status === 'EXPIRED');

  const monthlyVolume = {};
  paidInvoices.forEach(inv => {
    const d = new Date(inv.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
    monthlyVolume[key] = (monthlyVolume[key] || 0) + Number(inv.amount || 0);
  });
  const barVals = Object.values(monthlyVolume).slice(-7);
  const barMax = Math.max(...barVals, 1);
  const barLabels = Object.keys(monthlyVolume).slice(-7).map(k => {
    const [yr, mo] = k.split('-');
    return new Date(yr, mo - 1).toLocaleString('default', { month: 'short' });
  });

  const customerTotals = {};
  paidInvoices.forEach(inv => {
    const name = inv.customer?.name || 'Anonymous';
    customerTotals[name] = (customerTotals[name] || 0) + Number(inv.amount || 0);
  });
  const topCustomers = Object.entries(customerTotals)
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);
  const maxTotal = topCustomers[0]?.total || 1;

  const settlementRate = realInvoices.length > 0
    ? Math.round((paidInvoices.length / realInvoices.length) * 100)
    : 0;

  const now = new Date();
  const thisMonthPaid = paidInvoices.filter(i => {
    const d = new Date(i.createdAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const lastMonthYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
  const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
  const lastMonthPaid = paidInvoices.filter(i => {
    const d = new Date(i.createdAt);
    return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
  });
  const thisMonthTotal = thisMonthPaid.reduce((s, i) => s + Number(i.amount || 0), 0);
  const lastMonthTotal = lastMonthPaid.reduce((s, i) => s + Number(i.amount || 0), 0);
  const monthChange = lastMonthTotal > 0
    ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal * 100).toFixed(1)
    : 0;

  const total = realInvoices.length;
  const circum = 2 * Math.PI * 52;

  return (
    <>
      <div className="vd-section-row">
        <div className="vd-section-title">Reports</div>
        <div className="vd-filter-row">
          {['This Month', 'Last Month', 'This Year'].map((f, i) => (
            <button key={f} className={`vd-filter-btn${i === 0 ? ' active' : ''}`}>{f}</button>
          ))}
        </div>
      </div>
      <div className="vd-report-stat-row">
        <div className="vd-rstat r-gold">
          <div className="vd-rstat-lbl">Gross Revenue</div>
          <div className="vd-rstat-val gold">{Number(realStats.totalVolume || 0).toLocaleString()}</div>
          <span className="vd-rstat-delta vd-trend-up">↑ {monthChange}% this month</span>
        </div>
        <div className="vd-rstat r-green">
          <div className="vd-rstat-lbl">Invoices Settled</div>
          <div className="vd-rstat-val green">{paidInvoices.length}</div>
          <span className="vd-rstat-delta vd-trend-up">↑ {thisMonthPaid.length} this month</span>
        </div>
        <div className="vd-rstat r-blue">
          <div className="vd-rstat-lbl">Total Customers</div>
          <div className="vd-rstat-val blue">{realCustomers?.length || 0}</div>
          <span className="vd-rstat-delta vd-trend-up">Across all invoices</span>
        </div>
        <div className="vd-rstat r-purple">
          <div className="vd-rstat-lbl">Settlement Rate</div>
          <div className="vd-rstat-val purple">{settlementRate}%</div>
          <span className="vd-rstat-delta" style={{background:'var(--purple-dim)',color:'var(--purple)'}}>of total invoices</span>
        </div>
      </div>
      <div className="vd-reports-grid">
        <div className="vd-card">
          <div className="vd-card-header"><div><div className="vd-card-title">Monthly Volume</div><div className="vd-card-sub">USDT settled per month</div></div></div>
          {barVals.length === 0 ? (
            <div className="vd-empty" style={{padding:'40px 20px'}}>
              <div className="vd-empty-icon">📊</div>
              <div className="vd-empty-text">No transaction data yet. Create your first invoice to see the chart.</div>
            </div>
          ) : (
            <>
              <div className="vd-bar-chart-wrap">
                {barVals.map((v, i) => (
                  <div key={i} className="vd-bar-col">
                    <div className="vd-bar-track">
                      <div className={`vd-bar-fill${i === barVals.length - 1 ? ' active' : ''}`} style={{height:`${Math.round((v / barMax) * 100)}%`}}/>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{display:'flex',justifyContent:'space-between',padding:'0 20px 16px',fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:'var(--text3)'}}>
                {barLabels.map((l, i) => (
                  <span key={i} style={i === barLabels.length - 1 ? {color:'var(--gold)'} : {}}>{l}</span>
                ))}
              </div>
            </>
          )}
        </div>
        <div className="vd-card">
          <div className="vd-card-header"><div><div className="vd-card-title">Invoice Status Breakdown</div><div className="vd-card-sub">Distribution across all invoices</div></div></div>
          <div className="vd-donut-wrap">
            <svg width="128" height="128" viewBox="0 0 128 128">
              <circle cx="64" cy="64" r="52" fill="none" stroke="#1e1e25" strokeWidth="20"/>
              {total > 0 && (
                <>
                  <circle cx="64" cy="64" r="52" fill="none" stroke="#22c55e" strokeWidth="20"
                    strokeDasharray={`${(paidInvoices.length / total) * circum} ${circum}`}
                    strokeDashoffset={circum / 4} strokeLinecap="butt"/>
                  <circle cx="64" cy="64" r="52" fill="none" stroke="#f5a623" strokeWidth="20"
                    strokeDasharray={`${(pendingInvoices.length / total) * circum} ${circum}`}
                    strokeDashoffset={-(paidInvoices.length / total) * circum + circum / 4}
                    strokeLinecap="butt"/>
                  <circle cx="64" cy="64" r="52" fill="none" stroke="#ef4444" strokeWidth="20"
                    strokeDasharray={`${(expiredInvoices.length / total) * circum} ${circum}`}
                    strokeDashoffset={-((paidInvoices.length + pendingInvoices.length) / total) * circum + circum / 4}
                    strokeLinecap="butt"/>
                </>
              )}
              <text x="64" y="58" textAnchor="middle" fontFamily="'Playfair Display',serif" fontSize="20" fontWeight="700" fill="#f0ede8">{total}</text>
              <text x="64" y="74" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontSize="8" fill="#5a5750">INVOICES</text>
            </svg>
            <div className="vd-donut-legend">
              {[['#22c55e','Paid',paidInvoices.length],['#f5a623','Pending',pendingInvoices.length],['#ef4444','Expired',expiredInvoices.length]].map(([color, label, count]) => (
                <div className="vd-donut-item" key={label}>
                  <div className="vd-donut-dot" style={{background:color}}/>
                  <div className="vd-donut-lbl">{label}</div>
                  <div className="vd-donut-pct">{total > 0 ? Math.round((count / total) * 100) : 0}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="vd-reports-grid">
        <div className="vd-card">
          <div className="vd-card-header"><div><div className="vd-card-title">Top Customers by Revenue</div><div className="vd-card-sub">Ranked by total settled amount</div></div></div>
          <div>
            {topCustomers.length === 0 ? (
              <div className="vd-empty">No customer data yet</div>
            ) : (
              topCustomers.map((c, i) => (
                <div key={i} className="vd-breakdown-item">
                  <div className="vd-breakdown-rank">{i + 1}</div>
                  <div style={{flex:1}}>
                    <div className="vd-breakdown-name">{c.name}</div>
                    <div className="vd-breakdown-count">Customer</div>
                  </div>
                  <div className="vd-breakdown-bar-wrap">
                    <div className="vd-breakdown-bar-track"><div className="vd-breakdown-bar-fill" style={{width:`${Math.round((c.total / maxTotal) * 100)}%`}}/></div>
                    <div className="vd-breakdown-amount">{Number(c.total).toLocaleString()} USDT</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="vd-card">
          <div className="vd-card-header"><div><div className="vd-card-title">Export Reports</div><div className="vd-card-sub">Download your data</div></div></div>
          <div className="vd-export-grid">
            {[
              {icon:'📔', label:'Transaction CSV', desc:'All settled invoices', bg:'var(--green-dim)', fmt:'csv', type:'transactions'},
              {icon:'📊', label:'Monthly PDF', desc:'Full financial report', bg:'var(--blue-dim)', fmt:'pdf', type:'monthly'},
              {icon:'👥', label:'Customer List', desc:'Directory export', bg:'var(--purple-dim)', fmt:'csv', type:'customers'},
              {icon:'🏗️', label:'Tax Summary', desc:'Annual statement', bg:'var(--gold-dim)', fmt:'pdf', type:'tax'},
              {icon:'⏱️', label:'Pending Report', desc:'Outstanding invoices', bg:'var(--red-dim)', fmt:'csv', type:'pending'},
              {icon:'🔗', label:'On-Chain Proof', desc:'RGB settlement log', bg:'var(--bg4)', fmt:'json', type:'onchain'},
            ].map(({ icon, label, desc, bg, fmt, type }, i) => (
              <div key={i} className="vd-export-item" onClick={() => exportData(fmt, type)}>
                <div className="vd-export-icon" style={{background: bg}}>{icon}</div>
                <div><div className="vd-export-label">{label}</div><div className="vd-export-desc">{desc}</div></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}


/* ─── PAGE: STAFF ─── */
function PageStaff({ staff, loading, onToast, currentUser, onMount }) {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('CASHIER');
  const [inviting, setInviting] = useState(false);
  const [localStaff, setLocalStaff] = useState(staff);

  useEffect(() => { onMount?.(); }, []);

  useEffect(() => {
    setLocalStaff(staff);
  }, [staff]);

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    return parts.map(p => p[0]).join('').slice(0, 2).toUpperCase();
  };

  const getRandomColor = (email) => {
    const colors = [
      'linear-gradient(135deg,#f5a623,#e05e1a)',
      'linear-gradient(135deg,#3b82f6,#1d4ed8)',
      'linear-gradient(135deg,#22c55e,#15803d)',
      'linear-gradient(135deg,#a855f7,#7e22ce)',
      'linear-gradient(135deg,#ef4444,#b91c1c)'
    ];
    const index = email.length % colors.length;
    return colors[index];
  };

  const handleInvite = async () => {
    if (!inviteEmail) {
      onToast('Please enter an email address');
      return;
    }

    setInviting(true);
    try {
      const response = await api.post('/staff/invite', {
        email: inviteEmail,
        role: inviteRole,
        canCreateInvoices: true,
        canViewReports: inviteRole !== 'CASHIER',
        canManageStaff: inviteRole === 'OWNER',
        canExportData: inviteRole !== 'CASHIER',
        canEditSettings: inviteRole === 'OWNER'
      });

      setLocalStaff(prev => [...prev, response.data]);
      setShowInviteModal(false);
      setInviteEmail('');
      onToast(`Invitation sent to ${inviteEmail}`);
    } catch (error) {
      console.error('Failed to invite staff:', error);
      onToast(error.response?.data?.error || 'Failed to send invitation');
    } finally {
      setInviting(false);
    }
  };

  const getRoleBadgeClass = (role) => {
    switch(role) {
      case 'OWNER': return 'vd-badge-gold';
      case 'MANAGER': return 'vd-badge-blue';
      default: return 'vd-badge-green';
    }
  };

  const getRoleLabel = (role) => {
    switch(role) {
      case 'OWNER': return 'Owner';
      case 'MANAGER': return 'Manager';
      default: return 'Cashier';
    }
  };

  const activeStaff = localStaff.filter(() => true).length;
  const invoicesCreatedToday = 0;

  return (
    <>
      <div className="vd-section-row">
        <div className="vd-section-title">Staff & Permissions</div>
        <button className="vd-btn vd-btn-gold vd-btn-sm" onClick={() => setShowInviteModal(true)}>
          + Invite Staff Member
        </button>
      </div>

      <div className="vd-staff-summary">
        <div className="vd-staff-sum">
          <div className="vd-staff-sum-lbl">Total Members</div>
          <div className="vd-staff-sum-val">{localStaff.length + 1}</div>
        </div>
        <div className="vd-staff-sum">
          <div className="vd-staff-sum-lbl">Active Today</div>
          <div className="vd-staff-sum-val">{activeStaff + 1}</div>
        </div>
        <div className="vd-staff-sum">
          <div className="vd-staff-sum-lbl">Invoices Created Today</div>
          <div className="vd-staff-sum-val" style={{color: 'var(--gold)'}}>{invoicesCreatedToday}</div>
        </div>
      </div>

      <div className="vd-staff-grid">
        {currentUser && (
          <div className="vd-staff-card owner">
            <div style={{position:'absolute', top:18, right:18}}>
              <span className="vd-badge vd-badge-gold">Owner</span>
            </div>
            <div style={{display:'flex', alignItems:'flex-start', gap:14}}>
              <div className="vd-staff-avatar" style={{background: getRandomColor(currentUser.email)}}>
                {getInitials(`${currentUser.firstName} ${currentUser.lastName}`)}
              </div>
              <div>
                <div className="vd-staff-name">{currentUser.firstName} {currentUser.lastName}</div>
                <div className="vd-staff-email">{currentUser.email}</div>
              </div>
            </div>
            <div className="vd-staff-perms">
              <div className="vd-staff-perm-title">Permissions</div>
              {[
                ['Create Invoices', true],
                ['View Reports', true],
                ['Manage Staff', true],
                ['Export Data', true],
                ['Store Settings', true]
              ].map(([label, allowed]) => (
                <div key={label} className="vd-perm-row">
                  <span className="vd-perm-label">{label}</span>
                  <span className={`vd-perm-check ${allowed ? 'vd-perm-yes' : 'vd-perm-no'}`}>{allowed ? '✓' : '—'}</span>
                </div>
              ))}
            </div>
            <div className="vd-staff-foot">
              <div className="vd-staff-last">Last active: Now</div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="vd-empty">Loading staff...</div>
        ) : localStaff.length === 0 ? (
          <div className="vd-empty">No staff members yet. Invite your team to get started.</div>
        ) : (
          localStaff.map((s) => (
            <div key={s.id} className="vd-staff-card">
              <div style={{position:'absolute', top:18, right:18}}>
                <span className={`vd-badge ${getRoleBadgeClass(s.role)}`}>{getRoleLabel(s.role)}</span>
              </div>
              <div style={{display:'flex', alignItems:'flex-start', gap:14}}>
                <div className="vd-staff-avatar" style={{background: getRandomColor(s.email)}}>
                  {getInitials(s.email.split('@')[0])}
                </div>
                <div>
                  <div className="vd-staff-name">{s.email.split('@')[0]}</div>
                  <div className="vd-staff-email">{s.email}</div>
                </div>
              </div>
              <div className="vd-staff-perms">
                <div className="vd-staff-perm-title">Permissions</div>
                <div className="vd-perm-row">
                  <span className="vd-perm-label">Create Invoices</span>
                  <span className={`vd-perm-check ${s.canCreateInvoices ? 'vd-perm-yes' : 'vd-perm-no'}`}>
                    {s.canCreateInvoices ? '✓' : '—'}
                  </span>
                </div>
                <div className="vd-perm-row">
                  <span className="vd-perm-label">View Reports</span>
                  <span className={`vd-perm-check ${s.canViewReports ? 'vd-perm-yes' : 'vd-perm-no'}`}>
                    {s.canViewReports ? '✓' : '—'}
                  </span>
                </div>
                <div className="vd-perm-row">
                  <span className="vd-perm-label">Manage Staff</span>
                  <span className={`vd-perm-check ${s.canManageStaff ? 'vd-perm-yes' : 'vd-perm-no'}`}>
                    {s.canManageStaff ? '✓' : '—'}
                  </span>
                </div>
                <div className="vd-perm-row">
                  <span className="vd-perm-label">Export Data</span>
                  <span className={`vd-perm-check ${s.canExportData ? 'vd-perm-yes' : 'vd-perm-no'}`}>
                    {s.canExportData ? '✓' : '—'}
                  </span>
                </div>
                <div className="vd-perm-row">
                  <span className="vd-perm-label">Store Settings</span>
                  <span className={`vd-perm-check ${s.canEditSettings ? 'vd-perm-yes' : 'vd-perm-no'}`}>
                    {s.canEditSettings ? '✓' : '—'}
                  </span>
                </div>
              </div>
              <div className="vd-staff-foot">
                <div className="vd-staff-last">Invited: {new Date(s.createdAt).toLocaleDateString()}</div>
                {s.role !== 'OWNER' && (
                  <button className="vd-btn vd-btn-ghost vd-btn-sm" style={{fontSize:11}}>Edit</button>
                )}
              </div>
            </div>
          ))
        )}

        <div className="vd-invite-card" onClick={() => setShowInviteModal(true)}>
          <div className="vd-invite-icon">+</div>
          <div className="vd-invite-label">Invite a team member</div>
          <div className="vd-invite-sub">Send an invite link</div>
        </div>
      </div>

      {showInviteModal && (
        <div className="vd-overlay show" onClick={() => setShowInviteModal(false)}>
          <div className="vd-modal" style={{width: 450}} onClick={(e) => e.stopPropagation()}>
            <div className="vd-modal-header">
              <div>
                <div className="vd-modal-title">Invite Team Member</div>
                <div className="vd-modal-sub">Send an invitation to join your store</div>
              </div>
              <button className="vd-close-btn" onClick={() => setShowInviteModal(false)}>✕</button>
            </div>
            <div className="vd-modal-body">
              <div className="vd-form-group">
                <label className="vd-form-label">Email Address</label>
                <input
                  className="vd-form-input"
                  type="email"
                  placeholder="colleague@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <div className="vd-form-group">
                <label className="vd-form-label">Role</label>
                <div className="vd-asset-select" style={{gridTemplateColumns: '1fr 1fr'}}>
                  {[
                    {value: 'MANAGER', label: 'Manager', desc: 'Can view reports and manage invoices'},
                    {value: 'CASHIER', label: 'Cashier', desc: 'Can only create invoices'}
                  ].map(role => (
                    <div
                      key={role.value}
                      className={`vd-asset-opt ${inviteRole === role.value ? 'selected' : ''}`}
                      onClick={() => setInviteRole(role.value)}
                    >
                      <div className="vd-asset-opt-name">{role.label}</div>
                      <div className="vd-asset-opt-bal" style={{fontSize: 9}}>{role.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="vd-modal-footer">
              <button className="vd-btn vd-btn-ghost" onClick={() => setShowInviteModal(false)}>Cancel</button>
              <button className="vd-btn vd-btn-gold" onClick={handleInvite} disabled={inviting}>
                {inviting ? 'Sending...' : 'Send Invitation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ─── PAGE: SUPPORT ─── */
function PageSupport() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTicketId, setActiveTicketId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [newSubj, setNewSubj] = useState('');
  const [newMsg, setNewMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [presence, setPresence] = useState({ adminActive: false, merchantActive: false });
  const [adminTyping, setAdminTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    fetchTickets();

    const handleNotif = (notif) => {
      if (notif.type === 'ticket_reply') fetchTickets();
    };
    const handlePresence = (data) => {
      if (data.ticketId === activeTicketId) setPresence(data);
    };
    const handleTyping = (data) => {
      if (data.ticketId === activeTicketId && data.actor === 'admin') {
        setAdminTyping(Boolean(data.isTyping));
      }
    };
    
    import('../utils/socket').then(m => {
      m.default.on('notification', handleNotif);
      m.default.on('ticket:reply', fetchTickets);
      m.default.on('ticket:presence', handlePresence);
      m.default.on('ticket:typing', handleTyping);
    });

    return () => {
      import('../utils/socket').then(m => {
        m.default.off('notification', handleNotif);
        m.default.off('ticket:reply', fetchTickets);
        m.default.off('ticket:presence', handlePresence);
        m.default.off('ticket:typing', handleTyping);
      });
    };
  }, [activeTicketId]);

  useEffect(() => {
    if (activeTicketId) {
      setAdminTyping(false);
      import('../utils/socket').then(m => {
        m.default.emit('join_ticket', activeTicketId);
      });
      return () => {
        import('../utils/socket').then(m => {
          m.default.emit('leave_ticket', activeTicketId);
          m.default.emit('ticket:typing', { ticketId: activeTicketId, isTyping: false });
        });
      };
    }
  }, [activeTicketId]);

  useEffect(() => () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  }, []);

  const handleReplyInput = (value) => {
    setReplyText(value);
    if (!activeTicketId) return;

    import('../utils/socket').then(m => {
      m.default.emit('ticket:typing', { ticketId: activeTicketId, isTyping: value.trim().length > 0 });
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      import('../utils/socket').then(m => {
        m.default.emit('ticket:typing', { ticketId: activeTicketId, isTyping: false });
      });
    }, 1200);
  };

  const fetchTickets = async () => {
    try {
      const response = await api.get('/merchant/support');
      setTickets(response.data);
    } catch (error) {
      console.error('Failed to fetch support tickets', error);
    } finally {
      setLoading(false);
    }
  };

  const activeTicket = tickets.find(t => t.id === activeTicketId);

  const handleReply = async () => {
    if (!replyText.trim()) return;
    try {
      setSubmitting(true);
      await api.post(`/merchant/support/${activeTicketId}/reply`, { message: replyText });
      setReplyText('');
      setAdminTyping(false);
      import('../utils/socket').then(m => {
        m.default.emit('ticket:typing', { ticketId: activeTicketId, isTyping: false });
      });
      fetchTickets();
    } catch (e) {
      alert('Failed to send reply');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreate = async () => {
    if (!newSubj.trim() || !newMsg.trim()) return;
    try {
      setSubmitting(true);
      const res = await api.post('/merchant/support', { subject: newSubj, message: newMsg });
      setShowNewModal(false);
      setNewSubj('');
      setNewMsg('');
      await fetchTickets();
      setActiveTicketId(res.data.id);
    } catch (e) {
      alert('Failed to create ticket');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="vd-empty">Loading secure support channel...</div>;

  return (
    <>
      <div className="vd-section-row">
        <div className="vd-section-title">Support Desk</div>
        <button className="vd-btn vd-btn-gold" onClick={() => setShowNewModal(true)}>+ New Ticket</button>
      </div>

      <div className="vd-grid2" style={{ gridTemplateColumns: '320px 1fr' }}>
        <div className="vd-card">
          {tickets.length === 0 ? (
            <div className="vd-empty" style={{ paddingTop: 60 }}>
              <div className="vd-empty-icon">◈</div>
              <div className="vd-empty-text">You have no open tickets.</div>
            </div>
          ) : (
            tickets.map(t => {
              const isOpen = t.status !== 'RESOLVED';
              return (
                <div 
                  key={t.id} 
                  className="vd-breakdown-item" 
                  style={{ cursor: 'pointer', background: activeTicketId === t.id ? 'var(--bg3)' : 'transparent' }}
                  onClick={() => setActiveTicketId(t.id)}
                >
                  <div className="vd-breakdown-rank" style={{ color: isOpen ? 'var(--gold)' : 'var(--green)' }}>
                    {isOpen ? '◉' : '✓'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="vd-breakdown-name">{t.subject}</div>
                    <div className="vd-breakdown-count">{new Date(t.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        <div className="vd-card">
          {!activeTicket ? (
            <div className="vd-empty" style={{ paddingTop: 100 }}>
              <div className="vd-empty-icon">✉️</div>
              <div className="vd-empty-text">Select a ticket to view conversation</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div className="vd-card-header">
                <div>
                  <div className="vd-card-title">{activeTicket.subject}</div>
                  <div className="vd-card-sub">Ticket • {activeTicket.id.split('-')[0]}</div>
                </div>
                <div className={`vd-presence-pill${presence.adminActive ? ' live' : ''}`}>
                  <span className="vd-presence-dot" />
                  <span>{presence.adminActive ? 'Support active now' : 'Support offline'}</span>
                </div>
                <span className={`vd-badge vd-badge-${activeTicket.status === 'RESOLVED' ? 'green' : 'gold'}`}>
                  {activeTicket.status}
                </span>
              </div>
              
              <div style={{ flex: 1, padding: 20, overflowY: 'auto', borderBottom: '1px solid var(--border)' }}>
                {/* Original Ticket Description */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                  <div className="vd-avatar" style={{ background: 'var(--bg4)' }}>ME</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: "'JetBrains Mono', monospace", marginBottom: 6 }}>
                      {new Date(activeTicket.createdAt).toLocaleString()}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                      {activeTicket.message}
                    </div>
                  </div>
                </div>

                {/* All Responses Thread */}
                {activeTicket.responses && activeTicket.responses.map(resp => (
                  <div key={resp.id} style={{ display: 'flex', gap: 12, marginBottom: 24, paddingLeft: resp.isFromAdmin ? 20 : 0 }}>
                    {resp.isFromAdmin ? (
                      <>
                        <div className="vd-avatar" style={{ background: 'var(--gold-dim)', color: 'var(--gold)' }}>V</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 11, color: 'var(--gold)', fontFamily: "'JetBrains Mono', monospace", marginBottom: 6, fontWeight: 600 }}>
                            Veya Support • {new Date(resp.createdAt).toLocaleString()}
                          </div>
                          <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                            {resp.message}
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="vd-avatar" style={{ background: 'var(--bg4)' }}>ME</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: "'JetBrains Mono', monospace", marginBottom: 6 }}>
                            {new Date(resp.createdAt).toLocaleString()}
                          </div>
                          <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                            {resp.message}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                {adminTyping && (
                  <div className="vd-typing-card" style={{ marginLeft: 20 }}>
                    <div className="vd-avatar" style={{ background: 'var(--gold-dim)', color: 'var(--gold)' }}>V</div>
                    <div className="vd-typing-copy">
                      <div className="vd-typing-label">Veya Support</div>
                      <div className="vd-typing-sub">
                        typing
                        <span className="vd-typing-dots" style={{ marginLeft: 8 }}>
                          <span />
                          <span />
                          <span />
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {activeTicket.status !== 'RESOLVED' && (
                <div style={{ padding: 20 }}>
                  <textarea 
                    className="vd-form-input" 
                    placeholder="Type your reply..." 
                    style={{ minHeight: 80, marginBottom: 12, resize: 'vertical' }}
                    value={replyText}
                    onChange={(e) => handleReplyInput(e.target.value)}
                  />
                  <button className="vd-btn vd-btn-gold" onClick={handleReply} disabled={submitting}>
                    {submitting ? 'Sending...' : 'Send Reply'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showNewModal && (
        <div className="vd-overlay show" onClick={() => !submitting && setShowNewModal(false)}>
          <div className="vd-modal" onClick={e => e.stopPropagation()}>
            <div className="vd-modal-header">
              <div>
                <div className="vd-modal-title">New Support Ticket</div>
                <div className="vd-modal-sub">Veya team usually responds within 24 hours</div>
              </div>
              <button className="vd-close-btn" onClick={() => !submitting && setShowNewModal(false)}>✕</button>
            </div>
            <div className="vd-modal-body">
              <div className="vd-form-group">
                <label className="vd-form-label">Subject</label>
                <input 
                  className="vd-form-input" 
                  placeholder="e.g. Webhook delivery issue"
                  value={newSubj}
                  onChange={e => setNewSubj(e.target.value)}
                />
              </div>
              <div className="vd-form-group" style={{ marginBottom: 0 }}>
                <label className="vd-form-label">Message</label>
                <textarea 
                  className="vd-form-input" 
                  placeholder="Describe your issue in detail..."
                  style={{ minHeight: 120, resize: 'vertical' }}
                  value={newMsg}
                  onChange={e => setNewMsg(e.target.value)}
                />
              </div>
            </div>
            <div className="vd-modal-footer">
              <button className="vd-btn vd-btn-ghost" onClick={() => !submitting && setShowNewModal(false)}>Cancel</button>
              <button className="vd-btn vd-btn-gold" onClick={handleCreate} disabled={submitting}>
                {submitting ? 'Creating...' : 'Submit Ticket'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ─── MAIN APP ─── */
export default function DashboardPage() {
  const [searchParams] = useSearchParams();
  const [page, setPage] = useState(DASHBOARD_PAGES.has(searchParams.get('page')) ? searchParams.get('page') : 'dashboard');
  const [modalOpen, setModalOpen] = useState(false);
  const [invoices, setInvoices] = useState(INVOICES_DATA);
  const [toast, setToast] = useState({show:false,msg:''});
  // Real data from backend
  const [realStats, setRealStats] = useState({
    totalVolume: 0,
    invoicesPaid: 0,
    pending: 0,
    customers: 0
  });
  const [realInvoices, setRealInvoices] = useState([]);
  const [realCustomers, setRealCustomers] = useState([]);
  const [realStaff, setRealStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  // Track which secondary tabs have been loaded at least once
  const loadedTabs = useRef(new Set());
  const [tabLoading, setTabLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchData();
  }, []);

  useEffect(() => {
    const queryPage = searchParams.get('page');
    if (DASHBOARD_PAGES.has(queryPage)) {
      setPage(queryPage);
    }
  }, [searchParams]);

  const handleAuthFailure = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  /**
   * Phase 1: fetch stats + invoices — clears the loading screen immediately.
   * Phase 2: fetch customers + staff silently in the background.
   */
  const fetchData = async ({ showLoading = true } = {}) => {
    let loadingGuard = null;
    try {
      if (showLoading) {
        setLoading(true);
        // Never keep the whole dashboard blocked for too long on slow network/DB.
        loadingGuard = setTimeout(() => setLoading(false), 3500);
      }

      // ── Phase 1: critical path (stats + invoices only) ────────────────────
      const [statsRes, invoicesRes] = await Promise.allSettled([
        api.get('/merchant/stats'),
        api.get('/invoices?limit=20'),
      ]);

      // Auth check on critical requests
      const authError = [statsRes, invoicesRes].find(
        (r) => r.status === 'rejected' &&
          (r.reason?.response?.status === 401 || r.reason?.response?.status === 403)
      );
      if (authError) { handleAuthFailure(); return; }

      if (statsRes.status === 'fulfilled') {
        setRealStats(statsRes.value.data);
      } else {
        console.error('Stats error:', statsRes.reason);
      }

      if (invoicesRes.status === 'fulfilled') {
        setRealInvoices(invoicesRes.value.data);
        setInvoices(invoicesRes.value.data);
      } else {
        console.error('Invoices error:', invoicesRes.reason);
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
    } finally {
      if (loadingGuard) clearTimeout(loadingGuard);
      // Dashboard is renderable — clear the loading gate immediately
      if (showLoading) setLoading(false);
    }

    // ── Phase 2: non-critical (customers + staff) — fire and forget ────────
    Promise.allSettled([
      api.get('/customers'),
      api.get('/staff'),
    ]).then(([customersRes, staffRes]) => {
      if (customersRes.status === 'fulfilled') {
        setRealCustomers(customersRes.value.data);
        loadedTabs.current.add('customers');
      }
      if (staffRes.status === 'fulfilled') {
        setRealStaff(staffRes.value.data);
        loadedTabs.current.add('staff');
      }
    }).catch(() => {});
  };

  /** Lazy-load a secondary tab only on first visit. */
  const fetchTabData = async (tabId) => {
    if (loadedTabs.current.has(tabId)) return;
    try {
      setTabLoading(true);
      if (tabId === 'customers') {
        const res = await api.get('/customers');
        setRealCustomers(res.data);
        loadedTabs.current.add('customers');
      } else if (tabId === 'staff') {
        const res = await api.get('/staff');
        setRealStaff(res.data);
        loadedTabs.current.add('staff');
      }
    } catch (err) {
      console.error(`Tab fetch error (${tabId}):`, err);
    } finally {
      setTabLoading(false);
    }
  };

  const showToast = (msg) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: '' }), 2400);
  };

  const handleSignOut = () => {
    import('../utils/socket').then(m => m.disconnectSocket()).finally(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth';
    });
  };

  const handleCreated = async () => {
    await fetchData({ showLoading: false });
    showToast('Invoice created successfully');
  };

  const NAV = [
    {
      section: 'Overview',
      items: [
        { id: 'dashboard', icon: '⬡', label: 'Dashboard' },
        { id: 'invoices', icon: '◫', label: 'Invoices', badge: realInvoices.filter((inv) => inv.status === 'PENDING').length || undefined },
        { id: 'transactions', icon: '⇅', label: 'Transactions', permission: 'canViewReports' },
        { id: 'customers', icon: '◎', label: 'Customers', permission: 'canViewReports' },
      ].filter(item => !item.permission || !user?.permissions || user?.permissions[item.permission]),
    },
    {
      section: 'Operations',
      items: [
        { id: 'reports', icon: '▣', label: 'Reports', permission: 'canViewReports' },
        { id: 'staff', icon: '✦', label: 'Staff', permission: 'canManageStaff' },
        { id: 'support', icon: '☏', label: 'Support' },
      ].filter(item => !item.permission || !user?.permissions || user?.permissions[item.permission]),
    },
    {
      section: 'Platform',
      items: [
        { id: 'wallet', icon: '◇', label: 'Wallet', permission: 'canEditSettings' },
        { id: 'settings', icon: '⊙', label: 'Settings', permission: 'canEditSettings' },
      ].filter(item => !item.permission || !user?.permissions || user?.permissions[item.permission]),
    },
  ].filter(sec => sec.items.length > 0);

  return (
    <>
      <style>{css}</style>
      <div className="vd">
        {/* SIDEBAR */}
        <aside className="vd-sidebar">
          <div className="vd-logo-wrap">
            <div className="vd-logo">
              <div className="vd-logo-mark"><span className="vd-logo-v">V</span></div>
              <div>
                <div className="vd-logo-name">V<em>eya</em></div>
                <div className="vd-logo-tag">Merchant OS</div>
              </div>
            </div>
          </div>
          <div className="vd-store-pill">
            <div className="vd-store-dot"/>
            <span className="vd-store-name">{user?.merchant?.storeName || 'Loading...'}</span>
            <span style={{color:'var(--text3)',fontSize:10}}>⌄</span>
          </div>
          <nav className="vd-nav">
            {NAV.map(({section,items}) => (
              <div key={section} className="vd-nav-section">
                <div className="vd-nav-label">{section}</div>
                {items.map(({id,icon,label,badge}) => (
                  <button key={id} className={`vd-nav-item${page===id?' active':''}`} onClick={()=>setPage(id)}>
                    <span style={{width:16,textAlign:'center'}}>{icon}</span> {label}
                    {badge && <span className="vd-nav-badge">{badge}</span>}
                  </button>
                ))}
              </div>
            ))}
          </nav>
          <div className="vd-sidebar-bottom">
            <div className="vd-user-card">
              <div className="vd-avatar">
                {`${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.trim() || 'U'}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div className="vd-user-name">{user?.firstName || ''} {user?.lastName || ''}</div>
                <div className="vd-user-role">{user?.staffRole ? user.staffRole.charAt(0) + user.staffRole.slice(1).toLowerCase() : 'Owner'} · Veya Pro</div>
              </div>
              <span style={{color:'var(--text3)',fontSize:11}}>⋯</span>
            </div>
            <div className="vd-user-actions">
              <button className="vd-signout-btn" onClick={handleSignOut}>
                <span>↩</span>
                <span>Sign out</span>
              </button>
            </div>
          </div>
          <div className="vd-powered">Powered by <span>UTEXO · RGB</span></div>
        </aside>

        {/* MAIN */}
        <main className="vd-main">
          <div className="vd-topbar">
            <div className="vd-page-title">{PAGE_TITLES[page]||page}</div>
            <div className="vd-topbar-actions">
              <div className="vd-search-wrap">
                <span className="vd-search-icon">🔍</span>
                <input className="vd-search-input" placeholder="Search invoices, customers..."/>
              </div>
              <NotificationBell />
              <button className="vd-btn vd-btn-gold" onClick={()=>setModalOpen(true)}><span>+</span> New Invoice</button>
            </div>
          </div>
          <div className="vd-content">
            {page === 'dashboard' && (
              <PageDashboard
                user={user}
                onNewInvoice={() => setModalOpen(true)}
                onNav={setPage}
                realStats={realStats}
                realInvoices={realInvoices}
                loading={loading}
              />
            )}
            {page === 'invoices' && (
              <PageInvoices
                onNewInvoice={() => setModalOpen(true)}
                realInvoices={realInvoices}
                loading={loading}
              />
            )}
            {page === 'transactions' && (
              <PageTransactions invoices={realInvoices} loading={loading} />
            )}
            {page === 'customers' && (
              <PageCustomers
                realCustomers={realCustomers}
                loading={tabLoading && !loadedTabs.current.has('customers')}
                onMount={() => fetchTabData('customers')}
              />
            )}
            {page === 'reports' && (
              <PageReports
                realInvoices={realInvoices}
                realStats={realStats}
                realCustomers={realCustomers}
                loading={loading}
              />
            )}
            {page === 'staff' && (
              <PageStaff
                staff={realStaff}
                loading={tabLoading && !loadedTabs.current.has('staff')}
                onToast={showToast}
                currentUser={user}
                onMount={() => fetchTabData('staff')}
              />
            )}
            {page === 'support' && (
              <PageSupport />
            )}
            {page === 'wallet' && (
              <div className="vd-empty">
                <div className="vd-empty-icon">◇</div>
                <div className="vd-empty-text">Wallet and UTXO management coming soon</div>
              </div>
            )}
            {page === 'settings' && (
              <div className="vd-empty">
                <div className="vd-empty-icon">⊙</div>
                <div className="vd-empty-text">Store settings and API integrations coming soon</div>
              </div>
            )}
          </div>
        </main>
      </div>

      <InvoiceModal show={modalOpen} onClose={()=>setModalOpen(false)} onCreated={handleCreated}/>
      <Toast message={toast.msg} show={toast.show}/>
    </>
  );
}
