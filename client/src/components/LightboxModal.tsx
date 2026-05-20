import { useEffect } from "react";

interface Props {
  url: string;
  total: number;
  current: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  downloadUrl: string;
}

export default function LightboxModal({ url, total, current, onClose, onPrev, onNext, downloadUrl }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape")       onClose();
      if (e.key === "ArrowLeft")    onPrev();
      if (e.key === "ArrowRight")   onNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onPrev, onNext]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Prev button */}
      {current > 0 && (
        <button
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white text-4xl select-none z-10 bg-black/30 rounded-full w-12 h-12 flex items-center justify-center"
          onClick={e => { e.stopPropagation(); onPrev(); }}
          aria-label="Previous"
        >
          ‹
        </button>
      )}

      {/* Image */}
      <div
        className="relative max-w-4xl max-h-full flex flex-col items-center"
        onClick={e => e.stopPropagation()}
      >
        <img
          src={url}
          alt={`Asset ${current + 1} of ${total}`}
          className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
        />

        {/* Controls below image */}
        <div className="flex items-center gap-4 mt-4">
          <span className="text-white/60 text-sm">
            {current + 1} / {total}
          </span>
          <a
            href={downloadUrl}
            download
            className="text-sm bg-white/10 hover:bg-white/20 text-white px-4 py-1.5 rounded-full transition-colors"
            onClick={e => e.stopPropagation()}
          >
            Download
          </a>
          <button
            onClick={onClose}
            className="text-sm text-white/60 hover:text-white transition-colors"
          >
            Close ✕
          </button>
        </div>
      </div>

      {/* Next button */}
      {current < total - 1 && (
        <button
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white text-4xl select-none z-10 bg-black/30 rounded-full w-12 h-12 flex items-center justify-center"
          onClick={e => { e.stopPropagation(); onNext(); }}
          aria-label="Next"
        >
          ›
        </button>
      )}
    </div>
  );
}
