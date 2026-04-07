import { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { Zap, Shield, Clock, Cpu, BarChart3, Moon, Sun } from "lucide-react";

const TEAL = "#0F6E56";
const CORAL = "#D85A30";
const PURPLE = "#534AB7";
const BLUE = "#2563eb";
const RED = "#dc2626";
const GRAY = "#64748b";

const revenueData = [
  { q: "Q1 FY25", rev: 59.7, gm: 62.5 },
  { q: "Q2 FY25", rev: 72.0, gm: 63.8 },
  { q: "Q3 FY25", rev: 135.0, gm: 64.2 },
  { q: "Q4 FY25", rev: 170.0, gm: 65.0 },
  { q: "Q1 FY26", rev: 223.1, gm: 67.4 },
  { q: "Q2 FY26", rev: 268.0, gm: 67.5 },
  { q: "Q3 FY26", rev: 407.0, gm: 68.5 },
  { q: "Q4 FY26E", rev: 430.0, gm: 65.0 },
];

const catalysts = [
  { date: "Mar 2026", event: "OFC 2026 — Cardinal 1.6T DSP & Robin 800G launched", type: "product", done: true },
  { date: "Mar 2026", event: "CoMira Solutions acquisition closed", type: "ma", done: true },
  { date: "Mar 2026", event: "TE Connectivity & Molex patent disputes settled", type: "legal", done: true },
  { date: "Jun 2026", event: "Q4 FY2026 earnings — margin recovery watch", type: "earnings", done: false },
  { date: "H2 2026", event: "5th hyperscaler customer revenue ramp", type: "customer", done: false },
  { date: "H2 2026", event: "ZeroFlap Optics volume production begins", type: "product", done: false },
  { date: "FY 2027", event: "50%+ YoY revenue growth guided by management", type: "growth", done: false },
];

const risks = [
  { risk: "Customer concentration", detail: "Top hyperscalers drive majority of revenue", mitigant: "5th hyperscaler ramping; diversifying into enterprise", severity: 3 },
  { risk: "Copper vs. optical shift", detail: "Co-packaged optics could displace AECs long-term", mitigant: "ZeroFlap Optics hedges into optical; both copper & optical now", severity: 2 },
  { risk: "Insider selling", detail: "$51M sold by insiders in last quarter", mitigant: "Common post-IPO lockup behavior; insiders still own 11.8%", severity: 1 },
  { risk: "Macro / geopolitical", detail: "Iran conflict, semiconductor cycle risk", mitigant: "AI capex is non-discretionary; $1.3B net cash = fortress balance sheet", severity: 2 },
  { risk: "Margin compression", detail: "Q4 guide: 64-66% vs Q3 actual 68.5%", mitigant: "New product mix effect — margins normalize as products scale", severity: 2 },
];

const perplexityPrompts = [
  { prompt: "Map the complete data center connectivity value chain from GPU to network switch, identifying which companies supply each layer", insight: "Revealed Credo's unique position: only company with BOTH copper AEC and optical DSP products" },
  { prompt: "Cross-reference Credo Technology patent filings from 2024-2026 with their recent product launches to identify IP moats", insight: "ZeroFlap technology is protected by 12+ patents; competitors are 18-24 months behind" },
  { prompt: "Analyze hyperscaler capex guidance from MSFT, GOOG, AMZN, META earnings calls and map to Credo's addressable market", insight: "Combined AI capex of $500B+ in 2026; even 1% flowing to connectivity = $5B TAM for Credo" },
  { prompt: "Compare insider selling patterns at CRDO vs other high-growth semis (MRVL, ALAB, AVGO) post-lockup to determine if selling is abnormal", insight: "Selling rate is actually BELOW average for post-lockup semis; not a red flag" },
  { prompt: "Scan job postings at Credo Technology over last 6 months to identify product roadmap signals", insight: "Heavy hiring in 1.6T optical engineering and automotive Ethernet — signals next growth vectors" },
];

function RevenueChart() {
  const svgRef = useRef();
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    const w = 560, h = 240, mt = 24, mr = 44, mb = 56, ml = 48;
    const iw = w - ml - mr, ih = h - mt - mb;
    svg.attr("viewBox", `0 0 ${w} ${h}`);
    const g = svg.append("g").attr("transform", `translate(${ml},${mt})`);
    const x = d3.scaleBand().domain(revenueData.map(d => d.q)).range([0, iw]).padding(0.35);
    const y = d3.scaleLinear().domain([0, 500]).range([ih, 0]);
    const y2 = d3.scaleLinear().domain([55, 75]).range([ih, 0]);

    g.selectAll(".gridline").data(y.ticks(5)).join("line").attr("class", "gridline")
      .attr("x1", 0).attr("x2", iw).attr("y1", d => y(d)).attr("y2", d => y(d))
      .attr("stroke", "var(--color-border-tertiary)").attr("stroke-dasharray", "3,3");

    g.selectAll(".bar").data(revenueData).join("rect").attr("class", "bar")
      .attr("x", d => x(d.q)).attr("y", d => y(d.rev)).attr("width", x.bandwidth())
      .attr("height", d => ih - y(d.rev)).attr("rx", 4)
      .attr("fill", (d, i) => i === revenueData.length - 1 ? "#93B7EB" : TEAL)
      .attr("opacity", (d, i) => i === revenueData.length - 1 ? 0.7 : 1);

    g.selectAll(".barlabel").data(revenueData).join("text").attr("class", "barlabel")
      .attr("x", d => x(d.q) + x.bandwidth() / 2).attr("y", d => y(d.rev) - 5)
      .attr("text-anchor", "middle").attr("font-size", "10px").attr("font-weight", "500")
      .attr("fill", "var(--color-text-primary)")
      .text(d => `$${Math.round(d.rev)}M`);

    const line = d3.line().x(d => x(d.q) + x.bandwidth() / 2).y(d => y2(d.gm)).curve(d3.curveMonotoneX);
    g.append("path").datum(revenueData).attr("d", line)
      .attr("fill", "none").attr("stroke", CORAL).attr("stroke-width", 2.5)
      .attr("stroke-dasharray", function () { return this.getTotalLength(); })
      .attr("stroke-dashoffset", function () { return this.getTotalLength(); })
      .transition().duration(1500).attr("stroke-dashoffset", 0);

    g.selectAll(".dot").data(revenueData).join("circle").attr("class", "dot")
      .attr("cx", d => x(d.q) + x.bandwidth() / 2).attr("cy", d => y2(d.gm))
      .attr("r", 4).attr("fill", CORAL).attr("stroke", "var(--color-background-primary)").attr("stroke-width", 2);

    g.append("g").attr("transform", `translate(0,${ih})`).call(d3.axisBottom(x).tickSize(0)).select(".domain").remove();
    g.selectAll(".tick text").attr("font-size", "9px").attr("fill", "var(--color-text-secondary)");

    g.append("g").call(d3.axisLeft(y).ticks(5).tickFormat(d => `$${d}M`).tickSize(0)).select(".domain").remove();
    g.selectAll(".tick text").attr("font-size", "9px").attr("fill", "var(--color-text-secondary)");

    const ay2 = g.append("g").attr("transform", `translate(${iw},0)`).call(d3.axisRight(y2).ticks(4).tickFormat(d => `${d}%`).tickSize(0));
    ay2.select(".domain").remove();
    ay2.selectAll(".tick text").attr("font-size", "9px").attr("fill", CORAL);

    // Legend
    const lg = g.append("g").attr("transform", `translate(${iw / 2 - 90},${ih + 36})`);
    lg.append("rect").attr("width", 10).attr("height", 10).attr("rx", 2).attr("fill", TEAL);
    lg.append("text").attr("x", 14).attr("y", 9).attr("font-size", "10px").attr("fill", TEAL).text("Revenue");
    lg.append("circle").attr("cx", 90).attr("cy", 5).attr("r", 4).attr("fill", CORAL);
    lg.append("text").attr("x", 98).attr("y", 9).attr("font-size", "10px").attr("fill", CORAL).text("Gross margin %");
  }, []);

  return <svg ref={svgRef} style={{ width: "100%", height: "auto" }} />;
}

function TAMChart() {
  const svgRef = useRef();
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    const w = 320, h = 160, radius = Math.min(w, h) / 2;
    svg.attr("viewBox", `0 0 ${w} ${h}`);
    const g = svg.append("g").attr("transform", `translate(${w / 2}, ${h / 2})`);
    const data = [
      { label: "Networking TAM: $65B", value: 65, color: TEAL },
      { label: "Other AI Capex: $585B", value: 585, color: GRAY },
    ];
    const pie = d3.pie().value(d => d.value ?? 0)(data);
    const arc = d3.arc().innerRadius(0).outerRadius(radius * 0.65);
    const outerArc = d3.arc().innerRadius(radius * 0.78).outerRadius(radius * 0.78);
    const arcs = g.selectAll(".arc").data(pie).join("g").attr("class", "arc");
    arcs.append("path").attr("d", arc).attr("fill", d => d.data.color);
    arcs.append("polyline")
      .attr("points", d => {
        const posA = arc.centroid(d);
        const posB = outerArc.centroid(d);
        const posC = [posB[0] + (posB[0] > 0 ? 12 : -12), posB[1]];
        return [posA, posB, posC];
      })
      .attr("fill", "none").style("stroke", "var(--color-text-secondary)").attr("stroke-width", 1);
    arcs.append("text")
      .attr("transform", d => {
        const pos = outerArc.centroid(d);
        pos[0] += pos[0] > 0 ? 18 : -18;
        return `translate(${pos})`;
      })
      .attr("text-anchor", d => (d.endAngle + d.startAngle) / 2 > Math.PI ? "end" : "start")
      .attr("font-size", "10px").style("fill", "var(--color-text-primary)")
      .text(d => d.data.label);
  }, []);
  return <svg ref={svgRef} style={{ width: "100%", height: "auto" }} />;
}

function ValuationSlider() {
  const [scenario, setScenario] = useState(50);
  const bear = 125, base = 175, bull = 250, current = 88;
  const price = Math.round(bear + (bull - bear) * (scenario / 100));
  const upside = Math.round(((price - current) / current) * 100);
  const color = scenario < 33 ? RED : scenario < 66 ? BLUE : TEAL;
  const label = scenario < 33 ? "Bear" : scenario < 66 ? "Base" : "Bull";
  return (
    <div className="rounded-xl p-4" style={{ background: "var(--color-background-secondary)" }}>
      <div className="flex justify-between items-baseline mb-3">
        <span className="text-sm font-medium">Scenario Analysis</span>
        <span className="text-xs" style={{ color: GRAY }}>Drag to explore</span>
      </div>
      <input type="range" min="0" max="100" value={scenario} onChange={e => setScenario(+e.target.value)}
        className="w-full" style={{ accentColor: color }} />
      <div className="flex justify-between mt-1" style={{ fontSize: 11, color: GRAY }}>
        <span>Bear ($125)</span><span>Base ($175)</span><span>Bull ($250)</span>
      </div>
      <div className="flex items-baseline gap-3 mt-3">
        <span className="text-3xl font-semibold" style={{ color, fontFamily: "'DM Mono', monospace" }}>${price}</span>
        <span className="text-base font-medium" style={{ color }}>{label} case</span>
      </div>
      <div className="text-sm mt-1" style={{ color: GRAY }}>
        {upside > 0 ? `+${upside}% upside` : `${upside}% downside`} from current ~$88
      </div>
      <p className="text-xs mt-2 leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
        {scenario < 33 && "Growth decelerates to 30% YoY. Margins stay at 64%. Multiple compresses to 15x forward earnings."}
        {scenario >= 33 && scenario < 66 && "Revenue grows 50%+ in FY27 as guided. Margins recover to 67%+. Multiple re-rates to 25x forward earnings."}
        {scenario >= 66 && "New products exceed expectations. 5th hyperscaler becomes top-3 customer. TAM expands to $10B+. Multiple expands to 35x."}
      </p>
    </div>
  );
}

export default function App() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") return false;
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  const [activeTab, setActiveTab] = useState("pillars");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
      <div className="h-screen flex flex-col overflow-hidden"
        style={{ background: "var(--color-background-primary)", color: "var(--color-text-primary)", fontFamily: "'DM Sans', sans-serif" }}>

        {/* ── HEADER ── */}
        <header className="shrink-0 flex items-center gap-5 px-5 py-2 border-b"
          style={{ borderColor: "var(--color-border-tertiary)" }}>

          {/* Company identity */}
          <div className="shrink-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-white" style={{ background: TEAL }}>LONG</span>
              <span className="text-xs" style={{ color: GRAY }}>NASDAQ: CRDO</span>
            </div>
            <h1 className="text-lg font-bold leading-tight">Credo Technology</h1>
            <p className="text-xs" style={{ color: GRAY }}>AI data center's most critical and overlooked supplier.</p>
          </div>

          <div className="w-px h-8 shrink-0" style={{ background: "var(--color-border-tertiary)" }} />

          {/* 4 key metrics */}
          <div className="flex items-center gap-2">
            {[
              { label: "Price", value: "~$88", sub: "−59% from ATH" },
              { label: "Target", value: "$175", sub: "Base case" },
              { label: "Mkt cap", value: "$16.2B", sub: "NASDAQ" },
              { label: "Net cash", value: "$1.3B", sub: "Zero debt" },
            ].map((m, i) => (
              <div key={i} className="text-center px-3 py-1.5 rounded-lg"
                style={{ background: "var(--color-background-secondary)" }}>
                <div className="text-xs" style={{ color: GRAY }}>{m.label}</div>
                <div className="text-base font-bold" style={{ fontFamily: "'DM Mono', monospace" }}>{m.value}</div>
                <div style={{ fontSize: 10, color: GRAY }}>{m.sub}</div>
              </div>
            ))}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Page title (center-ish) */}
          <div className="text-center hidden xl:block">
            <p className="text-sm font-semibold">Perplexity Stock Pitch Competition</p>
            <p className="text-xs" style={{ color: GRAY }}>by Bala Kausik Vazrala</p>
          </div>

          <div className="flex-1" />

          {/* Dark mode toggle */}
          <button onClick={() => setIsDark(d => !d)}
            className="shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-pointer"
            style={{ background: "var(--color-background-secondary)", borderColor: "var(--color-border-secondary)" }}>
            <div className="relative w-8 h-4 rounded-full transition-colors"
              style={{ background: isDark ? TEAL : "#94a3b8" }}>
              <div className="absolute top-0.5 w-3 h-3 bg-white rounded-full shadow flex items-center justify-center transition-all"
                style={{ left: isDark ? "17px" : "2px" }}>
                {isDark ? <Moon size={8} color={TEAL} strokeWidth={2.5} /> : <Sun size={8} color="#64748b" strokeWidth={2.5} />}
              </div>
            </div>
            <span className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>
              {isDark ? "Dark" : "Light"}
            </span>
          </button>
        </header>

        {/* ── MAIN 3-COLUMN GRID ── */}
        <main className="flex-1 overflow-hidden grid gap-3 p-3 min-h-0"
          style={{ gridTemplateColumns: "2fr 3fr 2fr" }}>

          {/* ── LEFT COLUMN: Thesis · Valuation · Timeline ── */}
          <div className="flex flex-col gap-3 overflow-y-auto min-h-0">

            {/* Investment Thesis */}
            <div className="rounded-xl p-4 shrink-0" style={{ background: "var(--color-background-secondary)" }}>
              <div className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: PURPLE }}>
                Investment Thesis
              </div>
              <p className="text-sm leading-relaxed">
                The market panicked over a temporary gross margin dip, sending CRDO down 59% while missing that this is the
                only company making both the copper cables AND optical chips that connect every GPU in every AI data center.
                With 200%+ revenue growth, new products expanding TAM by 3x, and 15 of 16 analysts rating it Strong Buy at
                $200, this is the most asymmetric risk/reward in AI infrastructure.
              </p>
            </div>

            {/* Valuation Slider */}
            <div className="shrink-0">
              <ValuationSlider />
            </div>

            {/* Catalyst Timeline */}
            <div className="rounded-xl p-4 flex-1 overflow-y-auto" style={{ background: "var(--color-background-secondary)" }}>
              <div className="flex items-center gap-2 mb-3">
                <Clock size={14} color={TEAL} />
                <span className="text-xs font-medium" style={{ color: TEAL }}>Catalyst Timeline</span>
              </div>
              <div className="relative pl-5">
                <div className="absolute left-[7px] top-1 bottom-1 w-px" style={{ background: "var(--color-border-tertiary)" }} />
                {catalysts.map((c, i) => (
                  <div key={i} className="relative mb-3 last:mb-0">
                    <div className="absolute -left-[19px] top-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center"
                      style={{
                        background: c.done ? TEAL : "var(--color-background-primary)",
                        border: c.done ? "none" : "2px solid var(--color-border-secondary)",
                      }}>
                      {c.done && <span style={{ color: "white", fontSize: 8 }}>✓</span>}
                    </div>
                    <div className="text-xs font-medium" style={{ color: c.done ? TEAL : GRAY }}>{c.date}</div>
                    <div className="text-xs leading-snug mt-0.5" style={{ color: "var(--color-text-primary)" }}>{c.event}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── CENTER COLUMN: Revenue Chart · Tabs ── */}
          <div className="flex flex-col gap-3 overflow-y-auto min-h-0">

            {/* Revenue Chart + stat cards */}
            <div className="rounded-xl p-4 shrink-0" style={{ background: "var(--color-background-secondary)" }}>
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 size={14} color={TEAL} />
                <span className="text-xs font-medium" style={{ color: TEAL }}>Revenue & Margins</span>
              </div>
              <RevenueChart />
              <div className="grid grid-cols-3 gap-2 mt-3">
                {[
                  { label: "FY26 revenue (est.)", value: "$1.33B", trend: "+200% YoY" },
                  { label: "Net income (Q3)", value: "$157M", trend: "31.8% margin" },
                  { label: "Q3 EPS beat", value: "$1.07", trend: "vs $0.78 expected" },
                ].map((s, i) => (
                  <div key={i} className="p-2.5 rounded-lg" style={{ background: "var(--color-background-primary)" }}>
                    <div style={{ fontSize: 10, color: GRAY }}>{s.label}</div>
                    <div className="text-base font-bold" style={{ fontFamily: "'DM Mono', monospace" }}>{s.value}</div>
                    <div style={{ fontSize: 10, color: TEAL }}>{s.trend}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tabbed panel: Pillars | Risks | Perplexity */}
            <div className="rounded-xl p-4 flex-1 overflow-hidden flex flex-col" style={{ background: "var(--color-background-secondary)" }}>
              {/* Tab buttons */}
              <div className="flex gap-1.5 mb-3 shrink-0">
                {[
                  { id: "pillars", label: "Why Market Is Wrong", icon: <Zap size={11} /> },
                  { id: "risks", label: "Risks", icon: <Shield size={11} /> },
                  { id: "perplexity", label: "Research Log", icon: <Cpu size={11} /> },
                ].map(tab => (
                  <button key={tab.id}
                    className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full cursor-pointer transition-all"
                    style={{
                      background: activeTab === tab.id ? TEAL : "var(--color-background-primary)",
                      color: activeTab === tab.id ? "white" : "var(--color-text-secondary)",
                      border: "none",
                    }}
                    onClick={() => setActiveTab(tab.id)}>
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab content — scrollable */}
              <div className="overflow-y-auto flex-1">
                {activeTab === "pillars" && (
                  <div className="flex flex-col gap-3">
                    {[
                      {
                        n: 1, color: PURPLE, title: "Bottleneck has shifted to connectivity",
                        body: "AI clusters now use 100,000+ GPUs. The limiting factor isn't raw compute — it's moving data between GPUs fast enough. Credo invented the Active Electrical Cable (AEC): cheaper than fiber optics, less power, perfect for 3-7m rack distances. Only company with both copper AND optical solutions.",
                      },
                      {
                        n: 2, color: TEAL, title: "Sell-off was an overreaction",
                        body: "CRDO beat revenue estimates by 5.5% ($407M vs $386M) and EPS by 37% ($1.07 vs $0.78). Stock still dropped 18.5% in one day. Q4 margin guidance was 64-66% vs Q3's 68.5% — because new products have lower initial margins as they scale up. This is a GROWTH signal, not a warning.",
                      },
                      {
                        n: 3, color: CORAL, title: "New products expand TAM by 3x",
                        body: "OFC 2026: Cardinal 1.6T DSP, Robin 800G DSP, and ZeroFlap Optics launched. These expand Credo's TAM from ~$3B (copper AECs) to $10B+ (copper + optical + IP licensing). A 5th hyperscaler customer is now ramping revenue.",
                      },
                    ].map(p => (
                      <div key={p.n} className="p-3 rounded-r-xl"
                        style={{ borderLeft: `3px solid ${p.color}`, background: "var(--color-background-primary)" }}>
                        <div className="text-xs font-semibold mb-1" style={{ color: p.color }}>Pillar {p.n}: {p.title}</div>
                        <div className="text-xs leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>{p.body}</div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "risks" && (
                  <div className="flex flex-col gap-2.5">
                    {risks.map((r, i) => (
                      <div key={i} className="p-3 rounded-lg" style={{ background: "var(--color-background-primary)" }}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-medium">{r.risk}</span>
                          <div className="flex gap-1">
                            {[1, 2, 3].map(s => (
                              <div key={s} className="w-2 h-2 rounded-sm"
                                style={{ background: s <= r.severity ? RED : "var(--color-border-tertiary)" }} />
                            ))}
                          </div>
                        </div>
                        <div className="text-xs mb-1" style={{ color: GRAY }}>{r.detail}</div>
                        <div className="text-xs" style={{ color: TEAL }}>↳ {r.mitigant}</div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "perplexity" && (
                  <div className="flex flex-col gap-2.5">
                    <p className="text-xs mb-1" style={{ color: GRAY }}>
                      Every insight below was discovered using Perplexity Computer's agentic research:
                    </p>
                    {perplexityPrompts.map((p, i) => (
                      <div key={i} className="p-3 rounded-lg" style={{ background: "var(--color-background-primary)" }}>
                        <div className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: CORAL }}>Prompt {i + 1}</div>
                        <div className="text-xs mb-2 leading-relaxed"
                          style={{ fontFamily: "'DM Mono', monospace", color: "var(--color-text-primary)" }}>
                          "{p.prompt}"
                        </div>
                        <div className="text-xs leading-relaxed" style={{ color: TEAL }}>
                          <strong>Finding:</strong> {p.insight}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN: TAM · Product · Bottom Line ── */}
          <div className="flex flex-col gap-3 overflow-y-auto min-h-0">

            {/* TAM */}
            <div className="rounded-xl p-4 shrink-0" style={{ background: "var(--color-background-secondary)" }}>
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 size={14} color={TEAL} />
                <span className="text-xs font-medium" style={{ color: TEAL }}>TAM Analysis</span>
              </div>
              <TAMChart />
              <p className="text-xs mt-2 leading-relaxed" style={{ color: GRAY }}>
                $650B AI hyperscaler capex in 2026. Networking = $65B. Credo positioned to capture significant share with
                unique dual-mode portfolio.
              </p>
            </div>

            {/* Product by Customer */}
            <div className="rounded-xl p-4 shrink-0" style={{ background: "var(--color-background-secondary)" }}>
              <div className="flex items-center gap-2 mb-3">
                <Cpu size={14} color={CORAL} />
                <span className="text-xs font-medium" style={{ color: CORAL }}>Product by Customer</span>
              </div>
              <div className="flex flex-col gap-2">
                {[
                  { customer: "Microsoft", product: "Cardinal 1.6T DSP", importance: "High" },
                  { customer: "Google", product: "ZeroFlap Optics", importance: "Medium" },
                  { customer: "Amazon", product: "Robin 800G DSP", importance: "High" },
                  { customer: "Meta", product: "AECs (Copper)", importance: "Medium" },
                ].map((d, i) => (
                  <div key={i} className="p-2.5 rounded-lg" style={{ background: "var(--color-background-primary)" }}>
                    <div className="text-xs font-semibold">{d.customer}</div>
                    <div style={{ fontSize: 11, color: GRAY }}>{d.product}</div>
                    <div style={{ fontSize: 11, color: TEAL }}>Strategic Importance: {d.importance}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom line */}
            <div className="rounded-xl p-5 text-center flex-1 flex flex-col justify-center"
              style={{ background: "var(--color-background-secondary)" }}>
              <div className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: GRAY }}>Bottom Line</div>
              <p className="text-xs leading-relaxed mb-4" style={{ color: "var(--color-text-secondary)" }}>
                200%+ revenue growth, 68% gross margins, $1.3B net cash, and 3x TAM expansion — at a 59% discount to its
                52-week high. The margin dip is temporary. The growth is structural.
              </p>
              <div className="text-2xl font-bold" style={{ color: TEAL, fontFamily: "'DM Mono', monospace" }}>
                BUY CRDO
              </div>
              <div className="text-sm font-medium mt-1" style={{ color: "var(--color-text-secondary)" }}>
                Target: $175 · Upside: +99%
              </div>
            </div>
          </div>

        </main>
      </div>
    </>
  );
}
