Steps :
1. cd workspace
2. cd shadcn-ui
3. npm i
4. npm install gsap chart.js react-chartjs-2 ngeohash firebase
5.npm install @radix-ui/react-dialog lucide-react
6. npm run dev
Steps to run py scripts file:
cd workspace
cd shadcn-ui
 cd src
cd data
 python process_with_factors.py



 # 🌱 Carbon FootPrint Project

This project tracks and visualizes carbon emissions for users, areas, and peer groups.  
It includes a **FastAPI backend** (prediction, retraining, history, recommendations) and a **React frontend** (interactive dashboard with charts).  

---

## ✅ Things We’ve Accomplished So Far

### **Backend (FastAPI)**
- **Model & Retraining**
  - Loads `RandomForest` model (`carbon_rf.pkl`) at startup.  
  - Auto-retrain after 50 submissions (`retrain_counter.txt`).  
  - Baseline dataset bootstrapping (`Carbon_Emission_Cleaned.csv`).  
  - Added **area type flags**: Residential, Corporate, Industrial, Vehicular, Construction, Airport.  

- **Prediction API (`/predict`)**
  - Accepts numeric + categorical + city + area features.  
  - Expands area → one-hot flags via `AREA_MAPPING`.  
  - Returns:
    - `current_total_co2`  
    - `predicted_total_co2`  
    - `peer_comparison` (area/city/India averages)  
    - `area_context` (name, highest emission type, tags, breakdown, breakdown_pct)  
    - `retrain_status`  

- **History API (`/history`)** → last 5 submissions + peer summary.  
- **Recommendations API (`/recommend`)** → top 3 categories with tips + sliders.  
- **Baseline Scaling** → ~600–900 kg/person/month baseline for realism.  
- **Breakdown Enhancements** → weighted distribution, dataset averages, breakdown_pct.  

---

### **Frontend (React)**
- **Survey Page (`Survey.tsx`)**
  - Sliders for numeric inputs, dropdowns for categorical features.  
  - Calls `/predict` → stores result in localStorage.  
- **Dashboard Page (`Dashboard.tsx`)**
  - KPI Cards (Current, Predicted, % Change, Lifetime CO₂).  
  - Pie Chart (user breakdown, tooltips with kg + %).  
  - Area Context Card → shows area name, highest type, tags + mini bar chart.  
  - Peer Group Comparison (text vs Area/City/India).  
  - Community Comparison Bar Chart (You vs Averages).  
  - Top 3 Contributors card.  
  - Recommendations with sliders.  
  - Scenario Simulator → compare Current vs Adjusted.  
  - Trend Line of history.  
  - History Table → last 5 submissions.  
  - Actions → Map, Update survey, PowerBI, Export, Reset.  
- **UI Enhancements**
  - GSAP animations.  
  - Progress bar in survey.  
  - Tooltips improved.  
  - Error handling for missing data.  

---

## ⏳ Things We Parked for Later

### **Dashboard Polish**
- [ ] Show note for hidden (0%) categories.  
- [ ] Legends with percentages → *Residential (32%)*.  
- [ ] Skeleton loaders / shimmer while data loads.  
- [ ] Friendly eco-themed error states.  

### **Data & Insights**
- [ ] Bundle `/predict`, `/recommend`, `/history` into one response.  
- [ ] Peer comparison: add absolute kg difference (e.g., *12% less ≈ 80 kg*).  
- [ ] Trend line toggle → daily / monthly / yearly.  
- [ ] Export → PDF/Excel with charts embedded.  

### **Interactivity**
- [ ] Interactive map → emissions heatmap for Mumbai/Navi Mumbai, zoomable.  
- [ ] Scenario simulator+ → multi-adjustment side by side.  
- [ ] Gamification → badges (Eco Warrior, Green Saver).  
- [ ] Leaderboard / Community view → compare with friends/groups.  

### **Future Integrations**
- [ ] PowerBI / analytics integration.  
- [ ] Firebase + Auth → multiple users, persistent dashboards.  
- [ ] Notifications → monthly CO₂ report emails/reminders.  

---

## 📂 Project Paths & Files

### 🔹 Backend (FastAPI + ML)
- **ML service** → `workspace/shadcn-ui/api/ml_service.py`  
- **Retraining script** → `workspace/shadcn-ui/api/retrain.py`  
- **Saved model** → `workspace/shadcn-ui/api/models/carbon_rf.pkl`  
- **User submissions** → `workspace/shadcn-ui/api/data/user_submissions.csv`  
- **Base dataset** → `workspace/shadcn-ui/api/data/carbon_emission_augmented_extended.csv`  

**Run retrain manually:**
```bash
cd workspace/shadcn-ui/api
python retrain.py
Run backend server:

bash
Copy code
cd workspace/shadcn-ui/api
uvicorn ml_service:app --reload --port 8000


# 
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Dashboard.tsx (full)
 * - KPI Cards (Current, Predicted, % Change w/ arrows, Lifetime)
 * - Pie + Area Context (side panel)
 * - Peer Group Comparison (textual)
 * - Community Comparison (bar)
 * - Top 3 Categories
 * - AI Recommendations (sliders)
 * - Scenario Simulator
 * - History Trend (line)
 * - History Table (last 5)
 * - Actions (Map, Survey, PowerBI, Export, Reset)
 * - ChatBot footer
 */
// for react-chartjs-2 pie (you likely already have this)
import {
  
 
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
} from "chart.js";


// ✅ Recharts — alias everything so it doesn't clash with Chart.js
import {
  ResponsiveContainer,
  BarChart as RBarChart,
  Bar as RBar,
  XAxis as RXAxis,
  YAxis as RYAxis,
  CartesianGrid as RCartesianGrid,
  Tooltip as RTooltip,
  Legend as RLegend,
  BarChart,
  CartesianGrid,
  YAxis,
  XAxis,
} from "recharts";
ChartJS.register(ArcElement, ChartTooltip, ChartLegend);

import { Line } from "react-chartjs-2";
import { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CarbonCalculator } from "../services/carbonCalculator";
import { CATEGORY_NAMES } from "../config/constants";
import { AreaContext, CarbonCategories } from "../types";
import { Map } from "lucide-react";
import { ChatBot } from "../components/ChatBot";

/* --------------------------------------------------------------------------
 * ChartJS setup
 * -------------------------------------------------------------------------- */
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

/* --------------------------------------------------------------------------
 * Types
 * -------------------------------------------------------------------------- */
type Factors = Record<string, Record<string, number>>;

interface SurveyData {
  city: string;
  features: any;
  categories: CarbonCategories;
  categoricals?: Record<string, string>;
  flatFeatures: Record<string, any>;
  current_total_co2: number;
  predicted_total_co2?: number;
  timestamp: string;

  // From /predict (not used directly for charts)
  peer_comparison?: {
    area_avg?: number | string | null;
    city_avg?: number | string | null;
    india_avg?: number | string | null;
  };

  // From /history (used for peer bars + messages)
  peer_summary?: {
    area_avg?: number | null;
    city_avg?: number | null;
    india_avg?: number | null;
  };

  // From /predict
  area_context?: {
    // breakdown_pct: any;
    // breakdown(breakdown: any): unknown;
    area: string;
    highest_emission_type?: string;
    highest_value?: number;
    area_type?: string[];
     breakdown?: Record<string, number>;
      breakdown_pct?: Record<string, number>;
  };
}

interface BackendRecommendation {
  category: string;
  value: number;
  tip: string;
  reduction?: number;
}

/* --------------------------------------------------------------------------
 * Component
 * -------------------------------------------------------------------------- */
export default function Dashboard() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  // fake delay for skeleton demo
  setTimeout(() => setLoading(false), 1500);
}, []);

  /* ---------------------------------- State --------------------------------- */
  const [surveyData, setSurveyData] = useState<SurveyData | null>(null);
  const [recommendations, setRecommendations] = useState<BackendRecommendation[]>([]);
  const [factors, setFactors] = useState<Factors>({});
  const [history, setHistory] = useState<any[]>([]);
  const [reductions, setReductions] = useState<Record<string, number>>({});
 console.log("DEBUG frontend area_context:", surveyData?.area_context);
  console.log("DEBUG frontend breakdown:", surveyData?.area_context?.breakdown);

  /* --------------------- Load survey from localStorage ---------------------- */
  useEffect(() => {
    const raw = localStorage.getItem("carbonSurvey");
    if (!raw) {
      navigate("/survey");
      return;
    }
    const parsed = JSON.parse(raw) as SurveyData;
    setSurveyData(parsed);

    // Call /recommend with category breakdown
    (async () => {
      try {
        const categoryMap = Object.fromEntries(
          (CarbonCalculator.getCategoryBreakdown(parsed.categories) || []).map((item) => [
            CATEGORY_NAMES[item.category] ?? String(item.category),
            Number(item.co2 || 0),
          ])
        );
        const response = await fetch("http://localhost:8000/recommend", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ categories: categoryMap }),
        });
        const data = await response.json();
        setRecommendations(data.top3 || []);
      } catch (err) {
        console.error("Error fetching /recommend:", err);
      }
    })();
  }, [navigate]);

  /* --------------------------- Load static factors -------------------------- */
  useEffect(() => {
    (async () => {
      try {
        const f = await fetch("/data/emission_factors.json").then((r) => r.json());
        setFactors(f);
      } catch (e) {
        console.error("data load error", e);
      }
    })();
  }, []);

  /* ------------------------------- Animations ------------------------------- */
  useEffect(() => {
      gsap.from(".dashboard-card", {
    opacity: 0,
    y: 40,
    duration: 0.8,
    stagger: 0.2,
    ease: "power3.out",
  });
gsap.to(".eco-blob", {
    y: 30,
    duration: 6,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
  });
    if (!surveyData) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".dashboard-header",
        { opacity: 0, y: -30 },
        { opacity: 1, y: 0, duration: 0.8 }
      );
      gsap.fromTo(
        ".dashboard-card",
        { opacity: 0, y: 50, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.2, delay: 0.3 }
      );
      gsap.fromTo(
        ".recommendation-item",
        { opacity: 0, x: -30 },
        { opacity: 1, x: 0, duration: 0.5, stagger: 0.1, delay: 1 }
      );
    }, containerRef);
    return () => ctx.revert();
  }, [surveyData]);

  /* ---------------------------- Derived breakdown --------------------------- */
  const numericBreakdown = useMemo(() => {
    if (!surveyData?.categories) return [];
    return CarbonCalculator.getCategoryBreakdown(surveyData.categories);
  }, [surveyData]);

  const categoricalParts = useMemo(() => {
    if (!surveyData) return [];
    const cats = surveyData.categoricals || {};
    const valueFor = (key: keyof NonNullable<SurveyData["categoricals"]>) => {
      const v = cats[key];
      const map = (factors as any)?.[key];
      if (v && map && typeof map[v] === "number") return map[v] as number;
      return 0;
    };
    return [
      { label: "Diet", value: valueFor("Diet") },
      { label: "Heating", value: valueFor("Heating Energy Source") },
      { label: "Recycling", value: valueFor("Recycling") },
      { label: "Cooking", value: valueFor("Cooking_With") },
      { label: "Social", value: valueFor("Social Activity") },
    ].filter((p) => p.value > 0);
  }, [surveyData, factors]);

  const combinedForPie = useMemo(() => {
    const nb = numericBreakdown.map((item) => ({
      label: CATEGORY_NAMES[item.category] ?? String(item.category),
      value: Number(item.co2 || 0),
    }));
    return [...nb, ...categoricalParts];
  }, [numericBreakdown, categoricalParts]);

  const youCurrent = surveyData?.current_total_co2 ?? 0;
  const youPredicted = surveyData?.predicted_total_co2 ?? 0;

  /* ---------------------------- Chart data (Pie) ---------------------------- */
  const pieData = useMemo(
    () => ({
      labels: combinedForPie.map((p) => p.label),
      datasets: [
        {
          data: combinedForPie.map((p) => p.value),
          backgroundColor: [
            "#10B981",
            "#3B82F6",
            "#8B5CF6",
            "#F59E0B",
            "#EF4444",
            "#06B6D4",
            "#84CC16",
            "#F97316",
            "#22C55E",
            "#6366F1",
          ],
          borderWidth: 2,
          borderColor: "#fff",
        },
      ],
    }),
    [combinedForPie]
  );

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: { position: "right" as const },
      tooltip: { enabled: true },
    },
  };

  /* ------------------------------ History load ------------------------------ */
  useEffect(() => {
    fetch("http://localhost:8000/history")
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.records)) {
          setHistory(data.records.slice(-5));
          setSurveyData((prev) =>
            prev ? { ...prev, peer_summary: data.peer_summary } : prev
          );
        } else {
          setHistory([]);
        }
      })
      .catch((err) => {
        console.error("History fetch failed:", err);
        setHistory([]);
      });
  }, []);

  /* ----------------------------- Line (trend) ------------------------------- */
  const lineData = {
    labels: history.map((h) =>
      h.timestamp ? new Date(h.timestamp).toLocaleDateString() : ""
    ),
    datasets: [
      {
        label: "Current Total CO₂",
        data: history.map((h) => h.current_total_co2 ?? 0),
        borderColor: "#3B82F6",
        backgroundColor: "rgba(59,130,246,0.2)",
        fill: true,
        tension: 0.3,
      },
      {
        label: "Predicted CO₂ (Next Month)",
        data: history.map((h) => h.predicted_total_co2 ?? 0),
        borderColor: "#EF4444",
        backgroundColor: "rgba(239,68,68,0.2)",
        fill: true,
        tension: 0.3,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: { display: true, text: "Your CO₂ Emissions Over Time" },
    },
  };

  /* --------------------------- KPI derived values --------------------------- */
  const lastEntry = history.length > 1 ? history[history.length - 2] : null;
  const latestEntry = history.length > 0 ? history[history.length - 1] : null;

  const pctChange =
    lastEntry && latestEntry
      ? ((latestEntry.current_total_co2 - lastEntry.current_total_co2) /
          (lastEntry.current_total_co2 || 1)) *
        100
      : 0;

  const lifetimeTotal = history.reduce(
    (sum, h) => sum + (h.current_total_co2 || 0),
    0
  );

  /* --------------------------- Peer bar chart data -------------------------- */
  const peerBarData = useMemo(
    () => ({
      labels: ["You", "Area Avg", "City Avg", "India Avg"],
      datasets: [
        {
          label: "CO₂ Emissions (kg/month)",
          data: [
            youCurrent,
            surveyData?.peer_summary?.area_avg ?? 0,
            surveyData?.peer_summary?.city_avg ?? 0,
            surveyData?.peer_summary?.india_avg ?? 0,
          ],
          backgroundColor: ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6"],
          borderRadius: 8,
        },
      ],
    }),
    [youCurrent, surveyData?.peer_summary]
  );

  /* ------------------------ Top 3 categories by share ----------------------- */
  const top3 = useMemo(() => {
    const total = combinedForPie.reduce((a, b) => a + b.value, 0) || 1;
    return [...combinedForPie]
      .sort((a, b) => b.value - a.value)
      .slice(0, 3)
      .map((p) => ({
        label: p.label,
        value: p.value,
        pct: (p.value / total) * 100,
      }));
  }, [combinedForPie]);

  /* ----------------------------- Scenario calc ------------------------------ */
  const projectedTotal = useMemo(() => {
    let total = youCurrent;
    for (const rec of recommendations) {
      const pct = reductions[rec.category] || 0;
      total -= rec.value * (pct / 100);
    }
    return Math.max(total, 0);
  }, [youCurrent, recommendations, reductions]);

  const scenarioBarData = {
    labels: ["Current", "Your Scenario"],
    datasets: [
      {
        label: "CO₂ Emissions (kg/month)",
        data: [youCurrent, projectedTotal],
        backgroundColor: ["#EF4444", "#10B981"],
        borderRadius: 8,
      },
    ],
  };
const areaBreakdownData = useMemo(() => {
  const breakdown = surveyData?.area_context?.breakdown;
  const breakdown_pct = surveyData?.area_context?.breakdown_pct;
  if (!breakdown || Object.keys(breakdown).length === 0) return [];

  return Object.entries(breakdown)
    .map(([k, v]) => ({
      name: k,
      value: Number(v) || 0,
      pct: breakdown_pct?.[k] ? Number(breakdown_pct[k]) : 0,
    }))
    .sort((a, b) => b.value - a.value);
}, [surveyData]);







  {console.log("DEBUG breakdown:", surveyData?.area_context?.breakdown)}
  console.log("DEBUG frontend area_context:", surveyData?.area_context);
console.log("DEBUG frontend breakdown_pct:", surveyData?.area_context?.breakdown_pct);


  /* --------------------------------------------------------------------------
   * Render
   * -------------------------------------------------------------------------- */
  return (
    <div ref={containerRef} className="min-h-screen py-8 relative overflow-hidden bg-gradient-to-br from-green-50 via-green-100 to-emerald-200">
      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        {!surveyData ? (
          <p className="text-center text-gray-500">Loading dashboard...</p>
        ) : (
          <>
            {/* -------------------------------- Header ------------------------------- */}
            <div className="dashboard-header text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Your Carbon Dashboard
              </h1>
              <p className="text-gray-600">
                {surveyData.categoricals?.subdomain} ·{" "}
                {surveyData.categoricals?.city}, {surveyData.categoricals?.country}
              </p>
            </div>

            {/* ------------------------------- KPI Cards ------------------------------ */}
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              {/* Current */}
              <Card className="dashboard-card bg-white/90 shadow-xl border-0">
                <CardHeader>
                  <CardTitle>Current CO₂</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{youCurrent.toFixed(1)} kg</p>
                </CardContent>
              </Card>

              {/* Predicted */}
              <Card className="dashboard-card bg-white/90 shadow-xl border-0">
                <CardHeader>
                  <CardTitle>Predicted Next</CardTitle>
                </CardHeader>
                <CardContent>
                  <p
                    className={`text-2xl font-bold ${
                      youPredicted < youCurrent ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {youPredicted.toFixed(1)} kg
                  </p>
                </CardContent>
              </Card>

              {/* % Change */}
              <Card className="dashboard-card bg-white/90 shadow-xl border-0">
                <CardHeader>
                  <CardTitle>% Change</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-2xl font-bold ${
                        pctChange > 0 ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {pctChange.toFixed(1)}%
                    </span>
                    {pctChange > 0 ? (
                      <span className="text-red-600">▲</span>
                    ) : (
                      <span className="text-green-600">▼</span>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Lifetime */}
              <Card className="dashboard-card bg-white/90 shadow-xl border-0">
                <CardHeader>
                  <CardTitle>Lifetime CO₂</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {lifetimeTotal.toFixed(1)} kg
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* ---------------------- Pie + Area Context block ---------------------- */}
            <Card className="dashboard-card bg-white/90 shadow-xl border-0 mb-8">
              <CardHeader>
                <CardTitle>Your Emissions Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row mt-6">
                  {/* Pie Chart */}
                  <div className="w-full md:w-2/3" style={{ height: "400px" }}>
  <Pie
    data={pieData}
    options={{
      ...pieOptions,
      maintainAspectRatio: false,
      responsive: true,
    }}
  />
</div>


                  {/* Area Context */}
                  <div className="w-full md:w-1/3 ml-0 md:ml-4 mt-4 md:mt-0 p-4 bg-gray-50 rounded-2xl shadow">
                    <h3 className="text-lg font-semibold mb-2">Area Context</h3>
                    <p>
  <strong>Area:</strong>{" "}
  {surveyData?.categoricals?.area ||
   surveyData?.area_context?.area ||
   "N/A"}
</p>


{/* Mini chart for area breakdown */}
{areaBreakdownData.length > 0 ? (
  <div className="h-64 mt-3">
   <ResponsiveContainer width="100%" height="100%">
  <RBarChart data={areaBreakdownData}>
    <RCartesianGrid strokeDasharray="3 3" />
    <RXAxis 
      dataKey="name" 
      tick={{ fontSize: 12 }} 
      angle={-30} 
      textAnchor="end" 
      interval={0} 
    />
    <RYAxis tick={{ fontSize: 12 }} />
    <RTooltip
  formatter={(value: number, name: string, props: any) => {
    const pct = props.payload?.pct ? props.payload.pct.toFixed(1) : "0";
    return [`${value.toFixed(1)} kg (${pct}%)`, "CO₂"];
  }}
/>
    <RLegend />
    <RBar dataKey="value" fill="#4CAF50" />
  </RBarChart>
</ResponsiveContainer>

  </div>
) : (
  <p className="text-sm text-gray-500 mt-3">No breakdown data available</p>
)}





                    <p>
                      <strong>Highest Emission Source:</strong>{" "}
                      {surveyData?.area_context?.highest_emission_type || "N/A"}
                    </p>
                    <p>
                      <strong>Types:</strong>{" "}
                      {(surveyData?.area_context?.area_type || []).join(", ") ||
                        "N/A"}
                    </p>
                    {typeof surveyData?.area_context?.highest_value ===
                      "number" && (
                      <p>
                        <strong>Value:</strong>{" "}
                        {surveyData.area_context!.highest_value!.toFixed(1)} kg
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ------------------------ Peer Group Comparison ----------------------- */}
            {surveyData && surveyData.peer_summary && (
              <Card className="dashboard-card mb-8 bg-white/90 shadow-xl border-0">
                <CardHeader>
                  <CardTitle>Peer Group Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const current = youCurrent;
                    const { area_avg, city_avg, india_avg } =
                      surveyData.peer_summary || {};
                    const comparisons: string[] = [];
                  const cityName =
  surveyData?.city ||
  surveyData?.categoricals?.city ||
  surveyData?.features?.city ||
  surveyData?.flatFeatures?.city ||
  "your city"; // last-resort placeholder

 

                      if (area_avg && area_avg > 0) {
          const diffPct = ((current - area_avg) / area_avg) * 100;
          comparisons.push(
            diffPct < 0
              ? `🚀 You emit ${Math.abs(diffPct).toFixed(1)}% less than the average resident in ${surveyData?.area_context?.area}`
              : `⚠️ You emit ${diffPct.toFixed(1)}% more than the average resident in ${surveyData?.area_context?.area}`
          );
        }

          if (city_avg && city_avg > 0) {
  const diffPct = ((current - city_avg) / city_avg) * 100;
  comparisons.push(
    diffPct < 0
      ? `🌍 You emit ${Math.abs(diffPct).toFixed(1)}% less than the average resident in ${cityName}`
      : `⚠️ You emit ${diffPct.toFixed(1)}% more than the average resident in ${cityName}`
  );
}



                    if (india_avg && india_avg > 0) {
                      const diffPct = ((current - india_avg) / india_avg) * 100;
                      comparisons.push(
                        diffPct < 0
                          ? `🇮🇳 You emit ${Math.abs(diffPct).toFixed(
                              1
                            )}% less than the India average`
                          : `⚠️ You emit ${diffPct.toFixed(
                              1
                            )}% more than the India average`
                      );
                    }

                    return comparisons.length ? (
                      <ul className="list-disc list-inside space-y-2 text-gray-700">
                        {comparisons.map((msg, i) => (
                          <li key={i}>{msg}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500">
                        Not enough peer data to compare yet.
                      </p>
                    );
                  })()}
                </CardContent>
              </Card>
            )}

            {/* ------------------------- Community Comparison ---------------------- */}
            <Card className="dashboard-card bg-white/90 shadow-xl border-0 mb-8">
              <CardHeader>
                <CardTitle>Community Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <Bar data={peerBarData} />
                </div>
              </CardContent>
            </Card>

            {/* -------------------------- Top 3 Categories ------------------------- */}
            <Card className="dashboard-card mb-8 bg-white/90 shadow-xl border-0">
              <CardHeader>
                <CardTitle>Your Top 3 Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {top3.map((item) => (
                    <div
                      key={item.label}
                      className="p-4 rounded-lg border bg-white/70 hover:shadow-md"
                    >
                      <div className="flex justify-between">
                        <span className="font-semibold">{item.label}</span>
                        <span className="text-sm text-gray-600">
                          {item.pct.toFixed(1)}%
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {item.value.toFixed(1)} kg/month
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* ---------------------------- Recommendations ------------------------ */}
            <Card className="dashboard-card mb-8 bg-white/90 shadow-xl border-0">
              <CardHeader>
                <CardTitle>AI-Powered Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                {recommendations.length ? (
                  <div className="grid md:grid-cols-3 gap-4">
                    {recommendations.map((rec, i) => (
                      <div
                        key={i}
                        className="recommendation-item p-4 rounded-lg border bg-white/70 hover:shadow-md"
                      >
                        <div className="flex justify-between mb-2">
                          <span className="font-semibold">{rec.category}</span>
                          <span className="text-sm text-gray-600">
                            {rec.value?.toFixed?.(1)} kg
                          </span>
                        </div>
                        <p className="text-xs text-gray-700">
                          <b>Tip:</b> {rec.tip}
                        </p>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          step={5}
                          value={reductions[rec.category] || 0}
                          onChange={(e) =>
                            setReductions((prev) => ({
                              ...prev,
                              [rec.category]: Number(e.target.value),
                            }))
                          }
                          className="w-full mt-2"
                        />
                        <p className="text-xs text-gray-500">
                          Reduction: {reductions[rec.category] || 0}% → -
                          {(rec.value *
                            ((reductions[rec.category] || 0) / 100)
                          ).toFixed(1)}{" "}
                          kg
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No recommendations available</p>
                )}
              </CardContent>
            </Card>

            {/* --------------------------- Scenario Simulator ---------------------- */}
            <Card className="dashboard-card mb-8 bg-white/90 shadow-xl border-0">
              <CardHeader>
                <CardTitle>Scenario Simulator</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80 mb-4">
                  <Bar data={scenarioBarData} />
                </div>
                <div className="text-center text-gray-700">
                  <p>
                    <b>Current:</b> {youCurrent.toFixed(1)} kg / month
                  </p>
                  <p>
                    <b>Your Scenario:</b> {projectedTotal.toFixed(1)} kg / month
                  </p>
                  <p className="text-green-600">
                    <b>Saved:</b> {(youCurrent - projectedTotal).toFixed(1)} kg /
                    month
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* ------------------------------ CO₂ Trend ---------------------------- */}
            <Card className="dashboard-card mb-8 bg-white/90 shadow-xl border-0">
              <CardHeader>
                <CardTitle>CO₂ Trend</CardTitle>
              </CardHeader>
              <CardContent>
                {history.length > 0 ? (
                  <Line data={lineData} options={lineOptions} />
                ) : (
                  <p>No history data yet.</p>
                )}
              </CardContent>
            </Card>

            {/* ---------------------------- History Table ------------------------- */}
            <Card className="dashboard-card mb-8 bg-white/90 shadow-xl border-0">
              <CardHeader>
                <CardTitle>Submission History (last 5)</CardTitle>
              </CardHeader>
              <CardContent>
                {history.length > 0 ? (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="p-2 text-left">Date</th>
                        <th className="p-2 text-left">Current CO₂</th>
                        <th className="p-2 text-left">Predicted CO₂</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((h, i) => (
                        <tr key={i} className="border-b">
                          <td className="p-2">
                            {h.timestamp
                              ? new Date(h.timestamp).toLocaleString()
                              : "-"}
                          </td>
                          <td className="p-2">
                            {h.current_total_co2?.toFixed?.(1)}
                          </td>
                          <td className="p-2">
                            {h.predicted_total_co2?.toFixed?.(1)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No history available</p>
                )}
              </CardContent>
            </Card>

            {/* -------------------------------- Actions ---------------------------- */}
            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                onClick={() => navigate("/map")}
                className="bg-gradient-to-r from-green-600 to-blue-600 text-white"
              >
                <Map className="w-4 h-4" /> View Map
              </Button>

              <Button onClick={() => navigate("/survey")} variant="outline">
                Update Survey
              </Button>

              <Button onClick={() => navigate("/powerbi")} variant="outline">
                Advanced Analytics
              </Button>

              <Button
                onClick={() => window.print()}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
              >
                🖨️ Export Report
              </Button>

              <Button
                onClick={() => {
                  setHistory([]);
                  localStorage.removeItem("carbonSurvey");
                  alert("✅ Dashboard reset for this session!");
                }}
                variant="destructive"
              >
                Reset Dashboard
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Footer Assistant */}
      <ChatBot currentPage="dashboard" />
    </div>
  );
}
