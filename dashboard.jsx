import { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { TrendingUp, TrendingDown, AlertTriangle, Target, Zap, Shield, Clock, ChevronDown, ChevronUp, DollarSign, Cpu, Cable, BarChart3, ArrowUpRight, Moon, Sun } from "lucide-react";

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
    const w = 640, h = 280, mt = 30, mr = 50, mb = 60, ml = 50; // Increased bottom margin for labels
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
      .attr("fill", (d, i) => i === revenueData.length - 1 ? "#93B7EB" : TEAL) // Last bar is blue
      .attr("opacity", (d, i) => i === revenueData.length - 1 ? 0.7 : 1);

    g.selectAll(".barlabel").data(revenueData).join("text").attr("class", "barlabel")
      .attr("x", d => x(d.q) + x.bandwidth() / 2).attr("y", d => y(d.rev) - 6)
      .attr("text-anchor", "middle").attr("font-size", "11px").attr("font-weight", "500")
      .attr("fill", "var(--color-text-primary)")
      .text(d => `$${Math.round(d.rev)}M`);

    const line = d3.line().x(d => x(d.q) + x.bandwidth() / 2).y(d => y2(d.gm)).curve(d3.curveMonotoneX);
    g.append("path").datum(revenueData).attr("d", line)
      .attr("fill", "none").attr("stroke", CORAL).attr("stroke-width", 2.5).attr("stroke-dasharray", function () { return this.getTotalLength(); }).attr("stroke-dashoffset", function () { return this.getTotalLength(); })
      .transition().duration(1500).attr("stroke-dashoffset", 0);

    g.selectAll(".dot").data(revenueData).join("circle").attr("class", "dot")
      .attr("cx", d => x(d.q) + x.bandwidth() / 2).attr("cy", d => y2(d.gm))
      .attr("r", 4).attr("fill", CORAL).attr("stroke", "var(--color-background-primary)").attr("stroke-width", 2);

    g.append("g").attr("transform", `translate(0,${ih})`).call(d3.axisBottom(x).tickSize(0)).select(".domain").remove();
    g.selectAll(".tick text").attr("font-size", "10px").attr("fill", "var(--color-text-secondary)");

    g.append("g").call(d3.axisLeft(y).ticks(5).tickFormat(d => `$${d}M`).tickSize(0)).select(".domain").remove();
    g.selectAll(".tick text").attr("font-size", "10px").attr("fill", "var(--color-text-secondary)");

    const ay2 = g.append("g").attr("transform", `translate(${iw},0)`).call(d3.axisRight(y2).ticks(4).tickFormat(d => `${d}%`).tickSize(0));
    ay2.select(".domain").remove();
    ay2.selectAll(".tick text").attr("font-size", "10px").attr("fill", CORAL);

    g.append("text").attr("x", iw / 2).attr("y", ih + 40) // Position below the chart
      .attr("text-anchor", "middle").attr("font-size", "13px").attr("font-weight", "500")
      .attr("fill", "var(--color-text-primary)").text("Revenue & gross margin by quarter");

    // Add legend below the chart
    const lg = g.append("g").attr("transform", `translate(${iw / 2 - 100},${ih + 60})`);

    // Revenue label
    lg.append("rect")
      .attr("width", 10)
      .attr("height", 10)
      .attr("rx", 2)
      .attr("fill", TEAL);

    lg.append("text")
      .attr("x", 14)
      .attr("y", -3) 
      .attr("font-size", "11px")
      .attr("fill", TEAL) 
      .text("Revenue");

    // Gross margin % label
    lg.append("circle")
      .attr("cx", 90)
      .attr("cy", 5)
      .attr("r", 4)
      .attr("fill", CORAL);

    lg.append("text")
      .attr("x", 98)
      .attr("y", -3) 
      .attr("font-size", "11px")
      .attr("fill", CORAL)
      .text("Gross margin %");
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
    <div style={{ padding: "20px", background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-lg)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 500 }}>Scenario analysis</span>
        <span style={{ fontSize: 12, color: GRAY }}>Drag to explore</span>
      </div>
      <input type="range" min="0" max="100" value={scenario} onChange={e => setScenario(+e.target.value)}
        style={{ width: "100%", accentColor: color }} />
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: GRAY, marginTop: 4 }}>
        <span>Bear ($125)</span><span>Base ($175)</span><span>Bull ($250)</span>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginTop: 16 }}>
        <span style={{ fontSize: 36, fontWeight: 500, color }}>${price}</span>
        <span style={{ fontSize: 16, fontWeight: 500, color }}>{label} case</span>
      </div>
      <div style={{ fontSize: 14, color: GRAY, marginTop: 4 }}>
        {upside > 0 ? `+${upside}% upside` : `${upside}% downside`} from current ~$88
      </div>
      <div style={{ marginTop: 12, fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
        {scenario < 33 && "Growth decelerates to 30% YoY. Margins stay at 64%. Competitive threats materialize from co-packaged optics. Multiple compresses to 15x forward earnings."}
        {scenario >= 33 && scenario < 66 && "Revenue grows 50%+ in FY27 as guided. Margins recover to 67%+ by H2. New products contribute meaningfully. Multiple re-rates to 25x forward earnings."}
        {scenario >= 66 && "New products exceed expectations. 5th hyperscaler becomes top-3 customer. TAM expands to $10B+. Cardinal 1.6T wins design slots at all major hyperscalers. Multiple expands to 35x."}
      </div>
    </div>
  );
}

function Section({ icon, title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
      <button onClick={() => setOpen(!open)} style={{
        width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 0", background: "none", border: "none", cursor: "pointer", color: "var(--color-text-primary)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {icon}
          <span style={{ fontSize: 16, fontWeight: 500 }}>{title}</span>
        </div>
        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      {open && <div style={{ paddingBottom: 20 }}>{children}</div>}
    </div>
  );
}

function TAMChart() {
  const svgRef = useRef();

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const w = 400, // Reduced width
      h = 200, // Reduced height
      radius = Math.min(w, h) / 2;

    svg.attr("viewBox", `0 0 ${w} ${h}`);
    const g = svg.append("g").attr("transform", `translate(${w / 2}, ${h / 2})`);

    const data = [
      { label: "Networking TAM: $65B", value: 65, color: TEAL },
      { label: "Other AI Capex: $585B", value: 585, color: GRAY },
    ];

    const pie = d3.pie().value((d) => d.value)(data);
    const arc = d3.arc().innerRadius(0).outerRadius(radius * 0.7); // Reduced radius for smaller chart
    const outerArc = d3.arc().innerRadius(radius * 0.8).outerRadius(radius * 0.8);

    const arcs = g
      .selectAll(".arc")
      .data(pie)
      .join("g")
      .attr("class", "arc");

    // Draw pie slices
    arcs
      .append("path")
      .attr("d", arc)
      .attr("fill", (d) => d.data.color);

    // Add labels outside the pie chart with arrows
    arcs
      .append("polyline")
      .attr("points", (d) => {
        const posA = arc.centroid(d); // Center of the slice
        const posB = outerArc.centroid(d); // Just outside the slice
        const posC = [posB[0] + (posB[0] > 0 ? 15 : -15), posB[1]]; // Position for the label
        return [posA, posB, posC];
      })
      .attr("fill", "none")
      .style("stroke", "var(--color-text-secondary)")
      .attr("stroke-width", 1);

    arcs
      .append("text")
      .attr("transform", (d) => {
        const pos = outerArc.centroid(d);
        pos[0] += pos[0] > 0 ? 25 : -25; // Offset the text to the left or right
        return `translate(${pos})`;
      })
      .attr("text-anchor", (d) => (d.endAngle + d.startAngle) / 2 > Math.PI ? "end" : "start")
      .attr("font-size", "12px")
      .style("fill", "var(--color-text-primary)")
      .text((d) => d.data.label);
  }, []);

  return <svg ref={svgRef} style={{ width: "100%", height: "auto" }} />;
}

function ProductPositioning() {
  const data = [
    { customer: "Microsoft", product: "Cardinal 1.6T DSP", importance: "High" },
    { customer: "Google", product: "ZeroFlap Optics", importance: "Medium" },
    { customer: "Amazon", product: "Robin 800G DSP", importance: "High" },
    { customer: "Meta", product: "AECs (Copper)", importance: "Medium" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {data.map((d, i) => (
        <div key={i} style={{ padding: 14, background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)" }}>
          <div style={{ fontSize: 14, fontWeight: 500 }}>{d.customer}</div>
          <div style={{ fontSize: 12, color: GRAY }}>Product: {d.product}</div>
          <div style={{ fontSize: 12, color: TEAL }}>Strategic Importance: {d.importance}</div>
        </div>
      ))}
    </div>
  );
}

function DarkModeToggle({ isDark, onToggle }) {
  return (
    <button
      onClick={onToggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      style={{
        position: "fixed",
        top: 16,
        right: 16,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "5px 10px 5px 5px",
        background: "var(--color-background-secondary)",
        border: "1px solid var(--color-border-secondary)",
        borderRadius: 24,
        cursor: "pointer",
        boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
      }}
    >
      {/* Pill track */}
      <div style={{
        position: "relative",
        width: 42,
        height: 22,
        background: isDark ? TEAL : "#94a3b8",
        borderRadius: 11,
        flexShrink: 0,
        transition: "background 0.3s",
      }}>
        {/* Knob */}
        <div style={{
          position: "absolute",
          top: 3,
          left: isDark ? 21 : 3,
          width: 16,
          height: 16,
          background: "#ffffff",
          borderRadius: "50%",
          boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
          transition: "left 0.25s ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          {isDark
            ? <Moon size={9} color={TEAL} strokeWidth={2.5} />
            : <Sun size={9} color="#64748b" strokeWidth={2.5} />}
        </div>
      </div>
      <span style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-secondary)", userSelect: "none" }}>
        {isDark ? "Dark" : "Light"}
      </span>
    </button>
  );
}

export default function App() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") return false;
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", maxWidth: 720, margin: "0 auto", padding: "0 16px 60px" }}>
      <DarkModeToggle isDark={isDark} onToggle={() => setIsDark(d => !d)} />
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
      
       <div style={{ textAlign: "center", marginBottom: 20 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>
          Perplexity Stock Pitch Competition Dashboard
        </h1>
        <p style={{ fontSize: 16, color: "#64748b", margin: "8px 0" }}>
          by Bala Kausik Vazrala
        </p>
        <hr style={{ border: "0.5px solid var(--color-border-tertiary)", marginTop: 16 }} />
      </div>

      <div style={{ padding: "40px 0 24px", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <span style={{ background: TEAL, color: "white", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 500 }}>LONG</span>
          <span style={{ fontSize: 13, color: GRAY }}>NASDAQ: CRDO</span>
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 700, margin: "0 0 6px", lineHeight: 1.2 }}>Credo Technology</h1>
        <p style={{ fontSize: 15, color: "var(--color-text-secondary)", margin: 0, lineHeight: 1.6 }}>
          The AI data center's most critical and most overlooked supplier.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 10, marginTop: 20 }}>
          {[
            { label: "Price", value: "~$88", sub: "-59% from ATH" },
            { label: "Target", value: "$175", sub: "Base case" },
            { label: "Mkt cap", value: "$16.2B", sub: "NASDAQ" },
            { label: "Net cash", value: "$1.3B", sub: "Zero debt" },
          ].map((m, i) => (
            <div key={i} style={{ background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", padding: "12px 10px" }}>
              <div style={{ fontSize: 11, color: GRAY }}>{m.label}</div>
              <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>{m.value}</div>
              <div style={{ fontSize: 10, color: GRAY }}>{m.sub}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "24px 0", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: PURPLE, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Investment thesis</div>
        <p style={{ fontSize: 17, fontWeight: 500, lineHeight: 1.7, margin: 0 }}>
          The market panicked over a temporary gross margin dip, sending CRDO down 59% while missing that this is the only company making both the copper cables AND optical chips that connect every GPU in every AI data center. With 200%+ revenue growth, new products expanding TAM by 3x, and 15 of 16 analysts rating it Strong Buy at $200, this is the most asymmetric risk/reward in AI infrastructure.
        </p>
      </div>

      <Section icon={<BarChart3 size={18} color={TEAL} />} title="Revenue & margins" defaultOpen={true}>
        <RevenueChart />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 16 }}>
          <div style={{ padding: 12, background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)" }}>
            <div style={{ fontSize: 11, color: GRAY }}>FY26 revenue (est.)</div>
            <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "'DM Mono'" }}>$1.33B</div>
            <div style={{ fontSize: 11, color: TEAL }}>+200% YoY</div>
          </div>
          <div style={{ padding: 12, background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)" }}>
            <div style={{ fontSize: 11, color: GRAY }}>Net income (Q3)</div>
            <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "'DM Mono'" }}>$157M</div>
            <div style={{ fontSize: 11, color: TEAL }}>31.8% margin</div>
          </div>
          <div style={{ padding: 12, background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)" }}>
            <div style={{ fontSize: 11, color: GRAY }}>Q3 EPS beat</div>
            <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "'DM Mono'" }}>$1.07</div>
            <div style={{ fontSize: 11, color: TEAL }}>vs $0.78 expected</div>
          </div>
        </div>
      </Section>

      <Section icon={<Zap size={18} color={PURPLE} />} title="Why the market is wrong: 3 pillars">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            { n: 1, color: PURPLE, title: "The bottleneck has shifted from compute to connectivity", body: "AI clusters now use 100,000+ GPUs. The limiting factor isn't raw compute, it's moving data BETWEEN those GPUs fast enough. Credo invented the Active Electrical Cable (AEC): cheaper than fiber optics, uses less power, and works perfectly for the critical 3-7 meter distances inside server racks. They're the only company with both copper AND optical solutions." },
            { n: 2, color: TEAL, title: "The sell-off was an overreaction to a temporary margin dip", body: "On March 2, CRDO beat revenue estimates by 5.5% ($407M vs $386M) and beat EPS by 37% ($1.07 vs $0.78). The stock still dropped 18.5% in ONE DAY. Why? Q4 margin guidance was 64-66% vs Q3's 68.5%. But this is because new products (optics, gearboxes) have lower initial margins as they scale up. This is a GROWTH signal, not a warning sign. Every great semiconductor company experiences this during product transitions." },
            { n: 3, color: CORAL, title: "New products expand the addressable market by 3x", body: "At OFC 2026 (March), Credo launched: Cardinal 1.6T DSP (next-gen speed for AI fabrics), Robin 800G DSP family, and ZeroFlap Optics (eliminates micro-disruptions that can crash multi-week AI training runs). These expand Credo's TAM from ~$3B (copper AECs only) to $10B+ (copper + optical + IP licensing). A 5th hyperscaler customer is now ramping revenue." },
          ].map(p => (
            <div key={p.n} style={{ padding: 16, borderLeft: `3px solid ${p.color}`, background: "var(--color-background-secondary)", borderRadius: "0 var(--border-radius-md) var(--border-radius-md) 0" }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: p.color, marginBottom: 6 }}>Pillar {p.n}: {p.title}</div>
              <div style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.7 }}>{p.body}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section icon={<Target size={18} color={BLUE} />} title="Valuation: interactive scenario analysis">
        <ValuationSlider />
        <div style={{ marginTop: 16, fontSize: 13, color: GRAY, lineHeight: 1.6 }}>
          <strong>How I got these numbers:</strong> Bear case uses lowest analyst target ($125, Rosenblatt). Base case uses Vestra fair value model ($175). Bull case uses top analyst targets ($250-260, New Street Research / JP Morgan). Current median analyst consensus is $200, representing +127% upside from ~$88.
        </div>
      </Section>

      <Section icon={<Clock size={18} color={TEAL} />} title="Catalyst timeline">
        <div style={{ position: "relative", paddingLeft: 24 }}>
          <div style={{ position: "absolute", left: 7, top: 8, bottom: 8, width: 2, background: "var(--color-border-tertiary)" }} />
          {catalysts.map((c, i) => (
            <div key={i} style={{ position: "relative", paddingBottom: 18, paddingLeft: 20 }}>
              <div style={{
                position: "absolute", left: -1, top: 5, width: 16, height: 16, borderRadius: "50%",
                background: c.done ? TEAL : "var(--color-background-primary)",
                border: c.done ? "none" : `2px solid var(--color-border-secondary)`,
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                {c.done && <span style={{ color: "white", fontSize: 10 }}>✓</span>}
              </div>
              <div style={{ fontSize: 11, fontWeight: 500, color: c.done ? TEAL : GRAY }}>{c.date}</div>
              <div style={{ fontSize: 13, color: "var(--color-text-primary)", marginTop: 2 }}>{c.event}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section icon={<Shield size={18} color={RED} />} title="Risks & mitigants">
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {risks.map((r, i) => (
            <div key={i} style={{ padding: 14, background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 500 }}>{r.risk}</span>
                <div style={{ display: "flex", gap: 3 }}>
                  {[1,2,3].map(s => (
                    <div key={s} style={{ width: 8, height: 8, borderRadius: 2, background: s <= r.severity ? RED : "var(--color-border-tertiary)" }} />
                  ))}
                </div>
              </div>
              <div style={{ fontSize: 12, color: GRAY, marginBottom: 4 }}>{r.detail}</div>
              <div style={{ fontSize: 12, color: TEAL }}>↳ Mitigant: {r.mitigant}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section icon={<Cpu size={18} color={CORAL} />} title="Perplexity Computer research log">
        <div style={{ fontSize: 13, color: GRAY, marginBottom: 14, lineHeight: 1.6 }}>
          Every insight below was discovered using Perplexity Computer's agentic research. Here are the exact prompts I used and what they revealed:
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {perplexityPrompts.slice(0, 2).map((p, i) => (
            <div key={i} style={{ padding: 14, background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)" }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: CORAL, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Prompt {i + 1}</div>
              <div style={{ fontSize: 13, fontFamily: "'DM Mono', monospace", color: "var(--color-text-primary)", marginBottom: 8, lineHeight: 1.5 }}>"{p.prompt}"</div>
              <div style={{ fontSize: 12, color: TEAL, lineHeight: 1.5 }}>
                <strong>Key finding:</strong> {p.insight}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section icon={<BarChart3 size={18} color={TEAL} />} title="TAM Analysis">
        <TAMChart />
        <div style={{ fontSize: 13, color: GRAY, marginTop: 16 }}>
            The total AI capex for hyperscalers in 2026 is $650B. Networking accounts for $65B, and Credo is positioned to capture a significant share with its unique product portfolio.
        </div>
      </Section>

      <Section icon={<Cpu size={18} color={CORAL} />} title="Product Positioning by Customer">
        <ProductPositioning />
      </Section>

      <div style={{ marginTop: 32, padding: 20, background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-lg)", textAlign: "center" }}>
        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 6 }}>Bottom line</div>
        <div style={{ fontSize: 15, lineHeight: 1.7, color: "var(--color-text-secondary)" }}>
          CRDO is the best risk/reward in AI infrastructure. You're buying 200%+ revenue growth, 68% gross margins, $1.3B net cash, and a 3x TAM expansion at a 59% discount to its 52-week high. The margin dip that spooked the market is temporary. The growth is structural.
        </div>
        <div style={{ marginTop: 12, fontSize: 20, fontWeight: 700, color: TEAL }}>
          BUY CRDO · Target: $175 · Upside: +99%
        </div>
      </div>
    </div>
  );
}

