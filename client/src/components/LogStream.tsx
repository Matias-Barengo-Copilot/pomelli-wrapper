import { useEffect, useRef } from "react";

interface Props {
  lines: string[];
  maxHeight?: string;
}

export default function LogStream({ lines, maxHeight = "60vh" }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines.length]);

  return (
    <div
      className="bg-gray-950 rounded-xl overflow-y-auto font-mono text-sm p-4 shadow-inner"
      style={{ maxHeight }}
    >
      {lines.length === 0 ? (
        <div className="text-gray-600 flex items-center gap-2">
          <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse inline-block" />
          Waiting for output…
        </div>
      ) : (
        lines.map((line, i) => (
          <div key={i} className="leading-6 whitespace-pre-wrap text-gray-300">
            {line}
          </div>
        ))
      )}
      <div ref={bottomRef} />
    </div>
  );
}
