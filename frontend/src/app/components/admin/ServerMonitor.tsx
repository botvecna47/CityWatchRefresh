import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { Activity, Cpu, Database, RefreshCw, CheckCircle2, XCircle, AlertTriangle, Server, Wifi } from "lucide-react";
import { Card } from "../../components/ui";

const ACTUATOR = "http://localhost:8081/actuator";

interface HealthStatus {
  status: "UP" | "DOWN" | "UNKNOWN";
  components?: Record<string, { status: string; details?: Record<string, any> }>;
}

interface MetricValue {
  name: string;
  measurements: { statistic: string; value: number }[];
}

function fmt(bytes: number) {
  if (bytes >= 1024 ** 3) return (bytes / 1024 ** 3).toFixed(1) + " GB";
  if (bytes >= 1024 ** 2) return (bytes / 1024 ** 2).toFixed(1) + " MB";
  return (bytes / 1024).toFixed(1) + " KB";
}

function pct(used: number, max: number) {
  if (!max || max <= 0) return 0;
  return Math.min(100, Math.round((used / max) * 100));
}

function GaugeBar({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>{label}</span>
        <span className="font-bold text-gray-700">{value}%</span>
      </div>
      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const up = status === "UP";
  const unknown = status === "UNKNOWN";
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
      up ? "bg-green-100 text-green-700" : unknown ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
    }`}>
      {up ? <CheckCircle2 className="w-3 h-3" /> : unknown ? <AlertTriangle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
      {status}
    </span>
  );
}

export function ServerMonitor() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [heapUsed, setHeapUsed] = useState(0);
  const [heapMax, setHeapMax] = useState(0);
  const [nonHeapUsed, setNonHeapUsed] = useState(0);
  const [cpuUsage, setCpuUsage] = useState(0);
  const [threads, setThreads] = useState(0);
  const [uptime, setUptime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchMetric = async (name: string): Promise<number> => {
    try {
      const r = await fetch(`${ACTUATOR}/metrics/${name}`);
      if (!r.ok) return 0;
      const data: MetricValue = await r.json();
      return data.measurements?.[0]?.value ?? 0;
    } catch { return 0; }
  };

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Health
      const hRes = await fetch(`${ACTUATOR}/health`);
      if (!hRes.ok) throw new Error("Actuator unreachable");
      const hData: HealthStatus = await hRes.json();
      setHealth(hData);

      // Metrics — run in parallel
      const [hu, hm, nhu, cpu, th, ut] = await Promise.all([
        fetchMetric("jvm.memory.used"),
        fetchMetric("jvm.memory.max"),
        fetchMetric("jvm.memory.used"), // non-heap approximation via committed
        fetchMetric("system.cpu.usage"),
        fetchMetric("jvm.threads.live"),
        fetchMetric("process.uptime"),
      ]);

      // Separate heap vs non-heap via tag query
      const heapRes = await fetch(`${ACTUATOR}/metrics/jvm.memory.used?tag=area:heap`).then(r => r.ok ? r.json() : null).catch(() => null);
      const heapMaxRes = await fetch(`${ACTUATOR}/metrics/jvm.memory.max?tag=area:heap`).then(r => r.ok ? r.json() : null).catch(() => null);
      const nonHeapRes = await fetch(`${ACTUATOR}/metrics/jvm.memory.used?tag=area:nonheap`).then(r => r.ok ? r.json() : null).catch(() => null);

      setHeapUsed(heapRes?.measurements?.[0]?.value ?? hu / 2);
      setHeapMax(heapMaxRes?.measurements?.[0]?.value ?? hm);
      setNonHeapUsed(nonHeapRes?.measurements?.[0]?.value ?? nhu / 2);
      setCpuUsage(Math.round(cpu * 100));
      setThreads(Math.round(th));
      setUptime(Math.round(ut));
      setLastRefresh(new Date());
    } catch (e: any) {
      setError(e?.message || "Failed to connect to backend actuator. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 10000); // auto-refresh every 10s
    return () => clearInterval(interval);
  }, [refresh]);

  const heapPct = pct(heapUsed, heapMax);
  const uptimeStr = uptime > 3600
    ? `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`
    : `${Math.floor(uptime / 60)}m ${uptime % 60}s`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-[#1A4331] font-serif flex items-center gap-2">
            <Server className="w-5 h-5" /> Server Health Monitor
          </h2>
          <p className="text-sm text-gray-500 font-serif mt-1">
            Live JVM metrics via Spring Boot Actuator · <code className="text-xs bg-gray-100 px-1 rounded">http://localhost:8081/actuator</code>
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastRefresh && (
            <span className="text-xs text-gray-400">
              Updated {lastRefresh.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={refresh}
            disabled={loading}
            className="flex items-center gap-2 text-sm font-medium text-[#1A4331] border border-[#1A4331]/30 px-3 py-1.5 rounded-sm hover:bg-[#1A4331]/5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          <Wifi className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="font-bold">Cannot reach Actuator</p>
            <p>{error}</p>
            <p className="text-xs mt-1 text-red-500">Make sure the backend is running on port 8081.</p>
          </div>
        </div>
      )}

      {/* Overall Health */}
      {health && (
        <Card className="p-6 bg-white border border-gray-200 shadow-sm">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4" /> Overall Health
          </h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 font-medium">Backend:</span>
              <StatusBadge status={health.status} />
            </div>
            {health.components && Object.entries(health.components).map(([name, comp]) => (
              <div key={name} className="flex items-center gap-2">
                <span className="text-sm text-gray-600 font-medium capitalize">{name}:</span>
                <StatusBadge status={comp.status} />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 bg-white border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Cpu className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">CPU Usage</span>
          </div>
          <p className="text-3xl font-bold text-[#1A4331]">{loading ? "..." : `${cpuUsage}%`}</p>
          {!loading && <GaugeBar value={cpuUsage} label="System CPU" color={cpuUsage > 80 ? "bg-red-500" : cpuUsage > 50 ? "bg-amber-400" : "bg-blue-500"} />}
        </Card>

        <Card className="p-5 bg-white border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Database className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Heap Memory</span>
          </div>
          <p className="text-3xl font-bold text-[#1A4331]">{loading ? "..." : fmt(heapUsed)}</p>
          {!loading && (
            <>
              <GaugeBar value={heapPct} label={`of ${fmt(heapMax)}`} color={heapPct > 85 ? "bg-red-500" : heapPct > 60 ? "bg-amber-400" : "bg-emerald-500"} />
              {heapPct > 85 && <p className="text-xs text-red-500 mt-2 font-bold">⚠ Heap pressure high — consider restarting</p>}
            </>
          )}
        </Card>

        <Card className="p-5 bg-white border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-purple-500" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Non-Heap (Meta)</span>
          </div>
          <p className="text-3xl font-bold text-[#1A4331]">{loading ? "..." : fmt(nonHeapUsed)}</p>
          <p className="text-xs text-gray-400 mt-2">Class metadata, JIT compiled code</p>
        </Card>

        <Card className="p-5 bg-white border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Server className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Threads / Uptime</span>
          </div>
          <p className="text-3xl font-bold text-[#1A4331]">{loading ? "..." : threads}</p>
          <p className="text-xs text-gray-400 mt-2">Live threads · Up {loading ? "..." : uptimeStr}</p>
        </Card>
      </div>

      {/* DB Health Details */}
      {health?.components?.db && (
        <Card className="p-6 bg-white border border-gray-200 shadow-sm">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Database Connection</h3>
          <div className="flex flex-wrap gap-6 text-sm">
            {Object.entries(health.components.db.details || {}).map(([k, v]) => (
              <div key={k}>
                <span className="text-gray-400 capitalize">{k}: </span>
                <span className="font-bold text-gray-700">{String(v)}</span>
              </div>
            ))}
            <div>
              <span className="text-gray-400">Status: </span>
              <StatusBadge status={health.components.db.status} />
            </div>
          </div>
        </Card>
      )}

      {/* Raw Actuator Links */}
      <Card className="p-5 bg-gray-50 border border-gray-200">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Raw Actuator Endpoints</p>
        <div className="flex flex-wrap gap-2">
          {["health", "metrics", "info", "env", "loggers"].map(ep => (
            <a
              key={ep}
              href={`http://localhost:8081/actuator/${ep}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-mono bg-white border border-gray-200 px-3 py-1.5 rounded-sm hover:border-[#1A4331] hover:text-[#1A4331] transition-colors"
            >
              /actuator/{ep} ↗
            </a>
          ))}
        </div>
      </Card>
    </div>
  );
}
