import { useState, useEffect, useMemo, useCallback } from "react";
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ChartContainer, ChartTooltip, ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell,
  LineChart, Line, AreaChart, Area,
} from "recharts";
import {
  TrendingUp, TrendingDown, Building2, DollarSign, PieChart as PieChartIcon,
  BarChart3, Target, ShieldCheck, ArrowUpRight, MapPin, Plus, Eye, RefreshCw, Loader2,
} from "lucide-react";
import { format, subMonths } from "date-fns";

const COLORS = [
  "hsl(var(--primary))", "hsl(var(--accent))", "hsl(210, 70%, 55%)",
  "hsl(150, 50%, 45%)", "hsl(30, 80%, 55%)", "hsl(270, 50%, 55%)",
  "hsl(0, 60%, 55%)", "hsl(180, 50%, 45%)",
];

const marketTrendsConfig = {
  apartment: { label: "Apartment", color: "hsl(210, 70%, 55%)" },
  villa: { label: "Villa", color: "hsl(150, 50%, 45%)" },
  townhouse: { label: "Townhouse", color: "hsl(30, 80%, 55%)" },
  penthouse: { label: "Penthouse", color: "hsl(270, 50%, 55%)" },
  commercial: { label: "Commercial", color: "hsl(0, 60%, 55%)" },
  studio: { label: "Studio", color: "hsl(180, 50%, 45%)" },
  office: { label: "Office", color: "hsl(var(--primary))" },
  land: { label: "Land", color: "hsl(var(--accent))" },
};

const priceIndexConfig = {
  index: { label: "Price Index", color: "hsl(var(--primary))" },
};

type PropertyRow = {
  id: string; title: string; property_type: string; price: number;
  roi_estimate: number | null; rental_yield: number | null;
  city: string | null; location: string; status: string | null;
  created_at: string | null;
};

function computeMarketTrends(allProperties: PropertyRow[]) {
  const now = new Date();
  const months: { label: string; start: Date; end: Date }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = subMonths(now, i);
    months.push({
      label: format(d, "MMM"),
      start: new Date(d.getFullYear(), d.getMonth(), 1),
      end: new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59),
    });
  }

  const types = [...new Set(allProperties.map(p => p.property_type))];

  // ROI trends per month per type
  const roiTrends = months.map(m => {
    const row: Record<string, any> = { month: m.label };
    types.forEach(t => {
      const props = allProperties.filter(p =>
        p.property_type === t && p.roi_estimate != null &&
        new Date(p.created_at || "") <= m.end
      );
      row[t] = props.length > 0
        ? Math.round((props.reduce((s, p) => s + (p.roi_estimate || 0), 0) / props.length) * 10) / 10
        : null;
    });
    return row;
  });

  // Price index (average price relative to first month)
  let basePrice = 0;
  const priceIndex = months.map((m, i) => {
    const props = allProperties.filter(p => new Date(p.created_at || "") <= m.end);
    const avgPrice = props.length > 0
      ? props.reduce((s, p) => s + p.price, 0) / props.length : 0;
    if (i === 0) basePrice = avgPrice || 1;
    return { month: m.label, index: Math.round((avgPrice / basePrice) * 1000) / 10 };
  });

  // Summary cards: latest month avg ROI per type vs previous month
  const summaryCards = types
    .filter(t => allProperties.some(p => p.property_type === t && p.roi_estimate != null))
    .map(t => {
      const latest = roiTrends[roiTrends.length - 1]?.[t];
      const prev = roiTrends[roiTrends.length - 2]?.[t];
      const diff = latest != null && prev != null ? Math.round((latest - prev) * 10) / 10 : 0;
      return {
        type: t.charAt(0).toUpperCase() + t.slice(1),
        roi: latest != null ? `${latest}%` : "N/A",
        trend: diff >= 0 ? `+${diff}%` : `${diff}%`,
        up: diff >= 0,
      };
    })
    .sort((a, b) => parseFloat(b.roi) - parseFloat(a.roi))
    .slice(0, 4);

  return { roiTrends, priceIndex, summaryCards, types };
}

export default function Portfolio() {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [investorPrefs, setInvestorPrefs] = useState<any>(null);
  const [allProperties, setAllProperties] = useState<PropertyRow[]>([]);
  const [marketLoading, setMarketLoading] = useState(true);
  const [trendType, setTrendType] = useState<string>("all");

  const { roiTrends, priceIndex, summaryCards, types: marketTypes } = useMemo(
    () => computeMarketTrends(allProperties), [allProperties]
  );

  const totalValue = properties.reduce((sum, p) => sum + (p.price || 0), 0);
  const avgROI = properties.length > 0
    ? properties.reduce((sum, p) => sum + (p.roi_estimate || 0), 0) / properties.length : 0;
  const avgYield = properties.length > 0
    ? properties.reduce((sum, p) => sum + (p.rental_yield || 0), 0) / properties.length : 0;

  const typeDistribution = useMemo(() => {
    const map: Record<string, { count: number; value: number }> = {};
    properties.forEach(p => {
      const t = p.property_type || "other";
      if (!map[t]) map[t] = { count: 0, value: 0 };
      map[t].count++;
      map[t].value += p.price || 0;
    });
    return Object.entries(map).map(([type, data]) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1), value: data.value, count: data.count,
    }));
  }, [properties]);

  const typeChartConfig = useMemo(() => {
    const cfg: Record<string, { label: string; color: string }> = {};
    typeDistribution.forEach((item, i) => {
      cfg[item.name] = { label: item.name, color: COLORS[i % COLORS.length] };
    });
    return cfg;
  }, [typeDistribution]);

  const locationDistribution = useMemo(() => {
    const map: Record<string, number> = {};
    properties.forEach(p => {
      const loc = p.city || p.location || "Unknown";
      map[loc] = (map[loc] || 0) + 1;
    });
    return Object.entries(map).map(([loc, count]) => ({ name: loc, count }));
  }, [properties]);

  const locationChartConfig = useMemo(() => {
    const cfg: Record<string, { label: string; color: string }> = {};
    locationDistribution.forEach((item, i) => {
      cfg[item.name] = { label: item.name, color: COLORS[i % COLORS.length] };
    });
    return cfg;
  }, [locationDistribution]);

  const roiData = useMemo(() =>
    properties.filter(p => p.roi_estimate).map(p => ({
      name: p.title?.length > 20 ? p.title.slice(0, 18) + "…" : p.title,
      roi: p.roi_estimate, yield: p.rental_yield || 0,
    })), [properties]);

  const roiChartConfig = {
    roi: { label: "ROI %", color: "hsl(var(--primary))" },
    yield: { label: "Rental Yield %", color: "hsl(150, 50%, 45%)" },
  };

  // Load all properties for market trends
  const loadAllProperties = useCallback(async () => {
    setMarketLoading(true);
    const { data } = await supabase
      .from("properties")
      .select("id, title, property_type, price, roi_estimate, rental_yield, city, location, status, created_at")
      .order("created_at", { ascending: true });
    if (data) setAllProperties(data);
    setMarketLoading(false);
  }, []);

  useEffect(() => {
    loadAllProperties();
  }, [loadAllProperties]);

  // Realtime subscription for properties changes
  useEffect(() => {
    const channel = supabase
      .channel("portfolio-properties")
      .on("postgres_changes", { event: "*", schema: "public", table: "properties" }, () => {
        loadAllProperties();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [loadAllProperties]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data: prefs } = await supabase
        .from("investor_preferences").select("*").eq("user_id", user.id).maybeSingle();
      if (prefs) setInvestorPrefs(prefs);
      const { data: favs } = await supabase
        .from("favorites").select("property_id").eq("user_id", user.id);
      if (favs && favs.length > 0) {
        const ids = favs.map(f => f.property_id);
        const { data: props } = await supabase
          .from("properties").select("*").in("id", ids);
        if (props) { setProperties(props); setFavorites(favs); }
      }
    };
    load();
  }, [user]);

  if (authLoading) return null;
  if (!user) { navigate("/auth"); return null; }

  const formatCurrency = (v: number) =>
    v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M AED` : `${(v / 1_000).toFixed(0)}K AED`;

  const filteredTrends = trendType === "all"
    ? marketTypes
    : [trendType];

  return (
    <Layout>
      <div className="pt-24 pb-16 min-h-screen bg-background">
        <div className="container mx-auto px-4">
          <BreadcrumbNav items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Portfolio Tracker" }]} />

          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <PieChartIcon className="h-8 w-8 text-primary" />
              <div>
                <h1 className="font-display text-3xl font-bold text-foreground">
                  Investment Portfolio
                </h1>
                <p className="text-muted-foreground">Track your properties, returns & market trends</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate("/properties")} className="gap-2">
                <Plus className="h-4 w-4" /> Add Properties
              </Button>
              <Button variant="gold" onClick={() => navigate("/chat")} className="gap-2">
                <Target className="h-4 w-4" /> AI Advisor
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-2">
                <Building2 className="h-5 w-5 text-primary" />
                <Badge variant="outline" className="text-xs">Portfolio</Badge>
              </div>
              <p className="text-2xl font-bold text-foreground">{properties.length}</p>
              <p className="text-sm text-muted-foreground">Properties</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <Badge variant="outline" className="text-xs">Value</Badge>
              </div>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(totalValue)}</p>
              <p className="text-sm text-muted-foreground">Total Value</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                {avgROI > 0 ? <ArrowUpRight className="h-4 w-4 text-green-500" /> : null}
              </div>
              <p className="text-2xl font-bold text-foreground">{avgROI.toFixed(1)}%</p>
              <p className="text-sm text-muted-foreground">Avg ROI</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                {avgYield > 0 ? <ArrowUpRight className="h-4 w-4 text-green-500" /> : null}
              </div>
              <p className="text-2xl font-bold text-foreground">{avgYield.toFixed(1)}%</p>
              <p className="text-sm text-muted-foreground">Avg Rental Yield</p>
            </div>
          </div>

          {/* Investor Preferences Summary */}
          {investorPrefs && (
            <div className="bg-card border border-border rounded-xl p-5 mb-8">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">Your Investment Profile</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{investorPrefs.risk_tolerance || "Moderate"} Risk</Badge>
                <Badge variant="outline">{investorPrefs.investment_horizon || "Flexible"}</Badge>
                {investorPrefs.target_roi_min && <Badge variant="outline">{investorPrefs.target_roi_min}%+ ROI Target</Badge>}
                {investorPrefs.preferred_locations?.map((l: string) => (
                  <Badge key={l} variant="secondary" className="gap-1"><MapPin className="h-3 w-3" />{l}</Badge>
                ))}
              </div>
            </div>
          )}

          {properties.length === 0 ? (
            <div className="text-center py-20 bg-card border border-border rounded-2xl">
              <Building2 className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">No Properties in Portfolio</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Start building your portfolio by saving properties you're interested in. Your favorited properties will appear here for tracking.
              </p>
              <Button variant="gold" onClick={() => navigate("/properties")} className="gap-2">
                <Plus className="h-4 w-4" /> Browse Properties
              </Button>
            </div>
          ) : (
            <>
              {/* Charts Row */}
              <div className="grid lg:grid-cols-2 gap-6 mb-8">
                {/* Portfolio by Type */}
                <div className="bg-card border border-border rounded-xl p-5">
                  <h3 className="font-semibold text-foreground mb-4">Portfolio by Type</h3>
                  <ChartContainer config={typeChartConfig} className="h-[250px] w-full">
                    <PieChart>
                      <Pie
                        data={typeDistribution}
                        cx="50%" cy="50%"
                        outerRadius={90}
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {typeDistribution.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ChartContainer>
                </div>

                {/* ROI by Property */}
                <div className="bg-card border border-border rounded-xl p-5">
                  <h3 className="font-semibold text-foreground mb-4">ROI & Yield by Property</h3>
                  {roiData.length > 0 ? (
                    <ChartContainer config={roiChartConfig} className="h-[250px] w-full">
                      <BarChart data={roiData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="name" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                        <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="roi" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="yield" fill="hsl(150, 50%, 45%)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ChartContainer>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-16">No ROI data available</p>
                  )}
                </div>
              </div>

              {/* Location Distribution */}
              <div className="bg-card border border-border rounded-xl p-5 mb-8">
                <h3 className="font-semibold text-foreground mb-4">Portfolio by Location</h3>
                <ChartContainer config={locationChartConfig} className="h-[250px] w-full">
                  <BarChart data={locationDistribution}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {locationDistribution.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </div>

              {/* Properties Table */}
              <div className="bg-card border border-border rounded-xl overflow-hidden mb-8">
                <div className="p-5 border-b border-border">
                  <h3 className="font-semibold text-foreground">Your Properties</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left p-3 font-medium text-muted-foreground">Property</th>
                        <th className="text-left p-3 font-medium text-muted-foreground">Type</th>
                        <th className="text-left p-3 font-medium text-muted-foreground">Location</th>
                        <th className="text-right p-3 font-medium text-muted-foreground">Price</th>
                        <th className="text-right p-3 font-medium text-muted-foreground">ROI</th>
                        <th className="text-right p-3 font-medium text-muted-foreground">Yield</th>
                        <th className="text-center p-3 font-medium text-muted-foreground">Status</th>
                        <th className="p-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {properties.map(p => (
                        <tr key={p.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                          <td className="p-3 font-medium text-foreground max-w-[200px] truncate">{p.title}</td>
                          <td className="p-3 capitalize text-muted-foreground">{p.property_type}</td>
                          <td className="p-3 text-muted-foreground">{p.city || p.location}</td>
                          <td className="p-3 text-right font-medium text-foreground">{formatCurrency(p.price)}</td>
                          <td className="p-3 text-right">
                            {p.roi_estimate ? (
                              <span className="text-green-600 font-medium">{p.roi_estimate}%</span>
                            ) : <span className="text-muted-foreground">—</span>}
                          </td>
                          <td className="p-3 text-right">
                            {p.rental_yield ? (
                              <span className="text-primary font-medium">{p.rental_yield}%</span>
                            ) : <span className="text-muted-foreground">—</span>}
                          </td>
                          <td className="p-3 text-center">
                            <Badge variant={p.status === "available" ? "default" : "secondary"} className="text-xs capitalize">
                              {p.status}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <Button variant="ghost" size="sm" onClick={() => navigate(`/property/${p.id}`)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          <div className="space-y-6 mt-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-6 w-6 text-primary" />
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground">Market Trends</h2>
                  <p className="text-xs text-muted-foreground">Live data from {allProperties.length} listings</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={loadAllProperties} className="gap-1" disabled={marketLoading}>
                  {marketLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  <span className="hidden sm:inline">Refresh</span>
                </Button>
                <Select value={trendType} onValueChange={setTrendType}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Property Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {marketTypes.map(t => (
                      <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* ROI Trends by Property Type */}
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="font-semibold text-foreground mb-1">ROI Trends by Property Type</h3>
                <p className="text-xs text-muted-foreground mb-4">Average ROI % over the last 6 months</p>
                <ChartContainer config={marketTrendsConfig} className="h-[280px] w-full">
                  <LineChart data={roiTrends}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    {filteredTrends.map(type => (
                      <Line
                        key={type}
                        type="monotone"
                        dataKey={type}
                        stroke={marketTrendsConfig[type as keyof typeof marketTrendsConfig]?.color}
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    ))}
                  </LineChart>
                </ChartContainer>
              </div>

              {/* Price Index */}
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="font-semibold text-foreground mb-1">Dubai Property Price Index</h3>
                <p className="text-xs text-muted-foreground mb-4">Base 100 = October 2025</p>
                <ChartContainer config={priceIndexConfig} className="h-[280px] w-full">
                  <AreaChart data={priceIndex}>
                    <defs>
                      <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} domain={[95, 115]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area type="monotone" dataKey="index" stroke="hsl(var(--primary))" fill="url(#priceGradient)" strokeWidth={2} />
                  </AreaChart>
                </ChartContainer>
              </div>
            </div>

            {/* Market Summary Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {marketLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-xl" />
                ))
              ) : summaryCards.length > 0 ? (
                summaryCards.map(item => (
                  <div key={item.type} className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">{item.type}</span>
                      {item.up ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                    <p className="text-lg font-bold text-foreground">{item.roi}</p>
                    <p className={`text-xs ${item.up ? "text-green-600" : "text-destructive"}`}>{item.trend} vs last month</p>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-muted-foreground text-sm">
                  No ROI data available yet. Add properties with ROI estimates to see trends.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
