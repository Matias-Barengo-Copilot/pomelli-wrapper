import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listRuns } from "../api";
import type { RunSummary } from "../types";

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    completed: "bg-green-500/15 text-green-400",
    partial:   "bg-yellow-500/15 text-yellow-400",
    failed:    "bg-red-500/15 text-red-400",
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles[status] ?? "bg-gray-800 text-gray-500"}`}>
      {status}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function History() {
  const [runs, setRuns]       = useState<RunSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    listRuns()
      .then(setRuns)
      .catch(err => setError(err instanceof Error ? err.message : "Failed to load history"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-white">Run History</h1>
        <Link
          to="/"
          className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + New run
        </Link>
      </div>

      {loading && (
        <div className="text-center py-16 text-gray-600">
          <div className="w-6 h-6 border-2 border-gray-700 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3" />
          Loading history…
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <p className="text-sm text-red-400">⚠️ {error}</p>
        </div>
      )}

      {!loading && !error && runs.length === 0 && (
        <div className="text-center py-24 text-gray-600">
          <p className="text-4xl mb-4">📂</p>
          <p className="text-lg font-medium text-gray-500">No runs yet</p>
          <p className="text-sm mt-1">
            <Link to="/" className="text-indigo-400 hover:underline">Start your first run →</Link>
          </p>
        </div>
      )}

      {!loading && runs.length > 0 && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-900/80">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Brand</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Assets</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {runs.map(run => (
                <tr key={run.runId} className="hover:bg-gray-800/40 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-white">
                      {run.brandName ?? new URL(run.brandUrl).hostname}
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5 truncate max-w-xs">{run.brandUrl}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {formatDate(run.startedAt)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={run.status} />
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-white">
                    {run.totalAssets}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/run/${run.runId}`}
                      className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
