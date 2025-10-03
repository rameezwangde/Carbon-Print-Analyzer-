import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Users,
  TrendingUp,
  ArrowLeft,
  Filter,
  Layers,
  Clock,
  Map as MapIcon,
  Compass,
  X,
  ListOrdered,
  Save,
  PlayCircle,
  Trash2,
  ChevronDown,
  ChevronUp,
  Target,
  Info,
  RefreshCcw,
  Eye,
  EyeOff,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ChatBot } from "../components/ChatBot";
import { Bar, Line } from "react-chartjs-2";

// Leaflet
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap, GeoJSON } from "react-leaflet";
import L, { LatLngExpression } from "leaflet";

// Custom Heatmap wrapper (manual wrapper using leaflet.heat)
import HeatmapLayer from "@/components/HeatmapLayer";

// Chart.js core
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title as ChartTitleJS,
  Tooltip as ChartTooltipJS,
  Legend as ChartLegendJS,
  PointElement,
} from "chart.js";

// Register chart parts (no plugins like zoom)
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, ChartTitleJS, ChartTooltipJS, ChartLegendJS, PointElement);

/* ──────────────────────────────────────────────────────────────────────────────
 * Types
 * ──────────────────────────────────────────────────────────────────────────── */
type AreaRow = {
  // From CSV
  city: string;
  area: string;
  total_co2?: number | string;             // base total, converted to kg/month
  Transport?: number | string;             // keep: CSV has "Transport" (may be freq/index)
  waste_kg?: number | string;
  lpg_kg?: number | string;
  shopping_spend?: number | string;
  area_type_raw?: string;                  // e.g. "Residential, Corporate, Construction"
  // spaced header access via bracket-syntax: ["Vehicle Monthly Distance Km"]
  [key: string]: any;
};

type SelectedArea = {
  city: string;
  area: string;
  median: number;
  count: number;
  transport: number;
  waste: number;
  cooking: number;
  consumption: number;
  lat: number;
  lng: number;
};

type CityFilter = "all" | "mumbai" | "navi mumbai";
type EmissionFilter = "all" | "low" | "medium" | "high";
type ViewMode = "circles" | "heatmap";
type SectorLayer = "overall" | "transport" | "waste" | "cooking" | "consumption";

type MarkerRow = {
  city: string;
  area: string;
  lat: number;
  lng: number;
  median: number;
  count: number;
  transport: number;
  waste: number;
  cooking: number;
  consumption: number;
  areaTypes: string[]; // parsed tags from area_type_raw
};

type SavedScenario = {
  id: string;
  name: string;
  payload: {
    publicTransport: boolean;
    zeroWaste: boolean;
    efficientCooking: boolean;
    minimalShopping: boolean;
  };
  impactPct: number;
};

/* ──────────────────────────────────────────────────────────────────────────────
 * Area coordinates (approximate)
 * ──────────────────────────────────────────────────────────────────────────── */
const AREA_COORDS: Record<string, { lat: number; lng: number; city: "mumbai" | "navi mumbai" | string }> = {
  Chembur: { lat: 19.062, lng: 72.901, city: "mumbai" },
  "Bandra Kurla Complex": { lat: 19.062, lng: 72.867, city: "mumbai" },
  Worli: { lat: 19.002, lng: 72.818, city: "mumbai" },
  Goregaon: { lat: 19.155, lng: 72.849, city: "mumbai" },
  Borivali: { lat: 19.232, lng: 72.859, city: "mumbai" },
  "Malad West": { lat: 19.186, lng: 72.842, city: "mumbai" },
  Sion: { lat: 19.047, lng: 72.864, city: "mumbai" },
  Mazgaon: { lat: 18.973, lng: 72.844, city: "mumbai" },
  "Andheri (Airport area)": { lat: 19.096, lng: 72.874, city: "mumbai" },

  Turbhe: { lat: 19.088, lng: 73.016, city: "navi mumbai" },
  Koparkhairane: { lat: 19.103, lng: 73.009, city: "navi mumbai" },
  Airoli: { lat: 19.159, lng: 72.999, city: "navi mumbai" },
  Nerul: { lat: 19.033, lng: 73.019, city: "navi mumbai" },
  Vashi: { lat: 19.077, lng: 72.998, city: "navi mumbai" },
  "CBD Belapur": { lat: 19.018, lng: 73.043, city: "navi mumbai" },
  Ghansoli: { lat: 19.125, lng: 72.994, city: "navi mumbai" },
  Kharghar: { lat: 19.046, lng: 73.07, city: "navi mumbai" },
  Taloja: { lat: 19.058, lng: 73.101, city: "navi mumbai" },
};

/* ──────────────────────────────────────────────────────────────────────────────
 * City boundaries (simple inline rectangles for visual context)
 * ──────────────────────────────────────────────────────────────────────────── */
const MUMBAI_BOUNDS: GeoJSON.Feature = {
  type: "Feature",
  properties: { name: "Mumbai" },
  geometry: {
    type: "Polygon",
    coordinates: [
      [
        [72.76, 19.34],
        [72.76, 18.85],
        [72.99, 18.85],
        [72.99, 19.34],
        [72.76, 19.34],
      ],
    ],
  },
};
const NAVI_BOUNDS: GeoJSON.Feature = {
  type: "Feature",
  properties: { name: "Navi Mumbai" },
  geometry: {
    type: "Polygon",
    coordinates: [
      [
        [72.95, 19.28],
        [72.95, 18.95],
        [73.14, 18.95],
        [73.14, 19.28],
        [72.95, 19.28],
      ],
    ],
  },
};

/* ──────────────────────────────────────────────────────────────────────────────
 * Utils
 * ──────────────────────────────────────────────────────────────────────────── */
const norm = (v: string) => v?.trim().toLowerCase();
const toNum = (x: unknown, fallback = 0): number => (Number.isFinite(Number(x)) ? Number(x) : fallback);
const safeAvg = (arr: number[]) => {
  const nums = arr.filter((n) => Number.isFinite(n));
  return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
};
const safeMedian = (arr: number[]) => {
  const nums = arr.filter((n) => Number.isFinite(n)).sort((a, b) => a - b);
  if (!nums.length) return 0;
  const mid = Math.floor(nums.length / 2);
  return nums.length % 2 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
};
const colorFor = (value: number) => (value < 700 ? "#22c55e" : value <= 900 ? "#f59e0b" : "#ef4444");
const radiusFor = (value: number) => (value < 700 ? 6 : value <= 900 ? 9 : 12);

/* ──────────────────────────────────────────────────────────────────────────────
 * CSV loader
 * ──────────────────────────────────────────────────────────────────────────── */
async function loadAreaStats(): Promise<AreaRow[]> {
  const res = await fetch("/data/Carbon_Emission_Cleaned.csv");
  if (!res.ok) return [];
  const txt = await res.text();
  const lines = txt.split(/\r?\n/).filter((ln) => ln && ln.includes(","));
  if (!lines.length) return [];
  const headers = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cols = line.split(",");
    const rec: any = {};
    headers.forEach((h, i) => {
      const raw = (cols[i] ?? "").trim();
      const maybeNum = Number(raw);
      rec[h] = raw === "" || Number.isNaN(maybeNum) ? raw : maybeNum;
    });
    // preserve raw string too for area_type parsing
    rec["area_type_raw"] = rec["area_type_raw"] ?? rec["area_type_raw"] ?? rec["area_type_raw"];
    return rec as AreaRow;
  });
}

/* ──────────────────────────────────────────────────────────────────────────────
 * Map helper: Fit to markers or selected
 * ──────────────────────────────────────────────────────────────────────────── */
function FitBounds({ markers, selected }: { markers: { lat: number; lng: number }[]; selected: { lat: number; lng: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (selected) {
      map.setView([selected.lat, selected.lng], 13, { animate: true });
      return;
    }
    if (markers.length) {
      const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lng] as LatLngExpression));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [markers, selected, map]);
  return null;
}

/* ──────────────────────────────────────────────────────────────────────────────
 * Full Page
 * ──────────────────────────────────────────────────────────────────────────── */
export default function MapPage() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  // dataset & selection
  const [rows, setRows] = useState<AreaRow[]>([]);
  const [selected, setSelected] = useState<SelectedArea | null>(null);

  // filters
  const [cityFilter, setCityFilter] = useState<CityFilter>("all");
  const [emissionFilter, setEmissionFilter] = useState<EmissionFilter>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("circles");
  const [sectorLayer, setSectorLayer] = useState<SectorLayer>("overall");

  // context highlight (from area_type_raw tags)
  const [highlightTags, setHighlightTags] = useState<string[]>([]); // ["Residential", "Vehicular"], etc
  const tagOptions = ["Residential", "Corporate", "Industrial", "Vehicular", "Construction", "Airport"];

  // UI
  const [clock, setClock] = useState<string>("00:00:00");
  const [showBoundaries, setShowBoundaries] = useState<boolean>(false);
  const [showRanking, setShowRanking] = useState<boolean>(false);

  // collapsibles (simple mobile-friendly)
  const [openFilters, setOpenFilters] = useState(true);
  const [openCommunity, setOpenCommunity] = useState(true);
  const [openBreakdown, setOpenBreakdown] = useState(true);
  const [openTrends, setOpenTrends] = useState(true);
  const [openDetails, setOpenDetails] = useState(true);

  // scenarios
  const [activeScenarios, setActiveScenarios] = useState({
    publicTransport: false,   // -20% transport (+10% if Top 3)
    zeroWaste: false,         // -30% waste (+10% if Top 3)
    efficientCooking: false,  // -15% cooking (+10% if Top 3)
    minimalShopping: false,   // -25% consumption (+10% if Top 3)
  });
  const toggleScenario = (key: keyof typeof activeScenarios) => setActiveScenarios((prev) => ({ ...prev, [key]: !prev[key] }));
  const resetScenarios = () =>
    setActiveScenarios({ publicTransport: false, zeroWaste: false, efficientCooking: false, minimalShopping: false });

  // saved scenarios
  const [saved, setSaved] = useState<SavedScenario[]>([]);
  const [compareIds, setCompareIds] = useState<string[]>([]); // up to 2
  const toggleCompare = (id: string) =>
    setCompareIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 2 ? [...prev, id] : prev));

  const saveScenario = (name: string, payload: SavedScenario["payload"], impactPct: number) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setSaved((prev) => [{ id, name, payload, impactPct }, ...prev]);
  };
  const deleteScenario = (id: string) => setSaved((prev) => prev.filter((s) => s.id !== id));

  // live clock
  useEffect(() => {
    const id = setInterval(() => {
      const now = new Date();
      setClock(now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".map-header", { opacity: 0, y: -30 }, { opacity: 1, y: 0, duration: 0.8 });
      gsap.fromTo(".map-container", { opacity: 0, scale: 0.98 }, { opacity: 1, scale: 1, duration: 0.6, delay: 0.2 });
      gsap.fromTo(".community-card", { opacity: 0, x: 30 }, { opacity: 1, x: 0, duration: 0.5, stagger: 0.08, delay: 0.3 });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  // load data
  useEffect(() => {
    (async () => {
      const data = await loadAreaStats();
      const filtered = data.filter((r) => {
        const c = norm(String(r.city ?? ""));
        const a = String(r.area ?? "").trim();
        return a && (c === "mumbai" || c === "navi mumbai");
      });
      setRows(filtered);
    })();
  }, []);

  /* ──────────────────────────────────────────────────────────────────────────
   * Build markers (base) with proper sector derivation
   * ──────────────────────────────────────────────────────────────────────── */
  const baseMarkers: MarkerRow[] = useMemo(() => {
    const grouped: Record<string, { city: string; rows: AreaRow[] }> = {};
    for (const r of rows) {
      const a = String(r.area ?? "").trim();
      const c = String(r.city ?? "").trim();
      if (!a || !c) continue;
      const k = norm(a);
      if (!grouped[k]) grouped[k] = { city: c, rows: [] };
      grouped[k].rows.push(r);
    }

    return Object.entries(grouped).flatMap(([nArea, bundle]) => {
      const originalKey = Object.keys(AREA_COORDS).find((k) => norm(k) === nArea);
      if (!originalKey) return [];

      const coord = AREA_COORDS[originalKey];
      const cityN = norm(bundle.city);

      // Convert total_co2 → kg/month (factor from earlier version)
      const perRowKgMonth = bundle.rows.map((r) => {
        const tco2 = toNum(r.total_co2, 0);
        return ((tco2 * 1000) / 12) * 2.467;
      });
      const medianBase = safeMedian(perRowKgMonth);
      const count = bundle.rows.length;

      // Sector proxies from CSV
      const transportProxies = bundle.rows.map((r) => {
        const distKm = toNum((r as any)["Vehicle Monthly Distance Km"], 0);
        const transportField = toNum(r.Transport, 0);
        return distKm > 0 ? distKm : transportField;
      });
      const wasteProxies = bundle.rows.map((r) => toNum(r.waste_kg, 0));
      const cookingProxies = bundle.rows.map((r) => toNum(r.lpg_kg, 0));
      const consProxies = bundle.rows.map((r) => toNum(r.shopping_spend, 0));

      // Average proxies (area-level)
      const avgTransportProxy = safeAvg(transportProxies);
      const avgWasteProxy = safeAvg(wasteProxies);
      const avgCookingProxy = safeAvg(cookingProxies);
      const avgConsProxy = safeAvg(consProxies);

      // Scale to medianBase so that contributions sum to area median
      let transport = 0, waste = 0, cooking = 0, consumption = 0;
      const proxySum = avgTransportProxy + avgWasteProxy + avgCookingProxy + avgConsProxy;
      if (medianBase > 0 && proxySum > 0) {
        const f = medianBase / proxySum;
        transport = avgTransportProxy * f;
        waste = avgWasteProxy * f;
        cooking = avgCookingProxy * f;
        consumption = avgConsProxy * f;
      } else {
        transport = waste = cooking = consumption = medianBase / 4;
      }

      // area_type_raw → tags array
      const tags = new Set<string>();
      bundle.rows.forEach((r) => {
        const raw = String(r.area_type_raw ?? r["area_type_raw"] ?? "").trim();
        if (!raw) return;
        raw.split(",").forEach((p) => {
          const t = p.replace(/[\[\]'"]/g, "").trim();
          if (t) tags.add(
            t
              .split(/\s+/)
              .map((w, i) => (i === 0 ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w.toLowerCase()))
              .join(" ")
              .replace(/\s*,\s*/g, "")
          );
        });
      });

      return [
        {
          city: cityN === "mumbai" ? "mumbai" : "navi mumbai",
          area: originalKey,
          lat: coord.lat,
          lng: coord.lng,
          median: medianBase,
          count,
          transport,
          waste,
          cooking,
          consumption,
          areaTypes: Array.from(tags),
        },
      ];
    });
  }, [rows]);

  /* ──────────────────────────────────────────────────────────────────────────
   * Filters
   * ──────────────────────────────────────────────────────────────────────── */
  const filteredMarkers = useMemo(() => {
    return baseMarkers.filter((m) => {
      if (cityFilter !== "all" && norm(m.city) !== cityFilter) return false;
      if (emissionFilter !== "all") {
        if (emissionFilter === "low" && !(m.median < 700)) return false;
        if (emissionFilter === "medium" && !(m.median >= 700 && m.median <= 900)) return false;
        if (emissionFilter === "high" && !(m.median > 900)) return false;
      }
      if (highlightTags.length) {
        // If highlighting tags, don't filter them out; we highlight via style.
        // However, you can switch to filter-only by returning false when none matched.
      }
      return true;
    });
  }, [baseMarkers, cityFilter, emissionFilter, highlightTags]);

  /* ──────────────────────────────────────────────────────────────────────────
   * Top 3 areas (from current filtered set)
   * ──────────────────────────────────────────────────────────────────────── */
  const top3Areas = useMemo(() => {
    const sorted = filteredMarkers.slice().sort((a, b) => b.median - a.median);
    return new Set(sorted.slice(0, 3).map((m) => m.area));
  }, [filteredMarkers]);

  /* ──────────────────────────────────────────────────────────────────────────
   * Scenarios (stronger on Top 3)
   * ──────────────────────────────────────────────────────────────────────── */
  const applyScenarioAdjustments = (m: MarkerRow): MarkerRow => {
    const isTop3 = top3Areas.has(m.area);
    const bonus = isTop3 ? 0.1 : 0.0;

    let transport = m.transport;
    let waste = m.waste;
    let cooking = m.cooking;
    let consumption = m.consumption;

    if (activeScenarios.publicTransport) transport *= 1 - (0.2 + bonus);
    if (activeScenarios.zeroWaste) waste *= 1 - (0.3 + bonus);
    if (activeScenarios.efficientCooking) cooking *= 1 - (0.15 + bonus);
    if (activeScenarios.minimalShopping) consumption *= 1 - (0.25 + bonus);

    const adjustedMedian = Math.max(0, transport + waste + cooking + consumption);
    return { ...m, median: adjustedMedian, transport, waste, cooking, consumption };
  };

  const adjustedMarkers = useMemo(() => filteredMarkers.map(applyScenarioAdjustments), [filteredMarkers, activeScenarios, top3Areas]);

  // maintain selected when data changes
  useEffect(() => {
    if (!selected) return;
    const baseMatch = filteredMarkers.some((m) => m.area === selected.area && norm(m.city) === norm(selected.city));
    if (!baseMatch) {
      setSelected(null);
      return;
    }
    const adj = adjustedMarkers.find((m) => m.area === selected.area && norm(m.city) === norm(selected.city));
    if (adj) {
      setSelected((prev) =>
        prev
          ? {
              ...prev,
              median: adj.median,
              transport: adj.transport,
              waste: adj.waste,
              cooking: adj.cooking,
              consumption: adj.consumption,
              lat: adj.lat,
              lng: adj.lng,
            }
          : prev
      );
    }
  }, [filteredMarkers, adjustedMarkers, selected]);

  /* ──────────────────────────────────────────────────────────────────────────
   * Community summary & charts (adjusted)
   * ──────────────────────────────────────────────────────────────────────── */
  const community = useMemo(() => {
    if (!adjustedMarkers.length)
      return { totalAreas: 0, avgMedian: 0, totalUsers: 0, avgTransport: 0, avgWaste: 0, avgCooking: 0, avgConsumption: 0 };
    const totalAreas = adjustedMarkers.length;
    const avgMedian = adjustedMarkers.reduce((a, r) => a + toNum(r.median, 0), 0) / totalAreas;
    const totalUsers = adjustedMarkers.reduce((a, r) => a + toNum(r.count, 0), 0);
    const avgTransport = adjustedMarkers.reduce((a, r) => a + toNum(r.transport, 0), 0) / totalAreas;
    const avgWaste = adjustedMarkers.reduce((a, r) => a + toNum(r.waste, 0), 0) / totalAreas;
    const avgCooking = adjustedMarkers.reduce((a, r) => a + toNum(r.cooking, 0), 0) / totalAreas;
    const avgConsumption = adjustedMarkers.reduce((a, r) => a + toNum(r.consumption, 0), 0) / totalAreas;
    return { totalAreas, avgMedian, totalUsers, avgTransport, avgWaste, avgCooking, avgConsumption };
  }, [adjustedMarkers]);

  // city-level benchmarks
  const cityBenchmarks = useMemo(() => {
    const cities: Record<string, MarkerRow[]> = { mumbai: [], "navi mumbai": [] };
    adjustedMarkers.forEach((m) => {
      if (norm(m.city) === "mumbai") cities.mumbai.push(m);
      if (norm(m.city) === "navi mumbai") cities["navi mumbai"].push(m);
    });
    const avg = (arr: MarkerRow[]) => (arr.length ? arr.reduce((a, r) => a + r.median, 0) / arr.length : 0);
    return {
      mumbaiAvg: avg(cities.mumbai),
      naviAvg: avg(cities["navi mumbai"]),
      target: 600,
    };
  }, [adjustedMarkers]);

  // Overall impact %
  const scenarioImpact = useMemo(() => {
    if (!filteredMarkers.length) return 0;
    const originalTotal = filteredMarkers.reduce((a, r) => a + r.median, 0);
    const adjustedTotal = adjustedMarkers.reduce((a, r) => a + r.median, 0);
    return originalTotal > 0 ? ((originalTotal - adjustedTotal) / originalTotal) * 100 : 0;
  }, [filteredMarkers, adjustedMarkers]);

  // Heatmap points (respect sector layer)
  const heatPoints = useMemo<[number, number, number][]>(() => {
    return adjustedMarkers.map((m) => {
      const v =
        sectorLayer === "overall"
          ? m.median
          : sectorLayer === "transport"
          ? m.transport
          : sectorLayer === "waste"
          ? m.waste
          : sectorLayer === "cooking"
          ? m.cooking
          : m.consumption;
      return [m.lat, m.lng, Math.max(0.1, v / 1000)];
    });
  }, [adjustedMarkers, sectorLayer]);

  // Trends + 600kg benchmark
  const trendData = useMemo(() => {
    const sorted = adjustedMarkers.slice().sort((a, b) => b.median - a.median);
    const labels = sorted.map((m) => m.area);
    const medians = sorted.map((m) => m.median);
    const benchmark = new Array(medians.length).fill(600);

    return {
      labels,
      datasets: [
        { label: "Median CO₂ (kg/month)", data: medians, borderColor: "#3b82f6", backgroundColor: "rgba(59,130,246,0.25)", tension: 0.3, pointRadius: 2 },
        { label: "Sustainable Target (600 kg)", data: benchmark, borderColor: "#10b981", borderDash: [6, 6], pointRadius: 0 },
      ],
    };
  }, [adjustedMarkers]);

  // Breakdown
  const communityBreakdown = useMemo(() => {
    const vals = [community.avgTransport || 0, community.avgWaste || 0, community.avgCooking || 0, community.avgConsumption || 0];
    return {
      labels: ["Transport", "Waste", "Cooking", "Consumption"],
      datasets: [{ label: "Avg kg/month per area", data: vals, backgroundColor: ["#ef4444", "#22c55e", "#3b82f6", "#f59e0b"], borderWidth: 0 }],
    };
  }, [community]);

  const defaultCenter = { lat: 19.08, lng: 72.88 };
  const valueForLayer = (m: MarkerRow) =>
    sectorLayer === "overall" ? m.median : sectorLayer === "transport" ? m.transport : sectorLayer === "waste" ? m.waste : sectorLayer === "cooking" ? m.cooking : m.consumption;

  const openAreaFromList = (m: MarkerRow) =>
    setSelected({ city: m.city, area: m.area, median: m.median, count: m.count, transport: m.transport, waste: m.waste, cooking: m.cooking, consumption: m.consumption, lat: m.lat, lng: m.lng });

  const benchmarkBadge = (val: number) =>
    val <= 600 ? <Badge className="bg-emerald-100 text-emerald-700">Below target</Badge> : <Badge className="bg-amber-100 text-amber-700">Above target</Badge>;

  // sector drill-down data for selected area
  const selectedDrill = useMemo(() => {
    if (!selected) return null;
    return {
      labels: ["Transport", "Waste", "Cooking", "Consumption"],
      datasets: [{ label: `${selected.area} (kg/month)`, data: [selected.transport, selected.waste, selected.cooking, selected.consumption], backgroundColor: ["#ef4444", "#22c55e", "#3b82f6", "#f59e0b"] }],
    };
  }, [selected]);

  // Scenario Save current
  const handleSaveScenario = () => {
    const name = prompt("Save scenario as:");
    if (!name) return;
    saveScenario(name, { ...activeScenarios }, scenarioImpact);
  };

  // Run saved scenario (apply its toggles)
  const runSavedScenario = (s: SavedScenario) => {
    setActiveScenarios({ ...s.payload });
  };

  // Compare selected scenarios against baseline (simple two-bar compare)
  const compareSummary = useMemo(() => {
    if (compareIds.length === 0) return null;
    const picks = saved.filter((s) => compareIds.includes(s.id));
    return picks.slice(0, 2);
  }, [compareIds, saved]);

  // Highlight style helper
  const isHighlighted = (m: MarkerRow) => {
    if (!highlightTags.length) return true; // nothing to filter out, we just style
    // Return true always; style will change if tag present
    return true;
  };
  const hasAnyTag = (m: MarkerRow) => highlightTags.length && m.areaTypes.some((t) => highlightTags.includes(t));

  return (
    <div ref={containerRef} className="min-h-screen py-8 relative overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-lime-100">
      {/* Live Clock */}
      <div className="absolute top-4 right-6 flex items-center gap-2 text-gray-700 font-semibold text-sm bg-white/80 px-3 py-1 rounded shadow">
        <Clock className="w-4 h-4" />
        {clock}
      </div>

      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        {/* Header */}
        <div className="map-header mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button onClick={() => navigate("/dashboard")} variant="outline" size="sm" className="flex items-center gap-2 bg-white/80 hover:bg-white shadow-sm hover:shadow-md transition-all duration-300">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Community Carbon Map</h1>
          <p className="text-gray-600 leading-relaxed">Explore carbon emissions across Mumbai &amp; Navi Mumbai areas</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            {/* Map */}
            <Card className="map-container bg-white/90 backdrop-blur-sm shadow-xl border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Mumbai &amp; Navi Mumbai — Area CO₂ Map
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative rounded-lg h-96 overflow-hidden shadow-inner">
                  {/* Controls */}
                  <div className="absolute z-[500] top-3 right-3 bg-white/95 border rounded-lg shadow p-2 flex items-center gap-2">
                    <div className="flex gap-1">
                      <button className={`px-2 py-1 text-xs rounded ${viewMode === "circles" ? "bg-emerald-100" : ""}`} onClick={() => setViewMode("circles")}>
                        Circles
                      </button>
                      <button className={`px-2 py-1 text-xs rounded ${viewMode === "heatmap" ? "bg-emerald-100" : ""}`} onClick={() => setViewMode("heatmap")}>
                        Heatmap
                      </button>
                    </div>
                    <div className="w-px h-5 bg-gray-200" />
                    <div className="flex items-center gap-1">
                      <Compass className="w-4 h-4 text-gray-600" />
                      <select className="border rounded px-1 py-0.5 text-xs bg-white" value={sectorLayer} onChange={(e) => setSectorLayer(e.target.value as SectorLayer)} title="Choose metric">
                        <option value="overall">Overall</option>
                        <option value="transport">Transport</option>
                        <option value="waste">Waste</option>
                        <option value="cooking">Cooking</option>
                        <option value="consumption">Consumption</option>
                      </select>
                    </div>
                    <div className="w-px h-5 bg-gray-200" />
                    <button className={`px-2 py-1 text-xs rounded flex items-center gap-1 ${showBoundaries ? "bg-blue-100" : ""}`} onClick={() => setShowBoundaries((s) => !s)} title="Toggle city boundaries">
                      <MapIcon className="w-4 h-4" />
                      Boundaries
                    </button>
                  </div>

                  <MapContainer center={defaultCenter} zoom={11} style={{ height: "100%", width: "100%" }} scrollWheelZoom>
                    <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                    <FitBounds markers={adjustedMarkers} selected={selected ? { lat: selected.lat, lng: selected.lng } : null} />

                    {showBoundaries && (
                      <>
                        <GeoJSON key="mumbai" data={MUMBAI_BOUNDS as any} style={{ color: "#2563eb", weight: 1, fillOpacity: 0.03 }} />
                        <GeoJSON key="navi" data={NAVI_BOUNDS as any} style={{ color: "#22c55e", weight: 1, fillOpacity: 0.03 }} />
                      </>
                    )}

                    {/* Circles */}
                    {viewMode === "circles" &&
                      adjustedMarkers.map((m) => {
                        const value = valueForLayer(m);
                        const highlight = hasAnyTag(m);
                        return (
                          <CircleMarker
                            key={m.area}
                            center={{ lat: m.lat, lng: m.lng }}
                            radius={radiusFor(value)}
                            pathOptions={{
                              color: colorFor(value),
                              fillColor: colorFor(value),
                              fillOpacity: 0.85,
                              weight: highlight ? 3 : 1.5,
                              dashArray: highlight ? "4 2" : undefined,
                            }}
                            eventHandlers={{
                              click: () =>
                                setSelected({
                                  city: m.city,
                                  area: m.area,
                                  median: m.median,
                                  count: m.count,
                                  transport: m.transport,
                                  waste: m.waste,
                                  cooking: m.cooking,
                                  consumption: m.consumption,
                                  lat: m.lat,
                                  lng: m.lng,
                                }),
                            }}
                          >
                            <Tooltip direction="top" offset={[0, -6]} opacity={1}>
                              <div className="text-xs">
                                <div className="font-semibold">{m.area}</div>
                                <div className="capitalize">{m.city}</div>
                                <div>{sectorLayer === "overall" ? `${m.median.toFixed(1)} kg/month` : `${value.toFixed(1)} kg (${sectorLayer})`}</div>
                                <div>Users: {m.count}</div>
                                {m.areaTypes.length ? <div className="text-[10px] text-gray-600">Tags: {m.areaTypes.join(", ")}</div> : null}
                              </div>
                            </Tooltip>
                          </CircleMarker>
                        );
                      })}

                    {/* Heatmap */}
                    {viewMode === "heatmap" && heatPoints.length > 0 && <HeatmapLayer points={heatPoints} />}
                  </MapContainer>
                </div>
              </CardContent>
            </Card>

            {/* Legend + Top/Bottom + Full Ranking */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0">
              <CardHeader className="py-2 px-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <Layers className="w-4 h-4" />
                  {viewMode === "heatmap" ? "Heatmap Intensity & Top Areas" : "Emission Levels & Top Areas"}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 py-2 space-y-3">
                {/* Legend */}
                {viewMode === "circles" ? (
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-3 h-3 rounded-full" style={{ background: "#22c55e" }} />
                      <span>Low (&lt;700 kg/month)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-4 h-4 rounded-full" style={{ background: "#f59e0b" }} />
                      <span>Medium (701–900 kg/month)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-5 h-5 rounded-full" style={{ background: "#ef4444" }} />
                      <span>High (&gt;901 kg/month)</span>
                    </div>
                  </div>
                ) : (
                  <div className="w-full">
                    <div className="h-3 w-full bg-gradient-to-r from-green-500 via-yellow-400 to-red-600 rounded" title="Green = Low, Red = High. Scale adjusts to visible data." />
                    <div className="flex justify-between text-xs text-gray-600 mt-1">
                      <span>Low</span>
                      <span>High</span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1">Scale is relative to visible areas</p>
                  </div>
                )}

                {/* Top & Bottom */}
                {adjustedMarkers.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold mb-1 text-red-600 text-[11px]">Top 3</h4>
                        <button className="text-[11px] text-blue-600 flex items-center gap-1" onClick={() => setShowRanking(true)} title="View full ranking">
                          <ListOrdered className="w-3 h-3" />
                          View all
                        </button>
                      </div>
                      <ul className="space-y-0.5">
                        {adjustedMarkers
                          .slice()
                          .sort((a, b) => b.median - a.median)
                          .slice(0, 3)
                          .map((m, i) => (
                            <li key={`top-${i}`} className="flex justify-between cursor-pointer hover:text-red-700" onClick={() => openAreaFromList(m)}>
                              <span>{m.area}</span>
                              <span className="font-medium">{m.median.toFixed(1)} kg</span>
                            </li>
                          ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1 text-green-600 text-[11px]">Bottom 3</h4>
                      <ul className="space-y-0.5">
                        {adjustedMarkers
                          .slice()
                          .sort((a, b) => a.median - b.median)
                          .slice(0, 3)
                          .map((m, i) => (
                            <li key={`bottom-${i}`} className="flex justify-between cursor-pointer hover:text-green-700" onClick={() => openAreaFromList(m)}>
                              <span>{m.area}</span>
                              <span className="font-medium">{m.median.toFixed(1)} kg</span>
                            </li>
                          ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">No data available</p>
                )}
              </CardContent>
            </Card>

            {/* Scenario Simulator */}
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0">
              <CardHeader className="py-2 px-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <TrendingUp className="w-4 h-4" />
                  Scenario Simulator
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 py-2 space-y-3 text-sm">
                <p className="text-xs text-gray-600">
                  Toggle scenarios to see projected impact. Current Top 3 areas receive extra effect. Save scenarios and compare results.
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => toggleScenario("publicTransport")} className={`p-2 border rounded-lg shadow-sm hover:shadow-md transition text-left ${activeScenarios.publicTransport ? "bg-emerald-100 border-emerald-300" : "bg-white"}`}>
                    🚇 <span className="font-semibold">More Public Transport</span>
                    <p className="text-xs text-gray-600">-20% Transport</p>
                  </button>

                  <button onClick={() => toggleScenario("zeroWaste")} className={`p-2 border rounded-lg shadow-sm hover:shadow-md transition text-left ${activeScenarios.zeroWaste ? "bg-emerald-100 border-emerald-300" : "bg-white"}`}>
                    ♻️ <span className="font-semibold">Zero Waste</span>
                    <p className="text-xs text-gray-600">-30% Waste</p>
                  </button>

                  <button onClick={() => toggleScenario("efficientCooking")} className={`p-2 border rounded-lg shadow-sm hover:shadow-md transition text-left ${activeScenarios.efficientCooking ? "bg-emerald-100 border-emerald-300" : "bg-white"}`}>
                    🔥 <span className="font-semibold">Efficient Cooking</span>
                    <p className="text-xs text-gray-600">-15% Cooking</p>
                  </button>

                  <button onClick={() => toggleScenario("minimalShopping")} className={`p-2 border rounded-lg shadow-sm hover:shadow-md transition text-left ${activeScenarios.minimalShopping ? "bg-emerald-100 border-emerald-300" : "bg-white"}`}>
                    🛍 <span className="font-semibold">Minimal Shopping</span>
                    <p className="text-xs text-gray-600">-25% Consumption</p>
                  </button>
                </div>

                <div className="mt-1 flex items-center justify-between text-xs text-gray-700">
                  {scenarioImpact > 0 ? <span className="font-semibold text-green-700">Projected reduction: –{scenarioImpact.toFixed(1)}%</span> : <span className="text-gray-500">No scenarios active</span>}
                  <div className="flex items-center gap-2">
                    <button onClick={handleSaveScenario} className="text-[11px] text-blue-600 hover:underline flex items-center gap-1">
                      <Save className="w-3 h-3" />
                      Save
                    </button>
                    <button onClick={resetScenarios} className="text-[11px] text-blue-600 hover:underline flex items-center gap-1">
                      <RefreshCcw className="w-3 h-3" />
                      Reset
                    </button>
                  </div>
                </div>

                {/* Saved scenarios list + compare */}
                {saved.length > 0 && (
                  <div className="mt-2 border-t pt-2">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs font-semibold">Saved Scenarios</div>
                      <div className="text-[11px] text-gray-500">Select up to 2 to compare</div>
                    </div>
                    <ul className="space-y-1">
                      {saved.map((s) => (
                        <li key={s.id} className="flex items-center justify-between text-xs border rounded px-2 py-1 bg-white">
                          <div className="flex items-center gap-2">
                            <input type="checkbox" checked={compareIds.includes(s.id)} onChange={() => toggleCompare(s.id)} />
                            <span className="font-medium">{s.name}</span>
                            <span className="text-gray-500">({s.impactPct.toFixed(1)}% ↓)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => runSavedScenario(s)} className="text-blue-600 flex items-center gap-1">
                              <PlayCircle className="w-3 h-3" />
                              Run
                            </button>
                            <button onClick={() => deleteScenario(s.id)} className="text-red-600 flex items-center gap-1">
                              <Trash2 className="w-3 h-3" />
                              Delete
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>

                    {/* Compare summary */}
                    {compareSummary && compareSummary.length > 0 && (
                      <div className="mt-3 bg-gray-50 border rounded p-2">
                        <div className="text-xs font-semibold mb-1">Comparison (impact vs baseline)</div>
                        <div className="grid grid-cols-2 gap-2">
                          {compareSummary.map((c) => (
                            <div key={c.id} className="p-2 rounded bg-white border">
                              <div className="text-[11px] text-gray-600">{c.name}</div>
                              <div className="text-sm font-semibold text-green-700">–{c.impactPct.toFixed(1)}%</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="space-y-6">
            {/* Filters (collapsible) */}
            <Card className="community-card bg-white/90 backdrop-blur-sm shadow-xl border-0">
              <CardHeader onClick={() => setOpenFilters((s) => !s)} className="cursor-pointer">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    Filters
                  </span>
                  {openFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </CardTitle>
              </CardHeader>
              {openFilters && (
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div>
                      <label className="block text-gray-600 mb-1">City</label>
                      <select value={cityFilter} onChange={(e) => setCityFilter(e.target.value as CityFilter)} className="w-full border rounded-md px-2 py-1 text-gray-700 bg-white">
                        <option value="all">All</option>
                        <option value="mumbai">Mumbai</option>
                        <option value="navi mumbai">Navi Mumbai</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-600 mb-1">Emission Level</label>
                      <select value={emissionFilter} onChange={(e) => setEmissionFilter(e.target.value as EmissionFilter)} className="w-full border rounded-md px-2 py-1 text-gray-700 bg-white">
                        <option value="all">All</option>
                        <option value="low">Low (&lt;700)</option>
                        <option value="medium">Medium (701–900)</option>
                        <option value="high">High (&gt;901)</option>
                      </select>
                    </div>

                    {/* Context Highlight (tags from area_type_raw) */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-gray-600">Context Highlights</span>
                        <Info className="w-4 h-4 text-gray-400" title="Highlights areas whose tags match. Styling only; does not filter out others." />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {tagOptions.map((t) => {
                          const on = highlightTags.includes(t);
                          return (
                            <button
                              key={t}
                              className={`px-2 py-1 rounded border text-xs ${on ? "bg-yellow-100 border-yellow-300" : "bg-white"}`}
                              onClick={() =>
                                setHighlightTags((prev) =>
                                  prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
                                )
                              }
                            >
                              {on ? <Eye className="w-3 h-3 inline mr-1" /> : <EyeOff className="w-3 h-3 inline mr-1" />}
                              {t}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setCityFilter("all");
                          setEmissionFilter("all");
                          setSectorLayer("overall");
                          setHighlightTags([]);
                        }}
                        className="bg-white"
                      >
                        Reset Filters
                      </Button>
                      <Button variant="secondary" onClick={() => setSelected(null)} className="bg-white">
                        Clear Selection
                      </Button>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Community Stats (collapsible) + City Benchmarks */}
            <Card className="community-card bg-white/90 backdrop-blur-sm shadow-xl border-0">
              <CardHeader onClick={() => setOpenCommunity((s) => !s)} className="cursor-pointer">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Community Stats
                  </span>
                  {openCommunity ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </CardTitle>
              </CardHeader>
              {openCommunity && (
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Areas covered</span>
                      <Badge variant="outline">{community.totalAreas}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Average area CO₂</span>
                      <Badge className="bg-blue-100 text-blue-800">{community.avgMedian.toFixed(1)} kg</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total users</span>
                      <Badge className="bg-green-100 text-green-800">{community.totalUsers}</Badge>
                    </div>

                    {/* City benchmark compare */}
                    <div className="mt-2 border-t pt-2">
                      <div className="flex items-center gap-1 text-sm mb-1">
                        <Target className="w-4 h-4 text-emerald-600" />
                        <span className="font-semibold">City Benchmarks</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="p-2 bg-white border rounded">
                          <div className="text-gray-600">Mumbai</div>
                          <div className="font-semibold">{cityBenchmarks.mumbaiAvg.toFixed(1)} kg</div>
                        </div>
                        <div className="p-2 bg-white border rounded">
                          <div className="text-gray-600">Navi Mumbai</div>
                          <div className="font-semibold">{cityBenchmarks.naviAvg.toFixed(1)} kg</div>
                        </div>
                        <div className="p-2 bg-white border rounded">
                          <div className="text-gray-600">Target</div>
                          <div className="font-semibold">{cityBenchmarks.target} kg</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Community Breakdown (collapsible) */}
            <Card className="community-card bg-white/90 backdrop-blur-sm shadow-xl border-0">
              <CardHeader onClick={() => setOpenBreakdown((s) => !s)} className="cursor-pointer">
                <CardTitle className="flex items-center justify-between text-sm">
                  <span>Community Breakdown</span>
                  {openBreakdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </CardTitle>
              </CardHeader>
              {openBreakdown && (
                <CardContent>
                  <Bar
                    data={communityBreakdown}
                    options={{
                      responsive: true,
                      plugins: { legend: { display: false }, tooltip: { enabled: true } },
                      scales: { y: { beginAtZero: true, title: { display: true, text: "kg CO₂ / month (avg per area)" } } },
                    }}
                  />
                </CardContent>
              )}
            </Card>

            {/* Trends (collapsible) */}
            <Card className="community-card bg-white/90 backdrop-blur-sm shadow-xl border-0">
              <CardHeader onClick={() => setOpenTrends((s) => !s)} className="cursor-pointer">
                <CardTitle className="flex items-center justify-between text-sm">
                  <span>Trends by Area (median)</span>
                  {openTrends ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </CardTitle>
              </CardHeader>
              {openTrends && (
                <CardContent>
                  <Line
                    data={trendData}
                    options={{
                      responsive: true,
                      interaction: { mode: "nearest", axis: "x", intersect: false },
                      plugins: {
                        legend: { display: true, labels: { boxWidth: 12, usePointStyle: true } },
                        tooltip: { enabled: true, callbacks: { label: (ctx) => `${ctx.dataset.label}: ${Number(ctx.raw).toFixed(1)} kg` } },
                      },
                      scales: {
                        y: { beginAtZero: true, title: { display: true, text: "kg CO₂ / month" } },
                        x: { ticks: { autoSkip: true, maxTicksLimit: 10 }, title: { display: true, text: "Areas" } },
                      },
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-2">Hover for exact values. Green dashed line shows the 600 kg/month target.</p>
                </CardContent>
              )}
            </Card>

            {/* Area Details (collapsible) */}
            {selected && (
              <Card className="community-card border-blue-200 bg-white/95 backdrop-blur-sm shadow-xl">
                <CardHeader onClick={() => setOpenDetails((s) => !s)} className="cursor-pointer">
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Area Details — {selected.area}
                    </span>
                    {openDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </CardTitle>
                </CardHeader>
                {openDetails && (
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">City</span>
                        <span className="font-semibold capitalize">{selected.city}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Avg CO₂</span>
                        <span className="font-semibold">{selected.median.toFixed(1)} kg/month</span>
                        {benchmarkBadge(selected.median)}
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600">Users Count</span>
                        <span className="font-semibold">{selected.count}</span>
                      </div>

                      {/* Per-person */}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Per-person CO₂ (approx)</span>
                        <span className="font-semibold">
                          {selected.count > 0 ? (selected.median / selected.count).toFixed(1) : "—"} kg/month
                        </span>
                      </div>

                      {/* Drill-down chart */}
                      <div className="mt-4">
                        <h4 className="text-sm font-semibold mb-2">Emission Breakdown</h4>
                        <Bar
                          data={{
                            labels: ["Transport", "Waste", "Cooking", "Consumption"],
                            datasets: [{ label: "kg/month", data: [selected.transport, selected.waste, selected.cooking, selected.consumption], backgroundColor: ["#ef4444", "#22c55e", "#3b82f6", "#f59e0b"] }],
                          }}
                          options={{
                            responsive: true,
                            plugins: {
                              legend: { display: false },
                              tooltip: {
                                callbacks: {
                                  label: (ctx) => {
                                    const val = Number(ctx.raw ?? 0);
                                    const dataset = (ctx.dataset.data as number[]) || [];
                                    const total = dataset.reduce((a, b) => a + (Number(b) || 0), 0);
                                    const percent = total ? ((val / total) * 100).toFixed(1) : "0";
                                    return `${val.toFixed(1)} kg (${percent}%)`;
                                  },
                                },
                              },
                            },
                            scales: { y: { beginAtZero: true, title: { display: true, text: "kg CO₂" } } },
                          }}
                        />
                      </div>

                      <p className="text-xs text-gray-500 mt-2">Data source: <code>Carbon_Emission_Cleaned.csv</code></p>
                    </div>
                  </CardContent>
                )}
              </Card>
            )}

            <div className="community-card text-center">
              <Button onClick={() => navigate("/dashboard")} className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300">
                Back to Your Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Full Ranking Modal */}
      {showRanking && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-2xl w-[90vw] max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div className="flex items-center gap-2">
                <ListOrdered className="w-5 h-5" />
                <h3 className="font-semibold">All Areas — Ranking</h3>
              </div>
              <button onClick={() => setShowRanking(false)} className="p-1 rounded hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-auto" style={{ maxHeight: "70vh" }}>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600">
                    <th className="py-1 pr-2">#</th>
                    <th className="py-1 pr-2">Area</th>
                    <th className="py-1 pr-2">City</th>
                    <th className="py-1 pr-2 text-right">Median (kg)</th>
                  </tr>
                </thead>
                <tbody>
                  {adjustedMarkers
                    .slice()
                    .sort((a, b) => b.median - a.median)
                    .map((m, idx) => (
                      <tr key={`rank-${m.area}`} className="border-t hover:bg-gray-50 cursor-pointer" onClick={() => { setShowRanking(false); openAreaFromList(m); }}>
                        <td className="py-1 pr-2">{idx + 1}</td>
                        <td className="py-1 pr-2">{m.area}</td>
                        <td className="py-1 pr-2 capitalize">{m.city}</td>
                        <td className="py-1 pr-2 text-right">{m.median.toFixed(1)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t flex justify-end">
              <Button variant="outline" onClick={() => setShowRanking(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      <ChatBot currentPage="map" />
    </div>
  );
}
