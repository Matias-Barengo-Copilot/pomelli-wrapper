import { useMemo } from "react";

interface Props {
  lines: string[];
}

interface Milestone {
  id: string;
  label: string;
  completed: boolean;
}

const SECTION_LABELS: Record<string, string> = {
  "dna-assets":  "Brand Assets",
  "brand-book":  "Brand Book",
  "campaigns":   "Campaigns",
  "photoshoot":  "Photoshoot",
  "dna-catalog": "Catalog",
};

function getStatus(lines: string[]): { headline: string; sub: string } {
  for (let i = lines.length - 1; i >= 0; i--) {
    const l = lines[i];
    if (l.includes("manifest saved"))
      return { headline: "Packing up the studio.", sub: "Saving assets and writing the final report" };
    if (l.includes("closing browser"))
      return { headline: "Almost there!", sub: "Closing the browser and tidying up" };
    if (l.includes("exploration") && !l.includes("[6]") && !l.includes("FATAL"))
      return { headline: "Hunting for hidden gems.", sub: "Scouting every corner of the asset vault" };
    if (/✓ section "([\w-]+)"/.test(l)) {
      const m = /✓ section "([\w-]+)"/.exec(l);
      const name = SECTION_LABELS[m![1]] ?? m![1];
      return { headline: `"${name}" done.`, sub: "Asset library is growing nicely" };
    }
    if (/── section \d+/.test(l) || l.includes("capture mode"))
      return { headline: "Capturing brand assets.", sub: "Downloading every generated image" };
    if (l.includes("overview saved"))
      return { headline: "Brand DNA secured.", sub: "Profile locked — pivoting to assets" };
    if (/brand name:\s*.+/.test(l)) {
      const m = /brand name:\s*(.+)/.exec(l);
      const name = m?.[1].trim();
      return {
        headline: name ? `Found "${name}".` : "Brand identified!",
        sub: "Identity confirmed — extracting the good stuff",
      };
    }
    if (l.includes("Extracting Business DNA"))
      return { headline: "Decoding brand DNA.", sub: "Science mode: engaged" };
    if (l.includes("readyState") || l.includes("cached session"))
      return { headline: "Setting the stage.", sub: "Navigating to the right section" };
    if (l.includes("previous brand deleted") || l.includes("starting fresh"))
      return { headline: "Old brand cleared.", sub: "Clean canvas — ready to go" };
    if (l.includes("Checking for existing brand"))
      return { headline: "Checking for old brand data.", sub: "Making sure we start fresh" };
    if (l.includes("session active") || l.includes("✓ Angular ready"))
      return { headline: "We're in.", sub: "Session active, Pomelli is alive" };
    if (l.includes("waiting for Angular"))
      return { headline: "Angular is stretching…", sub: "The framework needs a moment" };
    if (l.includes("Navigating to Pomelli") || l.includes("landed at"))
      return { headline: "Connecting to Pomelli.", sub: "Knocking on the branding lab door" };
  }
  return { headline: "Starting the engine.", sub: "Initializing the capture process" };
}

function parseLogs(lines: string[]) {
  const joined = lines.join("\n");
  const { headline, sub } = getStatus(lines);

  const milestones: Milestone[] = [
    {
      id: "connected",
      label: "Connected to Pomelli",
      completed: /session active|✓ Angular ready/.test(joined),
    },
    {
      id: "dna",
      label: "Brand DNA extracted",
      completed: /overview saved/.test(joined),
    },
    {
      id: "assets",
      label: "Assets captured",
      completed: /✓ section/.test(joined),
    },
    {
      id: "done",
      label: "Run complete",
      completed: /manifest saved/.test(joined),
    },
  ];

  const completedSections = [...joined.matchAll(/✓ section "([\w-]+)"/g)]
    .map(m => m[1])
    .filter((v, i, a) => a.indexOf(v) === i);

  return { headline, sub, milestones, completedSections };
}

export default function LoadingScreen({ lines }: Props) {
  const { headline, sub, milestones, completedSections } = useMemo(
    () => parseLogs(lines),
    // Re-run only when line count changes — avoids thrashing on object identity
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lines.length],
  );

  return (
    <div className="flex flex-col items-center py-20 px-4">
      {/* Animated orb */}
      <div className="relative mb-10">
        <div className="w-24 h-24 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
          <div className="w-10 h-10 border-[3px] border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
        </div>
        <div
          className="absolute -inset-3 rounded-full border border-indigo-500/10 animate-ping"
          style={{ animationDuration: "2.5s" }}
        />
      </div>

      {/* Headline */}
      <h2 className="text-2xl font-bold text-white text-center max-w-sm mb-2 leading-snug">
        {headline}
      </h2>
      <p className="text-gray-500 text-sm text-center mb-12">{sub}</p>

      {/* Milestone timeline */}
      <div className="w-full max-w-xs space-y-1 mb-10">
        {milestones.map((m, i) => (
          <div key={m.id}>
            <div className="flex items-center gap-4">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                m.completed
                  ? "bg-indigo-600 shadow-lg shadow-indigo-500/25"
                  : "bg-gray-800 border border-gray-700"
              }`}>
                {m.completed ? (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-600" />
                )}
              </div>
              <span className={`text-sm ${m.completed ? "text-white font-medium" : "text-gray-600"}`}>
                {m.label}
              </span>
            </div>
            {i < milestones.length - 1 && (
              <div className={`ml-3 w-px h-4 ${m.completed ? "bg-indigo-600/30" : "bg-gray-800"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Captured section chips */}
      {completedSections.length > 0 && (
        <div className="flex gap-2 flex-wrap justify-center mb-10">
          {completedSections.map(s => (
            <span
              key={s}
              className="text-xs px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 font-medium"
            >
              ✓ {SECTION_LABELS[s] ?? s}
            </span>
          ))}
        </div>
      )}

      {/* Collapsible raw logs */}
      <details className="w-full max-w-2xl">
        <summary className="text-xs text-gray-700 hover:text-gray-500 cursor-pointer select-none text-center mb-3 transition-colors">
          Raw logs ({lines.length} lines)
        </summary>
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 font-mono text-xs text-gray-600 max-h-52 overflow-y-auto">
          {lines.length === 0 ? (
            <span className="text-gray-700">Waiting for output…</span>
          ) : (
            lines.map((line, i) => (
              <div key={i} className="leading-5 whitespace-pre-wrap">{line}</div>
            ))
          )}
        </div>
      </details>
    </div>
  );
}
