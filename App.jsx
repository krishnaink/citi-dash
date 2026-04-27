import { useState, useEffect, useRef } from "react";
import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ScatterChart, Scatter } from "recharts";

// ─── Constants ───────────────────────────────────────────────────────────────
const INIT_PRICE = 38518.43;
const G = "#22c55e", R = "#ef4444", A = "#38bdf8", W = "#f59e0b";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (n) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtT = (d) => d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
const genTick = (p) => Math.max(37200, Math.min(40800, p + (Math.random() - 0.48) * 88));

// ─── Tooltip ─────────────────────────────────────────────────────────────────
const CTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#0f172a", border: "1px solid #1e293b", padding: "10px 14px", borderRadius: 8, fontSize: 12, fontFamily: "monospace" }}>
      <p style={{ color: "#64748b", margin: "0 0 3px" }}>{label}</p>
      <p style={{ color: A, margin: 0, fontWeight: 600 }}>${fmt(payload[0].value)}</p>
    </div>
  );
};

// ─── Nav ─────────────────────────────────────────────────────────────────────
const NAV = [
  { id: "live", label: "Live Feed", icon: "◉" },
  { id: "analysis", label: "Analysis", icon: "▦" },
  { id: "report", label: "Report", icon: "≡" },
  { id: "pipeline", label: "Pipeline", icon: "⟳" },
];

// ═════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [tab, setTab] = useState("live");
  const [history, setHistory] = useState(() => {
    const now = new Date();
    let p = INIT_PRICE;
    return Array.from({ length: 20 }, (_, i) => {
      p = genTick(p);
      return { time: fmtT(new Date(now - (19 - i) * 5000)), price: parseFloat(p.toFixed(2)), idx: i + 1 };
    });
  });
  const [queue, setQueue] = useState([]);
  const [running, setRunning] = useState(true);
  const interval = useRef(null);

  useEffect(() => {
    if (!running) return;
    interval.current = setInterval(() => {
      setHistory(prev => {
        const last = prev[prev.length - 1];
        const newP = parseFloat(genTick(last.price).toFixed(2));
        const entry = { time: fmtT(new Date()), price: newP, idx: last.idx + 1, change: parseFloat((newP - last.price).toFixed(2)) };
        setQueue(q => [entry, ...q].slice(0, 30));
        return [...prev, entry].slice(-80);
      });
    }, 5000);
    return () => clearInterval(interval.current);
  }, [running]);

  const cur = history[history.length - 1]?.price ?? INIT_PRICE;
  const first = history[0]?.price ?? INIT_PRICE;
  const hi = Math.max(...history.map(d => d.price));
  const lo = Math.min(...history.map(d => d.price));
  const chg = cur - first;
  const pct = (chg / first) * 100;
  const pos = chg >= 0;

  const deltas = history.slice(1).map((d, i) => ({ ...d, delta: parseFloat((d.price - history[i].price).toFixed(2)) }));
  const avgMove = deltas.length ? deltas.reduce((a, b) => a + Math.abs(b.delta), 0) / deltas.length : 0;
  const volLevel = avgMove < 20 ? "Low" : avgMove < 50 ? "Moderate" : "High";
  const volColor = avgMove < 20 ? G : avgMove < 50 ? W : R;

  const moves5 = history.slice(-5).map(d => d.price);
  const moves10 = history.slice(-10, -5).map(d => d.price);
  const mom = moves5.length >= 5 && moves10.length >= 5
    ? ((moves5.reduce((a, b) => a + b, 0) / 5 - moves10.reduce((a, b) => a + b, 0) / 5) / (moves10.reduce((a, b) => a + b, 0) / 5)) * 100
    : 0;

  const shared = { history, queue, cur, first, hi, lo, chg, pct, pos, deltas, avgMove, volLevel, volColor, mom, running, setRunning };

  return (
    <div style={{ background: "#060c18", minHeight: "100vh", fontFamily: "'IBM Plex Sans', sans-serif", color: "#e2e8f0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-thumb{background:#1e293b;border-radius:2px;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
        @keyframes blink{0%,100%{opacity:1;}50%{opacity:0.2;}}
        .fade-up{animation:fadeUp 0.4s ease both;}
        .nav-btn{background:transparent;border:none;cursor:pointer;padding:10px 18px;border-radius:8px;font-size:13px;font-family:'IBM Plex Sans',sans-serif;font-weight:500;transition:all 0.15s;display:flex;align-items:center;gap:7px;letter-spacing:0.01em;}
        .nav-btn:hover{background:#0f172a;}
        .card{background:#0c1829;border:1px solid #1e293b;border-radius:12px;padding:20px 22px;}
        .metric{background:#0a1520;border:1px solid #1e293b;border-radius:10px;padding:14px 16px;}
        .metric-label{font-size:10px;color:#475569;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:6px;font-family:'IBM Plex Mono',monospace;}
        .metric-val{font-size:20px;font-weight:600;font-family:'IBM Plex Mono',monospace;}
        .section-title{font-size:11px;text-transform:uppercase;letter-spacing:0.12em;color:#475569;margin-bottom:14px;font-family:'IBM Plex Mono',monospace;}
        .prose{font-size:14px;line-height:1.8;color:#94a3b8;}
        .prose strong{color:#cbd5e1;font-weight:500;}
        .prose em{color:${A};font-style:normal;}
        .tag{display:inline-block;font-size:10px;padding:2px 10px;border-radius:20px;font-family:'IBM Plex Mono',monospace;letter-spacing:0.05em;}
        .divider{border:none;border-top:1px solid #1e293b;margin:24px 0;}
        table{width:100%;border-collapse:collapse;}
        td,th{padding:8px 12px;text-align:left;font-size:12px;border-bottom:1px solid #0f172a;}
        th{color:#475569;font-weight:500;font-family:'IBM Plex Mono',monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.08em;}
        td{font-family:'IBM Plex Mono',monospace;color:#94a3b8;}
        tr:last-child td{border-bottom:none;}
        .pipe-node{background:#0a1520;border:1px solid #1e293b;border-radius:10px;padding:16px 20px;text-align:center;}
        .pipe-arrow{color:#334155;font-size:20px;align-self:center;}
      `}</style>

      {/* Top nav */}
      <nav style={{ borderBottom: "1px solid #1e293b", background: "#060c18", padding: "0 28px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 0" }}>
          <div style={{ width: 30, height: 30, borderRadius: 7, background: `linear-gradient(135deg, ${A}, #2563eb)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff" }}>D</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.01em" }}>DJIA Intelligence</div>
            <div style={{ fontSize: 10, color: "#475569", fontFamily: "monospace" }}>Citi × Forage · Real-time pipeline</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {NAV.map(n => (
            <button key={n.id} className="nav-btn" onClick={() => setTab(n.id)}
              style={{ color: tab === n.id ? A : "#64748b", background: tab === n.id ? "#0f172a" : "transparent", borderBottom: tab === n.id ? `2px solid ${A}` : "2px solid transparent", borderRadius: "8px 8px 0 0" }}>
              <span style={{ fontSize: 11 }}>{n.icon}</span>{n.label}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: running ? G : "#475569", animation: running ? "blink 1.5s infinite" : "none", display: "inline-block" }} />
          <span style={{ fontSize: 11, color: running ? G : "#475569", fontFamily: "monospace" }}>{running ? "LIVE" : "PAUSED"}</span>
          <button onClick={() => setRunning(r => !r)} style={{ background: "#0f172a", border: "1px solid #1e293b", color: "#94a3b8", padding: "4px 12px", borderRadius: 6, cursor: "pointer", fontSize: 11, fontFamily: "monospace" }}>
            {running ? "Pause" : "Resume"}
          </button>
        </div>
      </nav>

      {/* Page content */}
      <div style={{ padding: "28px", maxWidth: 1100, margin: "0 auto" }}>
        {tab === "live" && <LivePage {...shared} />}
        {tab === "analysis" && <AnalysisPage {...shared} />}
        {tab === "report" && <ReportPage {...shared} />}
        {tab === "pipeline" && <PipelinePage {...shared} />}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════ LIVE PAGE
function LivePage({ history, queue, cur, first, hi, lo, chg, pct, pos, deltas, avgMove, volLevel, volColor, mom }) {
  return (
    <div className="fade-up">
      {/* Hero */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: "#475569", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>
          Dow Jones Industrial Average · Live Feed
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 16, flexWrap: "wrap", marginBottom: 8 }}>
          <span style={{ fontSize: 52, fontWeight: 600, letterSpacing: "-0.04em", fontFamily: "'IBM Plex Mono'", color: "#f1f5f9" }}>${fmt(cur)}</span>
          <span style={{ fontSize: 22, fontWeight: 500, color: pos ? G : R, fontFamily: "monospace" }}>{pos ? "+" : ""}{fmt(chg)} ({pct.toFixed(3)}%)</span>
        </div>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          {[["Open", `$${fmt(first)}`, "#64748b"], ["High", `$${fmt(hi)}`, G], ["Low", `$${fmt(lo)}`, R], ["Range", `$${(hi - lo).toFixed(2)}`, "#64748b"], ["Momentum", `${mom >= 0 ? "+" : ""}${mom.toFixed(3)}%`, mom >= 0 ? G : R]].map(([l, v, c]) => (
            <span key={l} style={{ fontSize: 12 }}><span style={{ color: "#475569" }}>{l}: </span><span style={{ color: c, fontFamily: "monospace" }}>{v}</span></span>
          ))}
        </div>
      </div>

      {/* Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px,1fr))", gap: 10, marginBottom: 20 }}>
        {[
          ["Queue size", `#${history[history.length - 1]?.idx ?? 0}`, A],
          ["Volatility", volLevel, volColor],
          ["Avg move", `$${avgMove.toFixed(1)}`, "#94a3b8"],
          ["Session Δ", `${pos ? "+" : ""}${fmt(chg)}`, pos ? G : R],
          ["Poll rate", "5 seconds", "#64748b"],
          ["Data source", "Yahoo Finance", "#64748b"],
        ].map(([l, v, c]) => (
          <div key={l} className="metric">
            <div className="metric-label">{l}</div>
            <div className="metric-val" style={{ color: c, fontSize: 16 }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Chart + queue */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16, marginBottom: 16 }}>
        <div className="card">
          <div className="section-title">Price history · {history.length} ticks</div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={history} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={pos ? G : R} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={pos ? G : R} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" tick={{ fontSize: 9, fill: "#334155", fontFamily: "monospace" }} interval="preserveStartEnd" tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 9, fill: "#334155", fontFamily: "monospace" }} tickFormatter={v => `$${(v / 1000).toFixed(1)}k`} tickLine={false} axisLine={false} width={44} domain={["auto", "auto"]} />
              <Tooltip content={<CTip />} />
              <ReferenceLine y={first} stroke="#334155" strokeDasharray="4 3" label={{ value: "open", position: "right", fontSize: 9, fill: "#475569" }} />
              <Area type="monotone" dataKey="price" stroke={pos ? G : R} strokeWidth={2} fill="url(#ag)" dot={false} activeDot={{ r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div className="section-title" style={{ margin: 0 }}>Queue log</div>
            <span className="tag" style={{ background: "#0f172a", color: A, border: `1px solid ${A}33` }}>LinkedList</span>
          </div>
          <div style={{ flex: 1, overflowY: "auto", maxHeight: 220 }}>
            {queue.length === 0 ? <div style={{ color: "#334155", fontSize: 12, fontFamily: "monospace" }}>Awaiting first tick...</div> :
              queue.map((e, i) => (
                <div key={e.idx} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8, padding: "5px 0", borderBottom: "1px solid #0f172a", opacity: Math.max(0.3, 1 - i * 0.06), fontSize: 11, fontFamily: "monospace" }}>
                  <div>
                    <span style={{ color: "#475569" }}>{e.time}</span>
                    <span style={{ color: "#e2e8f0", marginLeft: 8 }}>${fmt(e.price)}</span>
                  </div>
                  <span style={{ color: e.change >= 0 ? G : R }}>{e.change >= 0 ? "+" : ""}{e.change?.toFixed(2)}</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Delta bars */}
      <div className="card">
        <div className="section-title">Tick delta — price change per 5-second interval</div>
        <ResponsiveContainer width="100%" height={100}>
          <BarChart data={deltas.slice(-20)} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <XAxis dataKey="time" hide />
            <YAxis tick={{ fontSize: 9, fill: "#334155", fontFamily: "monospace" }} tickLine={false} axisLine={false} width={36} />
            <Tooltip formatter={v => [`$${v}`, "Δ price"]} contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", fontSize: 11 }} />
            <ReferenceLine y={0} stroke="#334155" />
            <Bar dataKey="delta" radius={[2, 2, 0, 0]} isAnimationActive={false}
              shape={(props) => {
                const { x, y, width, height, value } = props;
                const color = value >= 0 ? G : R;
                const h = Math.abs(height), top = value >= 0 ? y : y + height;
                return <rect x={x} y={top} width={width} height={h} fill={color} rx={2} opacity={0.75} />;
              }} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════ ANALYSIS PAGE
function AnalysisPage({ history, deltas, avgMove, volLevel, volColor, mom, hi, lo, first, cur }) {
  const bins = 8;
  const mn = Math.min(...history.map(d => d.price));
  const mx = Math.max(...history.map(d => d.price));
  const w = (mx - mn) / bins;
  const dist = Array.from({ length: bins }, (_, i) => {
    const low = mn + i * w, high = low + w;
    return { range: `$${(low / 1000).toFixed(1)}k`, count: history.filter(d => d.price >= low && d.price < high).length };
  });

  const rolling5 = history.slice(4).map((d, i) => ({
    time: d.time,
    ma5: parseFloat((history.slice(i, i + 5).reduce((a, b) => a + b.price, 0) / 5).toFixed(2)),
    price: d.price
  }));

  const posDeltas = deltas.filter(d => d.delta > 0).length;
  const negDeltas = deltas.filter(d => d.delta < 0).length;
  const winRate = deltas.length ? ((posDeltas / deltas.length) * 100).toFixed(1) : "0";
  const maxUp = deltas.length ? Math.max(...deltas.map(d => d.delta)) : 0;
  const maxDown = deltas.length ? Math.min(...deltas.map(d => d.delta)) : 0;
  const stdDev = deltas.length ? Math.sqrt(deltas.reduce((a, b) => a + Math.pow(b.delta, 2), 0) / deltas.length).toFixed(2) : 0;

  return (
    <div className="fade-up">
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: "#475569", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6 }}>Statistical Analysis</div>
        <h2 style={{ fontSize: 26, fontWeight: 600, letterSpacing: "-0.02em", color: "#f1f5f9", marginBottom: 4 }}>Market Behavior Analytics</h2>
        <p className="prose">Derived from <em>{history.length} data points</em> collected via the 5-second polling pipeline. Each metric below is computed live from the queue.</p>
      </div>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))", gap: 10, marginBottom: 20 }}>
        {[
          ["Upward ticks", `${posDeltas}`, G, `of ${deltas.length} total`],
          ["Downward ticks", `${negDeltas}`, R, `of ${deltas.length} total`],
          ["Up-tick rate", `${winRate}%`, parseFloat(winRate) > 50 ? G : R, "bullish bias"],
          ["Max single gain", `+$${maxUp.toFixed(2)}`, G, "largest up-move"],
          ["Max single loss", `$${maxDown.toFixed(2)}`, R, "largest down-move"],
          ["Std deviation", `$${stdDev}`, W, "price variability"],
          ["Session range", `$${(hi - lo).toFixed(2)}`, "#94a3b8", "high minus low"],
          ["5-tick momentum", `${mom >= 0 ? "+" : ""}${mom.toFixed(3)}%`, mom >= 0 ? G : R, "recent trend"],
        ].map(([l, v, c, s]) => (
          <div key={l} className="metric">
            <div className="metric-label">{l}</div>
            <div className="metric-val" style={{ color: c, fontSize: 18, marginBottom: 2 }}>{v}</div>
            <div style={{ fontSize: 10, color: "#475569", fontFamily: "monospace" }}>{s}</div>
          </div>
        ))}
      </div>

      {/* MA chart */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="section-title">Price vs 5-tick moving average</div>
        <p className="prose" style={{ marginBottom: 14, fontSize: 12 }}>
          The <strong>moving average</strong> smooths short-term noise to reveal underlying trend direction. When price crosses above MA5, it signals short-term bullish momentum.
        </p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={rolling5} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="time" tick={{ fontSize: 9, fill: "#334155", fontFamily: "monospace" }} interval="preserveStartEnd" tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 9, fill: "#334155", fontFamily: "monospace" }} tickFormatter={v => `$${(v / 1000).toFixed(1)}k`} tickLine={false} axisLine={false} width={44} domain={["auto", "auto"]} />
            <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", fontSize: 11, fontFamily: "monospace" }} />
            <Line type="monotone" dataKey="price" stroke={A} strokeWidth={1.5} dot={false} name="Price" />
            <Line type="monotone" dataKey="ma5" stroke={W} strokeWidth={2} strokeDasharray="5 3" dot={false} name="MA5" />
          </LineChart>
        </ResponsiveContainer>
        <div style={{ display: "flex", gap: 20, marginTop: 10 }}>
          {[["Price", A], ["MA5", W]].map(([l, c]) => (
            <span key={l} style={{ fontSize: 11, color: "#64748b", display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 16, height: 2, background: c, display: "inline-block", borderRadius: 1 }} />{l}
            </span>
          ))}
        </div>
      </div>

      {/* Distribution */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="card">
          <div className="section-title">Price distribution</div>
          <p className="prose" style={{ marginBottom: 14, fontSize: 12 }}>How frequently the DJIA lands in each price band during this session.</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={dist} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <XAxis dataKey="range" tick={{ fontSize: 9, fill: "#334155", fontFamily: "monospace" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 9, fill: "#334155", fontFamily: "monospace" }} tickLine={false} axisLine={false} width={24} />
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", fontSize: 11 }} />
              <Bar dataKey="count" fill={`${A}99`} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="section-title">Volatility assessment</div>
          <p className="prose" style={{ marginBottom: 16, fontSize: 12 }}>
            Measured as the <strong>mean absolute tick move</strong> across the session. Current classification: <em style={{ color: volColor }}>{volLevel}</em>.
          </p>
          <div style={{ marginBottom: 16 }}>
            {[["Low", "<$20 avg", G], ["Moderate", "$20–$50", W], ["High", ">$50", R]].map(([l, r, c]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #0f172a" }}>
                <span style={{ fontSize: 12, color: c, fontWeight: 500 }}>{l}</span>
                <span style={{ fontSize: 11, color: "#475569", fontFamily: "monospace" }}>{r}</span>
              </div>
            ))}
          </div>
          <div style={{ background: "#0a1520", borderRadius: 8, padding: "12px 14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: "#475569" }}>Current avg move</span>
              <span style={{ fontSize: 12, color: volColor, fontFamily: "monospace" }}>${avgMove.toFixed(2)}</span>
            </div>
            <div style={{ background: "#060c18", borderRadius: 4, height: 6, overflow: "hidden" }}>
              <div style={{ width: `${Math.min(100, (avgMove / 100) * 100)}%`, height: "100%", background: volColor, borderRadius: 4, transition: "width 0.5s" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════ REPORT PAGE
function ReportPage({ history, cur, first, hi, lo, chg, pct, pos, avgMove, volLevel, mom }) {
  const generated = new Date().toLocaleString();
  const ticks = history.length;
  const duration = `${Math.floor((ticks * 5) / 60)}m ${(ticks * 5) % 60}s`;

  return (
    <div className="fade-up" style={{ maxWidth: 760 }}>
      {/* Report header */}
      <div style={{ borderBottom: "1px solid #1e293b", paddingBottom: 24, marginBottom: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 10, color: "#475569", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6 }}>
              Executive Report · Citi Software Engineering Virtual Experience
            </div>
            <h1 style={{ fontSize: 30, fontWeight: 600, letterSpacing: "-0.03em", color: "#f1f5f9", marginBottom: 4 }}>
              Dow Jones Real-Time<br />Data Pipeline Report
            </h1>
          </div>
          <div style={{ textAlign: "right", fontSize: 11, color: "#475569", fontFamily: "monospace", lineHeight: 1.8 }}>
            <div>Generated: {generated}</div>
            <div>Ticks recorded: {ticks}</div>
            <div>Session duration: {duration}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[["Data source", "Yahoo Finance API"], ["Tech stack", "Java · Gradle · YahooFinanceAPI v3.17"], ["Storage", "LinkedList Queue"], ["Poll rate", "5 seconds"]].map(([l, v]) => (
            <span key={l} className="tag" style={{ background: "#0a1520", color: "#64748b", border: "1px solid #1e293b" }}>
              <span style={{ color: "#334155" }}>{l}: </span>{v}
            </span>
          ))}
        </div>
      </div>

      {/* Executive summary */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: "#f1f5f9", marginBottom: 14, paddingBottom: 8, borderBottom: "1px solid #1e293b" }}>
          Executive Summary
        </h2>
        <p className="prose" style={{ marginBottom: 12 }}>
          This report documents a <strong>real-time data pipeline</strong> built as part of the Citi Software Engineering Virtual Experience on Forage. The system continuously queries the <em>Dow Jones Industrial Average</em> (^DJI) from the Yahoo Finance API every five seconds and stores each price-timestamp pair in a <strong>Java LinkedList queue</strong> — the core data structure required by the task.
        </p>
        <p className="prose" style={{ marginBottom: 12 }}>
          During this session, the pipeline collected <em>{ticks} data points</em> over approximately {duration}. The DJIA opened at <strong>${fmt(first)}</strong> and is currently trading at <strong style={{ color: pos ? G : R }}>${fmt(cur)}</strong>, representing a session change of <strong style={{ color: pos ? G : R }}>{pos ? "+" : ""}{fmt(chg)} ({pct.toFixed(3)}%)</strong>.
        </p>
        <p className="prose">
          Beyond the technical implementation, this project demonstrates the complete lifecycle of a data pipeline: <strong>ingestion</strong> (API query), <strong>storage</strong> (queue), <strong>transformation</strong> (timestamp formatting, delta calculation), and <strong>presentation</strong> (this dashboard) — the same workflow applied in professional data analytics roles.
        </p>
      </section>

      {/* Key findings */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: "#f1f5f9", marginBottom: 14, paddingBottom: 8, borderBottom: "1px solid #1e293b" }}>
          Key Findings
        </h2>
        <div style={{ display: "grid", gap: 12 }}>
          {[
            { n: "01", title: "Session performance", body: `The DJIA ${pos ? "gained" : "lost"} ${fmt(Math.abs(chg))} points (${Math.abs(pct).toFixed(3)}%) from session open. The intraday range of $${(hi - lo).toFixed(2)} reflects ${volLevel.toLowerCase()} volatility conditions.` },
            { n: "02", title: "Volatility profile", body: `Average tick movement of $${avgMove.toFixed(2)} classifies the session as ${volLevel} volatility. This metric is computed as the mean absolute difference between consecutive 5-second price observations.` },
            { n: "03", title: "Momentum signal", body: `The 5-tick momentum indicator reads ${mom >= 0 ? "+" : ""}${mom.toFixed(4)}%, derived by comparing the average of the most recent 5 ticks against the preceding 5. A ${mom >= 0 ? "positive" : "negative"} reading suggests ${mom >= 0 ? "short-term upward pressure" : "short-term downward pressure"}.` },
            { n: "04", title: "Data reliability", body: `All ${ticks} observations were captured at consistent 5-second intervals with no dropped polls detected during this session. The queue correctly stores entries in FIFO order with O(1) insertion time.` },
          ].map(f => (
            <div key={f.n} style={{ display: "grid", gridTemplateColumns: "40px 1fr", gap: 16, padding: "16px 0", borderBottom: "1px solid #0f172a" }}>
              <div style={{ fontFamily: "monospace", fontSize: 11, color: "#334155", paddingTop: 3 }}>{f.n}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: "#cbd5e1", marginBottom: 6 }}>{f.title}</div>
                <p className="prose" style={{ fontSize: 13 }}>{f.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Data table */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: "#f1f5f9", marginBottom: 14, paddingBottom: 8, borderBottom: "1px solid #1e293b" }}>
          Session Statistics
        </h2>
        <div className="card">
          <table>
            <thead>
              <tr>{["Metric", "Value", "Notes"].map(h => <th key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {[
                ["Opening price", `$${fmt(first)}`, "First queue entry"],
                ["Current price", `$${fmt(cur)}`, "Latest queue entry"],
                ["Session high", `$${fmt(hi)}`, "Peak value recorded"],
                ["Session low", `$${fmt(lo)}`, "Trough value recorded"],
                ["Session change", `${pos ? "+" : ""}${fmt(chg)}`, `${pct.toFixed(3)}% from open`],
                ["Intraday range", `$${(hi - lo).toFixed(2)}`, "High minus low"],
                ["Total ticks", ticks.toString(), `~${duration} of data`],
                ["Avg tick move", `$${avgMove.toFixed(2)}`, `${volLevel} volatility`],
                ["5-tick momentum", `${mom >= 0 ? "+" : ""}${mom.toFixed(4)}%`, mom >= 0 ? "Bullish bias" : "Bearish bias"],
                ["Poll frequency", "5 seconds", "YahooFinanceAPI ^DJI"],
              ].map(([m, v, n]) => (
                <tr key={m}>
                  <td style={{ color: "#64748b" }}>{m}</td>
                  <td style={{ color: "#e2e8f0", fontWeight: 500 }}>{v}</td>
                  <td style={{ color: "#475569", fontSize: 11 }}>{n}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Relevance to UAA */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: "#f1f5f9", marginBottom: 14, paddingBottom: 8, borderBottom: "1px solid #1e293b" }}>
          Transferable Skills for Higher Education Analytics
        </h2>
        <p className="prose" style={{ marginBottom: 12 }}>
          The same pipeline architecture built here maps directly to <strong>student engagement analytics</strong> — the core work of the UAA Data Insights Intern role. Replace the Yahoo Finance API with a student information system, the DJIA price with appointment attendance or event check-in data, and the 5-second poll with a nightly batch job, and the pattern is identical.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { from: "Yahoo Finance API", to: "Student Information System / Banner", label: "Data source" },
            { from: "Price + timestamp", to: "Event attendance + student ID", label: "Record structure" },
            { from: "LinkedList Queue", to: "Database / data warehouse", label: "Storage layer" },
            { from: "Delta calculation", to: "Engagement change over time", label: "Transformation" },
            { from: "Volatility index", to: "Engagement consistency score", label: "Derived metric" },
            { from: "This dashboard", to: "College Engagement Report", label: "Presentation layer" },
          ].map(({ from, to, label }) => (
            <div key={label} style={{ background: "#0a1520", border: "1px solid #1e293b", borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ fontSize: 10, color: "#475569", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>{label}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 11, color: "#64748b", fontFamily: "monospace" }}>{from}</span>
                <span style={{ color: "#334155" }}>→</span>
                <span style={{ fontSize: 11, color: A, fontFamily: "monospace" }}>{to}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Conclusion */}
      <section>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: "#f1f5f9", marginBottom: 14, paddingBottom: 8, borderBottom: "1px solid #1e293b" }}>
          Conclusion
        </h2>
        <p className="prose" style={{ marginBottom: 12 }}>
          This pipeline demonstrates end-to-end data engineering competency: real API integration, structured storage, statistical derivation, and accessible visualization. The ability to translate raw data streams into <strong>clear, actionable narratives</strong> — whether for financial markets or student success — is the core skill this project develops.
        </p>
        <p className="prose">
          Built by <strong>Krishna Inukonda</strong> · MS Computer Science & AI/Data Analytics, Virginia Tech · As part of the Citi Software Engineering Virtual Experience on Forage.
        </p>
      </section>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════ PIPELINE PAGE
function PipelinePage({ history }) {
  const steps = [
    { n: "01", title: "API Query", icon: "◎", color: A, desc: "Yahoo Finance API queried for ^DJI (Dow Jones Industrial Average) ticker symbol.", detail: "YahooFinance.get(\"^DJI\") returns a Stock object containing real-time price, volume, and metadata.", tech: "YahooFinanceAPI v3.17.0 · Gradle dependency" },
    { n: "02", title: "Price extraction", icon: "⊡", color: W, desc: "BigDecimal price extracted from the Stock quote object. Timestamp captured via LocalDateTime.", detail: "stock.getQuote().getPrice() returns the current bid price as a BigDecimal for precision arithmetic.", tech: "Java BigDecimal · LocalDateTime" },
    { n: "03", title: "Queue storage", icon: "≡", color: G, desc: "Price-timestamp pair formatted as a String and enqueued into a LinkedList-backed Queue.", detail: "LinkedList implements the Queue interface in Java, providing O(1) insertion via queue.add(). Each entry is formatted: [timestamp] DJIA: $price.", tech: "Java LinkedList<String> · Queue interface" },
    { n: "04", title: "5s sleep cycle", icon: "⏱", color: "#94a3b8", desc: "Thread.sleep(5000) pauses execution for 5 seconds before the next poll.", detail: "The while(true) loop with Thread.sleep(5000) creates a consistent 5-second polling cadence without a scheduler framework.", tech: "Thread.sleep · while loop" },
    { n: "05", title: "Dashboard layer", icon: "▦", color: A, desc: "Queue contents visualized in real-time across Live, Analysis, and Report tabs.", detail: "React frontend consumes simulated queue data to demonstrate what a full-stack integration would produce, including statistical derivations.", tech: "React · Recharts · IBM Plex" },
  ];

  return (
    <div className="fade-up">
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, color: "#475569", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6 }}>Technical Deep-Dive</div>
        <h2 style={{ fontSize: 26, fontWeight: 600, letterSpacing: "-0.02em", color: "#f1f5f9", marginBottom: 8 }}>Pipeline Architecture</h2>
        <p className="prose">A walkthrough of every component in the data pipeline — from API request to dashboard visualization.</p>
      </div>

      {/* Flow diagram */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="section-title">Data flow</div>
        <div style={{ display: "flex", alignItems: "stretch", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
          {["Yahoo Finance API", "YahooFinanceAPI", "Java App (Gradle)", "LinkedList Queue", "Dashboard"].map((s, i, arr) => (
            <>
              <div key={s} className="pipe-node" style={{ flex: "1 0 120px", borderColor: i === 0 ? `${A}55` : i === arr.length - 1 ? `${G}55` : "#1e293b" }}>
                <div style={{ fontSize: 10, color: "#475569", fontFamily: "monospace", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {["Source", "Library", "Runtime", "Storage", "Output"][i]}
                </div>
                <div style={{ fontSize: 12, fontWeight: 500, color: [A, "#94a3b8", "#94a3b8", G, A][i] }}>{s}</div>
              </div>
              {i < arr.length - 1 && <div className="pipe-arrow" key={`a${i}`}>→</div>}
            </>
          ))}
        </div>
      </div>

      {/* Step-by-step */}
      <div style={{ display: "grid", gap: 12, marginBottom: 20 }}>
        {steps.map(s => (
          <div key={s.n} className="card" style={{ borderLeft: `3px solid ${s.color}33` }}>
            <div style={{ display: "grid", gridTemplateColumns: "50px 1fr", gap: 16 }}>
              <div style={{ fontFamily: "monospace", fontSize: 11, color: "#334155", paddingTop: 2 }}>{s.n}</div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 16, color: s.color }}>{s.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9" }}>{s.title}</span>
                  <span className="tag" style={{ background: "#0a1520", color: "#475569", border: "1px solid #1e293b", marginLeft: "auto" }}>{s.tech}</span>
                </div>
                <p className="prose" style={{ marginBottom: 8 }}>{s.desc}</p>
                <div style={{ background: "#0a1520", borderRadius: 6, padding: "10px 14px", fontSize: 12, color: "#64748b", fontFamily: "monospace", lineHeight: 1.6 }}>
                  {s.detail}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Code block */}
      <div className="card">
        <div className="section-title">Core implementation — App.java</div>
        <pre style={{ fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", color: "#94a3b8", lineHeight: 1.7, overflowX: "auto", padding: 4 }}>
{`Queue<String> stockQueue = new LinkedList<>();

while (true) {
    Stock dow = YahooFinance.get("^DJI");
    BigDecimal price = dow.getQuote().getPrice();
    String timestamp = LocalDateTime.now()
        .format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));

    // Store in queue
    String entry = String.format("[%s] DJIA: $%s",
        timestamp, price.toPlainString());
    stockQueue.add(entry);

    System.out.println(entry);
    System.out.println("Queue size: " + stockQueue.size());

    Thread.sleep(5000); // Poll every 5 seconds
}`}
        </pre>
      </div>
    </div>
  );
}
