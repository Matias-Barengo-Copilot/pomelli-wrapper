import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Home from "./pages/Home";
import Results from "./pages/Results";
import History from "./pages/History";
import WakeupScreen from "./components/WakeupScreen";
import { pingHealth } from "./api";

function Nav() {
  const { pathname } = useLocation();
  return (
    <nav className="border-b border-gray-800 bg-gray-950/80 backdrop-blur sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link to="/" className="font-semibold text-white flex items-center gap-2 hover:text-indigo-400 transition-colors">
          <span className="text-xl">🎨</span>
          <span>Pomelli Wrapper</span>
        </Link>
        <Link
          to="/history"
          className={`text-sm transition-colors ${
            pathname === "/history"
              ? "text-indigo-400"
              : "text-gray-500 hover:text-gray-200"
          }`}
        >
          History
        </Link>
      </div>
    </nav>
  );
}

/**
 * On first render, ping /api/health with a 2.5s timeout.
 * - Responds quickly  → server was already awake, show the app normally (no screen shown).
 * - Times out         → Render is sleeping; show WakeupScreen and retry every 4s until healthy.
 * null = still checking (initial ping in flight — app renders normally to avoid a blank flash).
 */
function useServerReady(): boolean | null {
  const [ready, setReady] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    let retryTimer: ReturnType<typeof setInterval>;

    pingHealth(2500).then(ok => {
      if (cancelled) return;
      setReady(ok);
      if (!ok) {
        retryTimer = setInterval(() => {
          pingHealth(8000).then(ok => {
            if (ok && !cancelled) {
              clearInterval(retryTimer);
              setReady(true);
            }
          });
        }, 4000);
      }
    });

    return () => {
      cancelled = true;
      clearInterval(retryTimer);
    };
  }, []);

  return ready;
}

export default function App() {
  const serverReady = useServerReady();

  // Server confirmed sleeping → show wakeup screen until it responds
  if (serverReady === false) {
    return <WakeupScreen />;
  }

  // null (initial ping in flight) or true → render the app normally
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-950">
        <Nav />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/run/:runId" element={<Results />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
