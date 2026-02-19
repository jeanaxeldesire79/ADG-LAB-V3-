import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Copy, Download, ExternalLink, Globe, ListFilter, Map, Search, Shield, Table, ChartLine, RefreshCcw, Info, Filter } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, Legend, ResponsiveContainer } from "recharts";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";

const ECOWAS_ISO3 = [
  "BEN","BFA","CIV","CPV","GMB","GHA","GIN","GNB","LBR","MLI","NER","NGA","SEN","SLE","TGO"
];

const AFRICA_ISO3 = [
  "DZA","AGO","BEN","BWA","BFA","BDI","CMR","CPV","CAF","TCD","COM","COG","CIV","COD","DJI","EGY","GNQ","ERI","SWZ","ETH","GAB","GMB","GHA","GIN","GNB","KEN","LSO","LBR","LBY","MDG","MWI","MLI","MRT","MUS","MAR","MOZ","NAM","NER","NGA","RWA","STP","SEN","SYC","SLE","SOM","ZAF","SSD","SDN","TZA","TGO","TUN","UGA","ZMB","ZWE"
];

const INDICATORS: Record<string, Array<{ code: string; name: string; src: string; dataset?: string }>> = {
  Economy: [
    { code: "NY.GDP.MKTP.CD", name: "GDP (current US$)", src: "WB" },
    { code: "NY.GDP.MKTP.KD.ZG", name: "GDP growth (annual %)", src: "WB" },
    { code: "FP.CPI.TOTL.ZG", name: "Inflation, consumer prices (annual %)", src: "WB" },
    { code: "NE.EXP.GNFS.ZS", name: "Exports of goods & services (% of GDP)", src: "WB" },
    { code: "NE.IMP.GNFS.ZS", name: "Imports of goods & services (% of GDP)", src: "WB" },
  ],
  Demography: [
    { code: "SP.POP.TOTL", name: "Population, total", src: "WB" },
    { code: "SP.DYN.LE00.IN", name: "Life expectancy at birth (years)", src: "WB" },
    { code: "SE.ADT.LITR.ZS", name: "Adult literacy rate (% ages 15+)", src: "WB" },
  ],
  Energy: [
    { code: "EG.ELC.ACCS.ZS", name: "Access to electricity (% of population)", src: "WB" },
    { code: "EG.FEC.RNEW.ZS", name: "Renewable energy consumption (% TFC)", src: "WB" },
    { code: "EG.USE.ELEC.KH.PC", name: "Electricity use (kWh per capita)", src: "WB" },
  ],
  GovernanceSecurity: [
    { code: "SI.POV.GINI", name: "Gini index", src: "WB" },
    { code: "SL.UEM.TOTL.ZS", name: "Unemployment, total (% of labor force)", src: "WB" },
    { code: "IFS:PCPI_IX", name: "IMF CPI index (IFS) – example", src: "IMF", dataset: "IFS" },
    { code: "DAC:ODA_NET", name: "OECD ODA Net (DAC) – example", src: "OECD", dataset: "TIDC" },
  ],
};

const CACHE_TTL_MS = 1000 * 60 * 60;

function cacheGet(key: string) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { t, v } = JSON.parse(raw);
    if (Date.now() - t > CACHE_TTL_MS) return null;
    return v;
  } catch {
    return null;
  }
}

function cacheSet(key: string, v: any) {
  try { localStorage.setItem(key, JSON.stringify({ t: Date.now(), v })); } catch {}
}

function downloadAsCSV(filename: string, rows: Record<string, any>[]) {
  if (!rows?.length) return;
  const header = Array.from(new Set(rows.flatMap(r => Object.keys(r))));
  const csv = [header.join(","), ...rows.map(r => header.map(h => JSON.stringify(r[h] ?? "")).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
}

function downloadAsJSON(filename: string, data: any) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
}

async function fetchWorldBank(countryIso3: string, indicator: string) {
  const url = `https://api.worldbank.org/v2/country/${countryIso3}/indicator/${indicator}?format=json&per_page=20000`;
  const ckey = `WB:${countryIso3}:${indicator}`;
  const cached = cacheGet(ckey); if (cached) return cached;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`WB ${res.status}`);
  const json = await res.json();
  const rows = (json?.[1] || []).map((d: any) => ({
    source: "WB",
    country: d.country?.id || countryIso3,
    countryName: d.country?.value,
    indicator,
    date: +d.date,
    value: d.value,
  })).filter((r: any) => r.date && r.value !== null);
  cacheSet(ckey, rows);
  return rows;
}

async function fetchIMF(dataset: string, key: string) {
  const base = "https://dataservices.imf.org/REST/SDMX_JSON.sdmx/CompactData";
  const url = `${base}/${dataset}/${encodeURIComponent(key)}?json=true`;
  const ckey = `IMF:${dataset}:${key}`;
  const cached = cacheGet(ckey); if (cached) return cached;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`IMF ${res.status}`);
  const json = await res.json();
  const series = json?.CompactData?.DataSet?.Series;
  const list = Array.isArray(series) ? series : series ? [series] : [];
  const rows: any[] = [];
  for (const s of list) {
    const country = s?.REF_AREA || s?.REF_AREA_CODE || s?.REF_AREA_ID || "";
    const indicator = s?.INDICATOR || s?.INDICATOR_ID || s?.SERIES || "";
    const obs = Array.isArray(s?.Obs) ? s.Obs : s?.Obs ? [s.Obs] : [];
    for (const o of obs) {
      const dateStr = (o && (o["@TIME_PERIOD"] ?? o["TIME_PERIOD"])) as string | number | undefined;
      const valStr = (o && (o["@OBS_VALUE"] ?? o["OBS_VALUE"])) as string | number | undefined;
      const date = Number(dateStr);
      const value = valStr != null ? Number(valStr) : null;
      if (!Number.isNaN(date) && value != null) {
        rows.push({ source: "IMF", country, indicator, date, value });
      }
    }
  }
  cacheSet(ckey, rows);
  return rows;
}

async function fetchOECD(dataset: string, keyPath: string) {
  const base = "https://stats.oecd.org/sdmx-json/data";
  const url = `${base}/${dataset}/${encodeURIComponent(keyPath)}?contentType=json&detail=code`;
  const ckey = `OECD:${dataset}:${keyPath}`;
  const cached = cacheGet(ckey); if (cached) return cached;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`OECD ${res.status}`);
  const json = await res.json();
  const dims = json?.structure?.dimensions?.observation || [];
  const timePos = dims.findIndex((d: any) => d.id?.toLowerCase() === "time");
  const seriesDims = json?.structure?.dimensions?.series || [];
  const dataSets = json?.dataSets?.[0]?.series || {};
  const rows: any[] = [];
  for (const sKey of Object.keys(dataSets)) {
    const series = dataSets[sKey];
    const obs = series?.observations || {};
    const sParts = sKey.split(":");
    const meta: Record<string,string> = {};
    seriesDims.forEach((d: any, i: number) => {
      const code = dimsFromIndex(json, d, sParts[i]);
      meta[d.id] = code?.label || sParts[i];
    });
    for (const oKey of Object.keys(obs)) {
      const timeIdx = Number(oKey);
      const date = indexToTime(dims[timePos], timeIdx);
      const value = obs[oKey]?.[0];
      if (date && value != null) rows.push({ source: "OECD", date: Number(date), value: Number(value), ...meta });
    }
  }
  cacheSet(ckey, rows);
  return rows;
}

function dimsFromIndex(json: any, d: any, idx: string) {
  const item = d.values?.[Number(idx)];
  if (!item) return { code: idx, label: idx };
  const id = item.id;
  const label = item.name || item.id;
  return { code: id, label };
}

function indexToTime(d: any, idx: number) {
  const item = d?.values?.[idx];
  return item?.id || item?.name;
}

function mergeSeriesToWide(rows: Array<{country?: string; countryName?: string; indicator?: string; date: number; value: number; source: string}>) {
  const byKey: Record<string, any> = {};
  for (const r of rows) {
    const key = `${r.country || ""}|${r.date}`;
    if (!byKey[key]) byKey[key] = { date: r.date, country: r.country, countryName: r.countryName };
    const col = `${r.source}:${r.indicator}`;
    byKey[key][col] = r.value;
  }
  return Object.values(byKey).sort((a: any, b: any) => a.date - b.date);
}

export default function AfricaDataApp() {
  const [showIntro, setShowIntro] = useState(true);
  const [metabaseUrl, setMetabaseUrl] = useState("http://localhost:3001/public/dashboard/3e2e490c-f3ba-4264-854d-115d68a85883");
  const [qgisExportPath, setQgisExportPath] = useState("assets/exports/qgis2web_2025_08_05-01_39_21_111540/index.html");
  const [region, setRegion] = useState<"ECOWAS"|"AFRICA">("ECOWAS");
  const [countries, setCountries] = useState<string[]>(ECOWAS_ISO3);
  const [category, setCategory] = useState<keyof typeof INDICATORS>("Economy");
  const [selected, setSelected] = useState<string[]>([INDICATORS.Economy[0].code]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<any[]>([]);
  const [wide, setWide] = useState<any[]>([]);

  useEffect(() => {
    setCountries(region === "ECOWAS" ? ECOWAS_ISO3 : AFRICA_ISO3);
  }, [region]);

  useEffect(() => {
    const first = INDICATORS[category]?.[0]?.code;
    if (first) setSelected([first]);
  }, [category]);

  useEffect(() => {
    runSelfTests();
  }, []);

  const indicatorOptions = INDICATORS[category];
  const canFetch = countries.length && selected.length;

  async function runFetch() {
    setLoading(true); setError(null);
    try {
      const all: any[] = [];
      for (const c of countries.slice(0, 10)) {
        for (const ind of selected) {
          const [prefix, code] = ind.includes(":") ? ind.split(":") as [string,string] : ["WB", ind];
          if (prefix === "WB") {
            const wb = await fetchWorldBank(c, code);
            all.push(...wb);
          } else if (prefix === "IMF") {
            const pack = Object.values(INDICATORS).flat().find((p: any) => p.code === ind) as any;
            const dataset = pack?.dataset || "IFS";
            const key = `A.${c}.${code}.A`;
            const imf = await fetchIMF(dataset, key);
            all.push(...imf.map(r => ({ ...r, country: c, indicator: code })));
          } else if (prefix === "OECD") {
            const pack = Object.values(INDICATORS).flat().find((p: any) => p.code === ind) as any;
            const dataset = pack?.dataset || "TIDC";
            const keyPath = `${c}.A...`;
            const oecd = await fetchOECD(dataset, keyPath);
            all.push(...oecd.map(r => ({ ...r, country: c, indicator: code })));
          }
        }
      }
      const tidy = all.filter(r => r?.date && r?.value != null);
      const wideRows = mergeSeriesToWide(tidy);
      setRows(tidy);
      setWide(wideRows);
    } catch (e: any) {
      setError(e?.message || "Fetch failed");
      setRows([]); setWide([]);
    } finally {
      setLoading(false);
    }
  }

  const chartData = useMemo(() => {
    if (!wide.length || !selected.length) return [] as Array<{date:number;country:string;value:number}>;
    const ind = selected[0];
    const col = `WB:${ind}`;
    return wide
      .filter((r: any) => r[col] != null)
      .map((r: any) => ({ date: r.date, country: r.country, value: r[col] }));
  }, [wide, selected]);

  const regionLabel = region === "ECOWAS" ? "ECOWAS" : "Africa";
  const metabaseEmbed = `<iframe src="${metabaseUrl}" frameborder="0" width="100%" height="720" allowtransparency title="Metabase Dashboard"></iframe>`;
  const qgisEmbed = `<iframe src="${qgisExportPath}" width="100%" height="720" title="QGIS Map"></iframe>`;

  return (
    <>
      {showIntro && <IntroOverlay onDone={() => setShowIntro(false)} />}

      {!showIntro && (
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">AxelDevLab – Africa/ECOWAS Data Portal</h1>
          <Badge className="rounded-full">Beta</Badge>
        </div>

        <Tabs defaultValue="explorer">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="explorer"><ChartLine className="w-4 h-4 mr-2"/>Explorer</TabsTrigger>
            <TabsTrigger value="maps"><Map className="w-4 h-4 mr-2"/>Maps</TabsTrigger>
            <TabsTrigger value="dashboards"><Table className="w-4 h-4 mr-2"/>Dashboards</TabsTrigger>
            <TabsTrigger value="api"><Globe className="w-4 h-4 mr-2"/>APIs</TabsTrigger>
            <TabsTrigger value="datasets"><ListFilter className="w-4 h-4 mr-2"/>Datasets</TabsTrigger>
            <TabsTrigger value="requests"><Shield className="w-4 h-4 mr-2"/>Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="explorer" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{regionLabel} Country‑level Explorer</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={runFetch} disabled={!canFetch || loading}>
                      <RefreshCcw className="w-4 h-4 mr-2"/>{loading ? "Loading..." : "Fetch"}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => downloadAsCSV(`${regionLabel.toLowerCase()}_${category}.csv`, wide)} disabled={!wide.length}>
                      <Download className="w-4 h-4 mr-1"/>CSV
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => downloadAsJSON(`${regionLabel.toLowerCase()}_${category}.json`, wide)} disabled={!wide.length}>
                      <Download className="w-4 h-4 mr-1"/>JSON
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label>Region</Label>
                    <Select value={region} onValueChange={(v: any) => setRegion(v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ECOWAS">ECOWAS</SelectItem>
                        <SelectItem value="AFRICA">Africa (AU)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label>Countries ({countries.length})</Label>
                    <div className="flex gap-2 flex-wrap">
                      <Button variant="outline" size="sm" onClick={() => setCountries(ECOWAS_ISO3)}>ECOWAS preset</Button>
                      <Button variant="outline" size="sm" onClick={() => setCountries(AFRICA_ISO3)}>Africa preset</Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="secondary" size="sm"><Filter className="w-4 h-4 mr-2"/>Custom</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Select ISO3 countries</DialogTitle>
                          </DialogHeader>
                          <CountryPicker value={countries} onChange={setCountries} />
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Select value={category} onValueChange={(v: any) => setCategory(v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.keys(INDICATORS).map(k => (
                          <SelectItem key={k} value={k}>{k}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <Label>Indicators</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {indicatorOptions.map((opt) => (
                        <Button
                          key={opt.code}
                          size="sm"
                          variant={selected.includes(opt.code) ? "default" : "outline"}
                          onClick={() => setSelected(s => s.includes(opt.code) ? s.filter(x => x !== opt.code) : [...s, opt.code])}
                          title={`${opt.name} – ${opt.src}`}
                        >
                          {opt.src}:{opt.code.split(":").pop()}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>Help</Label>
                    <div className="text-xs text-gray-600 bg-gray-50 rounded p-3">
                      <p className="mb-2 flex items-center"><Info className="w-3.5 h-3.5 mr-2"/>WB indicators fetch yearly values by default.</p>
                      <p className="mb-2">IMF/OECD connectors are scaffolded – adjust dataset/key for specific series.</p>
                      <p>Use <strong>Export</strong> to download the merged tidy table.</p>
                    </div>
                  </div>
                </div>

                {error && <div className="text-sm text-red-600">{error}</div>}

                <div className="h-80 w-full border rounded-lg p-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={aggregateForChart(chartData)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <RTooltip />
                      <Legend />
                      {useTopCountries(chartData, 5).map((c) => (
                        <Line key={c} type="monotone" dataKey={c} dot={false} />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="preview">
                    <AccordionTrigger>Preview merged rows ({wide.length.toLocaleString()})</AccordionTrigger>
                    <AccordionContent>
                      <div className="overflow-auto border rounded-lg text-xs">
                        <table className="min-w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              {wide[0] ? Object.keys(wide[0]).slice(0, 12).map(k => (
                                <th key={k} className="text-left px-3 py-2 font-semibold border-b">{k}</th>
                              )) : <th className="px-3 py-2">No data</th>}
                            </tr>
                          </thead>
                          <tbody>
                            {wide.slice(0, 200).map((r, i) => (
                              <tr key={i} className="odd:bg-white even:bg-gray-50">
                                {Object.keys(wide[0] || {}).slice(0, 12).map(k => (
                                  <td key={k} className="px-3 py-2 border-b align-top">{String((r as any)[k] ?? "")}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="maps" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Interactive Map (QGIS2Web export)</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(qgisEmbed)}>
                          <Copy className="w-4 h-4 mr-2"/>Copy embed
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Copy iframe snippet for your exported map</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <div className="rounded-xl overflow-hidden border bg-white">
                      <iframe src={qgisExportPath} width="100%" height="640" title="QGIS Map" />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Keep exports under <code>assets/exports/</code> for stable relative paths.</p>
                  </div>
                  <div className="col-span-1 space-y-3">
                    <Label htmlFor="qgis-path">Export Path</Label>
                    <Input id="qgis-path" value={qgisExportPath} onChange={e => setQgisExportPath(e.target.value)} placeholder="assets/exports/<export-folder>/index.html" />
                    <Button asChild variant="secondary">
                      <a href={qgisExportPath} target="_blank" rel="noreferrer"><ExternalLink className="w-4 h-4 mr-2"/>Open map</a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dashboards" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Live Dashboards (Metabase / Superset)</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(metabaseEmbed)}>
                          <Copy className="w-4 h-4 mr-2"/>
                          Copy embed
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Copy iframe snippet you can paste in any page</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <div className="rounded-xl overflow-hidden border bg-white">
                      <iframe src={metabaseUrl} width="100%" height="640" title="Dashboard" />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Ensure your analytics server is reachable (e.g., Metabase at <code>localhost:3001</code> or public URL).</p>
                  </div>
                  <div className="col-span-1 space-y-3">
                    <Label htmlFor="mb-url">Embed URL</Label>
                    <Input id="mb-url" value={metabaseUrl} onChange={e => setMetabaseUrl(e.target.value)} placeholder="https://analytics.example.com/public/dashboard/..." />
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="secondary"><ExternalLink className="w-4 h-4 mr-2"/>Open in new tab</Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl">
                        <DialogHeader>
                          <DialogTitle>Dashboard</DialogTitle>
                          <DialogDescription>Open your dashboard in a larger view.</DialogDescription>
                        </DialogHeader>
                        <div className="rounded-lg overflow-hidden border">
                          <iframe src={metabaseUrl} width="100%" height="600" title="Dashboard Expanded" />
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>API Connectors & How‑to</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-gray-700">
                <Accordion type="multiple" className="w-full">
                  <AccordionItem value="wb">
                    <AccordionTrigger>World Bank (country → indicator)</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-2">Endpoint pattern: <code>https://api.worldbank.org/v2/country/ISO3/indicator/CODE?format=json</code></p>
                      <p>Examples: <code>SP.POP.TOTL</code>, <code>NY.GDP.MKTP.CD</code>, <code>EG.ELC.ACCS.ZS</code></p>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="imf">
                    <AccordionTrigger>IMF SDMX JSON (IFS/WEO)</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-2">Pattern: <code>https://dataservices.imf.org/REST/SDMX_JSON.sdmx/CompactData/&lt;DATASET&gt;/&lt;KEY&gt;?json=true</code></p>
                      <p>Key example: <code>A.CIV.PCPI_IX.A</code> (freq.country.series.attribute)</p>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="oecd">
                    <AccordionTrigger>OECD SDMX JSON (DAC/CRS or National Accounts)</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-2">Pattern: <code>https://stats.oecd.org/sdmx-json/data/&lt;DATASET&gt;/&lt;KEYPATH&gt;?contentType=json</code></p>
                      <p>Use for ODA or partner‑country series where available.</p>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="afdb">
                    <AccordionTrigger>AfDB (African Development Bank) – scaffold</AccordionTrigger>
                    <AccordionContent>
                      <p>Wire your AfDB key and endpoints here when ready. This UI is prepared to merge additional sources seamlessly.</p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <SupabaseSection />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="datasets" className="mt-6">
            <StaticCatalog />
          </TabsContent>

          <TabsContent value="requests" className="mt-6">
            <RequestsForm />
          </TabsContent>
        </Tabs>

        <div className="mt-10 text-xs text-gray-500">
          <p>© 2025 Jean-Axel Tohougbé | AxelDevLab · React, Tailwind, shadcn/ui, Recharts. Africa/ECOWAS‑focused API integrator.</p>
        </div>
      </div>
      )}
    </>
  );
}

function IntroOverlay({ onDone }: { onDone: () => void }) {
  const [fade, setFade] = useState(false);
  useEffect(() => {
    const t1 = setTimeout(() => setFade(true), 3700);
    const t2 = setTimeout(() => onDone(), 4200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div className={`fixed inset-0 z-[100] ${fade ? 'opacity-0 pointer-events-none' : 'opacity-100'} transition-opacity duration-500 bg-black`}>
      <Canvas camera={{ position: [0, 0, 3], fov: 45 }}>
        <ambientLight intensity={1.0} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <Stars radius={50} depth={20} count={1000} factor={4} fade />
        <SpinningGlobe />
        <AutoZoomToAfrica />
        <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
      </Canvas>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-white text-2xl md:text-4xl font-bold tracking-tight">AxelDevLab</h2>
          <p className="text-white/70 mt-2">Focusing on Africa & ECOWAS…</p>
        </div>
      </div>
    </div>
  );
}

function SpinningGlobe() {
  const ref = useRef<any>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.4;
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[1, 64, 64]} />
      <meshStandardMaterial color="#1e293b" roughness={1} metalness={0} />
    </mesh>
  );
}

function AutoZoomToAfrica() {
  const { camera } = useThree();
  const tRef = useRef(0);
  useFrame((_, delta) => {
    tRef.current += delta;
    const start = 2.2;
    const duration = 1.2;
    if (tRef.current < start) return;
    const t = Math.min(1, (tRef.current - start) / duration);
    const lat = 9 * Math.PI/180;
    const lon = 20 * Math.PI/180;
    const r = 3 - t * 1.5;
    const x = r * Math.cos(lat) * Math.cos(lon);
    const y = r * Math.sin(lat);
    const z = r * Math.cos(lat) * Math.sin(lon);
    camera.position.set(x, y, z);
    camera.lookAt(0,0,0);
  });
  return null;
}

function CountryPicker({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [text, setText] = useState(value.join(", "));
  useEffect(() => setText(value.join(", ")), [value]);
  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-600">Enter comma‑separated ISO3 codes (e.g., CIV, GHA, SEN). Presets available above.</p>
      <Textarea rows={4} value={text} onChange={(e) => setText(e.target.value)} />
      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={() => setText(ECOWAS_ISO3.join(", "))}>ECOWAS</Button>
        <Button variant="outline" onClick={() => setText(AFRICA_ISO3.join(", "))}>Africa</Button>
        <Button onClick={() => onChange(text.split(/[\,\s]+/).map(s => s.trim()).filter(Boolean))}>Apply</Button>
      </div>
    </div>
  );
}

function aggregateForChart(rows: Array<{date: number; country: string; value: number}>) {
  const byDate: Record<number, any> = {};
  for (const r of rows) {
    if (!byDate[r.date]) byDate[r.date] = { date: r.date };
    byDate[r.date][r.country] = r.value;
  }
  return Object.values(byDate).sort((a: any, b: any) => a.date - b.date);
}

function useTopCountries(rows: Array<{date: number; country: string; value: number}>, k = 5) {
  const latestByCountry: Record<string, number> = {};
  for (const r of rows) latestByCountry[r.country] = r.value;
  return Object.entries(latestByCountry)
    .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))
    .slice(0, k)
    .map(([c]) => c);
}

function StaticCatalog() {
  const INITIAL_DATASETS = [
    {
      id: "econ-indicators",
      title: "Economic Indicators",
      summary: "Quarterly GDP growth, unemployment, inflation across ECOWAS.",
      updated: "2025-08-01",
      topics: ["Economy", "Macro"],
      tags: ["GDP", "Inflation", "Unemployment"],
      sample: [
        { country: "CIV", quarter: "2025-Q1", gdp_growth: 6.2, unemployment: 3.6, inflation: 4.1 },
        { country: "GHA", quarter: "2025-Q1", gdp_growth: 3.1, unemployment: 4.9, inflation: 22.4 },
      ],
      url: "data/economic-indicators.csv",
    },
    {
      id: "energy-access",
      title: "Energy & Access",
      summary: "Access to electricity, renewables share, and consumption per capita.",
      updated: "2025-07-20",
      topics: ["Energy", "Infrastructure"],
      tags: ["Electricity", "Renewables"],
      sample: [
        { country: "CIV", year: 2023, access_pct: 75.2, renewables_pct: 39.5 },
        { country: "SEN", year: 2023, access_pct: 71.1, renewables_pct: 43.2 },
      ],
      url: "data/energy-access.csv",
    },
  ];

  const [searchTerm, setSearchTerm] = useState("");
  const [topicFilter, setTopicFilter] = useState<string | "all">("all");
  const [datasets] = useState(INITIAL_DATASETS);

  const topics = useMemo(() => {
    const set = new Set<string>();
    datasets.forEach(d => d.topics.forEach((t: string) => set.add(t)));
    return Array.from(set).sort();
  }, [datasets]);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return datasets.filter((d: any) => {
      const matchesTopic = topicFilter === "all" || d.topics.includes(topicFilter as string);
      const matchesTerm = !term || d.title.toLowerCase().includes(term) || d.summary.toLowerCase().includes(term) || d.tags.join(" ").toLowerCase().includes(term);
      return matchesTopic && matchesTerm;
    });
  }, [datasets, searchTerm, topicFilter]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dataset Catalog</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
            <Input className="pl-9" placeholder="Search datasets, tags, descriptions..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <Select value={topicFilter} onValueChange={(v) => setTopicFilter(v)}>
            <SelectTrigger className="w-full md:w-56">
              <SelectValue placeholder="Filter by topic" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All topics</SelectItem>
              {topics.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((ds: any) => (
            <Card key={ds.id} className="border hover:shadow-md transition">
              <CardHeader>
                <CardTitle className="text-lg">{ds.title}</CardTitle>
                <div className="flex flex-wrap gap-2 mt-2">
                  {ds.topics.map((t: string) => <Badge key={t} variant="secondary">{t}</Badge>)}
                  {ds.tags.map((t: string) => <Badge key={t} className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">#{t}</Badge>)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600">{ds.summary}</p>
                <div className="bg-gray-50 rounded p-3 text-xs overflow-x-auto">
                  <pre className="whitespace-pre-wrap">{JSON.stringify(ds.sample[0], null, 2)}</pre>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Updated: {ds.updated}</span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => downloadAsCSV(`${ds.id}.csv`, ds.sample)}>
                      <Download className="w-4 h-4 mr-1"/>CSV
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => downloadAsJSON(`${ds.id}.json`, ds.sample)}>
                      <Download className="w-4 h-4 mr-1"/>JSON
                    </Button>
                    <Button size="sm" asChild>
                      <a href={ds.url} download>Full CSV</a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function RequestsForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Feedback & Data Requests</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label htmlFor="name">Your name</Label>
          <Input id="name" placeholder="Jane Doe" />
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@example.com" />
          <Label htmlFor="topic">Topic</Label>
          <Select defaultValue="general">
            <SelectTrigger><SelectValue placeholder="Select"/></SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General feedback</SelectItem>
              <SelectItem value="dataset">Dataset request</SelectItem>
              <SelectItem value="bug">Bug report</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-3">
          <Label htmlFor="message">Message</Label>
          <Textarea id="message" rows={8} placeholder="Describe your request or idea..."/>
          <div className="flex gap-2">
            <Button asChild>
              <a href="mailto:t.jeanaxeldesire79@gmail.com?subject=AxelDevLab%20Data%20Portal%20Request">Send via Email</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="https://forms.gle/" target="_blank" rel="noreferrer">Open Form (Google/Formspree)</a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SupabaseSection() {
  const supabaseEnabled = Boolean((import.meta as any)?.env?.VITE_SUPABASE_URL && (import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY);
  if (!supabaseEnabled) {
    return (
      <div className="border rounded-lg p-4 mt-4">
        <h4 className="font-semibold mb-2">Supabase API Explorer (optional)</h4>
        <p className="text-sm text-gray-600 mb-2">Add these to your build env to enable:</p>
        <div className="bg-gray-50 rounded p-3 text-xs font-mono overflow-x-auto">
          <pre>{`VITE_SUPABASE_URL=https://YOUR-project.supabase.co\nVITE_SUPABASE_ANON_KEY=ey...`}</pre>
        </div>
      </div>
    );
  }
  return <SupabaseExplorer />;
}

function SupabaseExplorer() {
  const [client, setClient] = useState<any>(null);
  const [table, setTable] = useState<string>("");
  const [rows, setRows] = useState<any[]>([]);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { createClient } = await import("@supabase/supabase-js");
      const url = (import.meta as any).env.VITE_SUPABASE_URL as string;
      const anon = (import.meta as any).env.VITE_SUPABASE_ANON_KEY as string;
      setClient(createClient(url, anon));
    })();
  }, []);

  const runQuery = async () => {
    if (!client || !table) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await client.from(table).select("*").limit(limit);
      if (error) throw error;
      setRows(data || []);
    } catch (e: any) {
      setError(e?.message || "Unknown error");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 mt-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="md:col-span-2">
          <Label htmlFor="table">Table or view name</Label>
          <Input id="table" value={table} onChange={e => setTable(e.target.value)} placeholder="public.my_readonly_view" />
        </div>
        <div>
          <Label htmlFor="limit">Limit</Label>
          <Input id="limit" type="number" min={1} max={1000} value={limit} onChange={e => setLimit(parseInt(e.target.value || "10", 10))} />
        </div>
        <div className="flex items-end">
          <Button onClick={runQuery} disabled={!table || loading}>{loading ? "Running..." : "Run"}</Button>
        </div>
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}

      <div className="overflow-auto border rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {rows[0] ? Object.keys(rows[0]).map(k => (
                <th key={k} className="text-left px-3 py-2 font-semibold border-b">{k}</th>
              )) : <th className="px-3 py-2">No data</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="odd:bg-white even:bg-gray-50">
                {Object.keys(r).map(k => (
                  <td key={k} className="px-3 py-2 border-b align-top">{String(r[k])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={() => downloadAsCSV("query.csv", rows)} disabled={!rows.length}><Download className="w-4 h-4 mr-2"/>CSV</Button>
        <Button variant="outline" onClick={() => downloadAsJSON("query.json", rows)} disabled={!rows.length}><Download className="w-4 h-4 mr-2"/>JSON</Button>
      </div>
    </div>
  );
}

function runSelfTests() {
  const a = aggregateForChart([
    { date: 2020, country: "CIV", value: 1 },
    { date: 2020, country: "GHA", value: 2 },
    { date: 2021, country: "CIV", value: 3 }
  ]);
  console.assert(Array.isArray(a) && a.length === 2 && a[0].CIV === 1 && a[0].GHA === 2 && a[1].CIV === 3, "aggregateForChart failed");
  const top = useTopCountries([
    { date: 2020, country: "CIV", value: 1 },
    { date: 2020, country: "GHA", value: 2 },
    { date: 2020, country: "SEN", value: 1.5 }
  ], 1);
  console.assert(Array.isArray(top) && top[0] === "GHA", "useTopCountries failed");
}
