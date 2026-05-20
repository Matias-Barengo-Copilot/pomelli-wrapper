import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getRun, streamUrl } from "../api";
import type { RunManifest } from "../types";
import LoadingScreen from "../components/LoadingScreen";
import LogStream from "../components/LogStream";
import BrandOverviewCard from "../components/BrandOverviewCard";
import AssetGallery from "../components/AssetGallery";

type RunStatus = "running" | "completed" | "partial" | "failed";

function StatusBadge({ status }: { status: RunStatus | string }) {
  const styles: Record<string, string> = {
    running:   "bg-indigo-500/15 text-indigo-400 animate-pulse",
    completed: "bg-green-500/15 text-green-400",
    partial:   "bg-yellow-500/15 text-yellow-400",
    failed:    "bg-red-500/15 text-red-400",
  };
  const labels: Record<string, string> = {
    running:   "● Running",
    completed: "✓ Completed",
    partial:   "⚠ Partial",
    failed:    "✗ Failed",
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${styles[status] ?? "bg-gray-800 text-gray-400"}`}>
      {labels[status] ?? status}
    </span>
  );
}

export default function Results() {
  const { runId } = useParams<{ runId: string }>();
  const [logs, setLogs]               = useState<string[]>([]);
  const [runStatus, setRunStatus]     = useState<RunStatus>("running");
  const [manifest, setManifest]       = useState<RunManifest | null>(null);
  const [error, setError]             = useState<string | null>(null);
  const [resolvedRunId, setResolvedRunId] = useState<string | null>(null);
  const sourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!runId) return;

    const source = new EventSource(streamUrl(runId));
    sourceRef.current = source;

    source.onmessage = (ev) => {
      const data = JSON.parse(ev.data as string) as {
        type: string;
        line?: string;
        status?: string;
        runId?: string;
        message?: string;
      };

      if (data.type === "log" && data.line !== undefined) {
        setLogs(prev => [...prev, data.line!]);
      } else if (data.type === "done") {
        const finalId = data.runId && data.runId !== "pending" ? data.runId : runId;
        setResolvedRunId(finalId);
        setRunStatus((data.status as RunStatus) ?? "failed");
        source.close();
        getRun(finalId)
          .then(setManifest)
          .catch(() => getRun(runId).then(setManifest).catch(() => {}));
      } else if (data.type === "error") {
        setError(data.message ?? "Unknown error");
        setRunStatus("failed");
        source.close();
      }
    };

    source.onerror = () => {
      if (source.readyState === EventSource.CLOSED) return;
      setError("Connection lost. The run may still be in progress.");
      source.close();
    };

    return () => { source.close(); };
  }, [runId]);

  const displayRunId = resolvedRunId ?? runId ?? "";
  const totalAssets  = manifest?.sections.reduce((n, s) => n + s.assetCount, 0) ?? 0;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-xl font-bold text-white">
              {manifest?.overview?.brandName ?? manifest?.brandUrl ?? "Running…"}
            </h1>
            <StatusBadge status={runStatus} />
          </div>
          <p className="text-sm text-gray-600 font-mono">{displayRunId}</p>
        </div>
        <Link to="/" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
          ← New run
        </Link>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
          <p className="text-sm text-red-400">⚠️ {error}</p>
        </div>
      )}

      {/* Running state: animated loading screen */}
      {runStatus === "running" && (
        <LoadingScreen lines={logs} />
      )}

      {/* Completed state: results */}
      {runStatus !== "running" && manifest && (
        <div className="space-y-6">
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Status",   value: manifest.status },
              { label: "Assets",   value: String(totalAssets) },
              { label: "Duration", value: `${Math.round((new Date(manifest.completedAt).getTime() - new Date(manifest.startedAt).getTime()) / 1000)}s` },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-900 rounded-xl border border-gray-800 p-4 text-center">
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-xs text-gray-600 uppercase tracking-wider mt-1">{label}</p>
              </div>
            ))}
          </div>

          {/* Brand overview */}
          {manifest.overview && (
            <BrandOverviewCard overview={manifest.overview} />
          )}

          {/* Asset gallery */}
          {manifest.sections.length > 0 && (
            <AssetGallery sections={manifest.sections} runId={displayRunId} />
          )}

          {/* Error detail */}
          {manifest.error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <p className="text-sm font-semibold text-red-400 mb-1">Error detail</p>
              <p className="text-sm text-red-500 font-mono">{manifest.error}</p>
            </div>
          )}

          {/* Full log (collapsed) */}
          <details className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <summary className="px-4 py-3 text-sm text-gray-600 cursor-pointer hover:text-gray-400 hover:bg-gray-800/50 select-none transition-colors">
              Show full log ({logs.length} lines)
            </summary>
            <LogStream lines={logs} maxHeight="400px" />
          </details>
        </div>
      )}

      {/* Waiting for manifest after done event */}
      {runStatus !== "running" && !manifest && !error && (
        <div className="text-center py-16 text-gray-600">
          <div className="w-6 h-6 border-2 border-gray-700 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3" />
          Loading results…
        </div>
      )}
    </div>
  );
}
