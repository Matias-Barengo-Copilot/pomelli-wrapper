import { useState, useEffect, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { startRun, checkSession, startLogin, confirmLogin, pollSession } from "../api";

type SessionStatus = "checking" | "active" | "inactive";
type LoginStep = "idle" | "starting" | "waiting" | "confirming" | "polling" | "done";

export default function Home() {
  const navigate = useNavigate();
  const [url, setUrl]         = useState("");
  const [error, setError]     = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [sessionStatus, setSessionStatus] = useState<SessionStatus>("checking");
  const [loginStep, setLoginStep]         = useState<LoginStep>("idle");
  const [loginError, setLoginError]       = useState<string | null>(null);

  useEffect(() => {
    checkSession()
      .then(({ active }) => setSessionStatus(active ? "active" : "inactive"))
      .catch(() => setSessionStatus("active")); // optimistic on error
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { runId } = await startRun(url);
      navigate(`/run/${runId}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unexpected error";
      setError(msg);
      if (msg.toLowerCase().includes("login") || msg.toLowerCase().includes("session")) {
        setSessionStatus("inactive");
      }
      setLoading(false);
    }
  };

  const handleStartLogin = async () => {
    setLoginError(null);
    setLoginStep("starting");
    try {
      await startLogin();
      setLoginStep("waiting");
    } catch {
      setLoginError("Could not open login browser. Try running 'npm run login' in the terminal.");
      setLoginStep("idle");
    }
  };

  const handleConfirmLogin = async () => {
    setLoginError(null);
    setLoginStep("confirming");
    try {
      await confirmLogin();
      setLoginStep("polling");
      const success = await pollSession(2000, 25);
      if (success) {
        setLoginStep("done");
        setSessionStatus("active");
        setError(null);
      } else {
        setLoginError("Session wasn't saved — did you log in and reach Pomelli?");
        setLoginStep("waiting");
      }
    } catch {
      setLoginError("Something went wrong. Try running 'npm run login' in the terminal.");
      setLoginStep("waiting");
    }
  };

  const isSessionIssue = sessionStatus === "inactive";

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-lg">

        {/* Hero */}
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">🎨</div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Capture brand assets
          </h1>
          <p className="text-gray-500 text-lg">
            Enter a brand URL to generate Business DNA and download all assets from Pomelli.
          </p>
        </div>

        {/* Session / login card */}
        {isSessionIssue && (
          <div className="mb-6 bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-yellow-500/15 flex items-center justify-center text-lg flex-shrink-0">
                🔐
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Google session required</p>
                <p className="text-gray-500 text-xs mt-0.5">
                  Log in to Pomelli once — your session is saved locally for future runs.
                </p>
              </div>
            </div>

            {loginError && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-3">
                {loginError}
              </p>
            )}

            {loginStep === "idle" && (
              <button
                onClick={handleStartLogin}
                className="w-full py-2.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/20 font-medium rounded-xl text-sm transition-colors"
              >
                Open Login Browser →
              </button>
            )}

            {loginStep === "starting" && (
              <div className="flex items-center justify-center gap-2 py-2.5 text-gray-500 text-sm">
                <span className="w-4 h-4 border-2 border-gray-600 border-t-gray-400 rounded-full animate-spin" />
                Opening Chrome…
              </div>
            )}

            {(loginStep === "waiting" || loginStep === "confirming" || loginStep === "polling") && (
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-800/60 border border-gray-800">
                  <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Chrome is open. Log into your Google account, then wait until you can see the Pomelli homepage.
                  </p>
                </div>
                <button
                  onClick={handleConfirmLogin}
                  disabled={loginStep === "confirming" || loginStep === "polling"}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-xl text-sm transition-colors"
                >
                  {loginStep === "polling" ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving session…
                    </span>
                  ) : (
                    "I'm Logged In →"
                  )}
                </button>
              </div>
            )}

            {loginStep === "done" && (
              <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm text-center">
                ✓ Session saved! You're good to go.
              </div>
            )}
          </div>
        )}

        {/* Run form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://example.com"
            required
            className="w-full px-4 py-3.5 rounded-xl bg-gray-900 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white placeholder:text-gray-600 text-base shadow-sm transition"
          />

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <p className="text-sm text-red-400 font-medium">
                {error.includes("login") || error.includes("Session") ? "🔐 " : "⚠️ "}
                {error}
              </p>
              {error.includes("progress") && (
                <p className="text-xs text-red-500 mt-1">
                  Wait for the current run to finish or{" "}
                  <Link to="/history" className="underline">check history</Link>.
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || sessionStatus === "checking"}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm text-base"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Starting…
              </span>
            ) : (
              "Run Pomelli →"
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          <Link to="/history" className="hover:text-gray-400 transition-colors">
            View past runs →
          </Link>
        </p>
      </div>
    </div>
  );
}
