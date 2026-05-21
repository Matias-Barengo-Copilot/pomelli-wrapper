import { useState, useEffect } from "react";

export default function WakeupScreen() {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="text-center max-w-md w-full">

        {/* Animated orb */}
        <div className="relative inline-flex items-center justify-center mb-10">
          <div className="w-20 h-20 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            {/* Moon SVG */}
            <svg
              className="w-9 h-9 text-indigo-400"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
            </svg>
          </div>
          <div
            className="absolute -inset-4 rounded-full border border-indigo-500/10 animate-ping"
            style={{ animationDuration: "3s" }}
          />
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-bold text-white mb-3">
          El servidor está despertando
        </h1>

        <p className="text-gray-500 text-sm leading-relaxed mb-2">
          Render durmió el servidor tras 15 minutos de inactividad.
          <br />
          Esto suele tardar entre{" "}
          <span className="text-gray-300 font-medium">30 y 60 segundos</span>.
        </p>

        {elapsed > 0 && (
          <p className="text-gray-700 text-xs mb-6">
            Esperando hace {elapsed}s…
          </p>
        )}

        {/* Spinner row */}
        <div className="flex items-center justify-center gap-2 text-indigo-400 text-sm mt-6">
          <span className="w-3.5 h-3.5 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <span>Tu solicitud se procesará automáticamente cuando esté listo.</span>
        </div>

      </div>
    </div>
  );
}
