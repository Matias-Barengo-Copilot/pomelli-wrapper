import { useState } from "react";
import type { SectionCapture } from "../types";
import { assetUrl } from "../api";
import LightboxModal from "./LightboxModal";

const SECTION_ORDER = ["dna-assets", "brand-book", "campaigns", "photoshoot", "dna-catalog"];
const SECTION_LABELS: Record<string, string> = {
  "dna-assets":  "Brand Assets",
  "brand-book":  "Brand Book",
  "campaigns":   "Campaigns",
  "photoshoot":  "Photoshoot",
  "dna-catalog": "Catalog",
};

interface Props {
  sections: SectionCapture[];
  runId: string;
}

interface LightboxState {
  sectionName: string;
  index: number;
}

export default function AssetGallery({ sections, runId }: Props) {
  const sorted = [...sections].sort(
    (a, b) =>
      (SECTION_ORDER.indexOf(a.name) === -1 ? 99 : SECTION_ORDER.indexOf(a.name)) -
      (SECTION_ORDER.indexOf(b.name) === -1 ? 99 : SECTION_ORDER.indexOf(b.name)),
  );

  const [activeTab, setActiveTab] = useState<string>(() => {
    const first = sorted.find(s => s.assetCount > 0);
    return first?.name ?? sorted[0]?.name ?? "";
  });

  const [lightbox, setLightbox] = useState<LightboxState | null>(null);

  const activeSection = sorted.find(s => s.name === activeTab);

  const lightboxSection = lightbox ? sorted.find(s => s.name === lightbox.sectionName) : null;
  const lightboxAssets  = lightboxSection?.assets ?? [];
  const lightboxAsset   = lightbox !== null ? lightboxAssets[lightbox.index] : null;

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-gray-800 overflow-x-auto">
        {sorted.map(section => {
          const label    = SECTION_LABELS[section.name] ?? section.name;
          const isActive = section.name === activeTab;
          const hasAssets = section.assetCount > 0;

          return (
            <button
              key={section.name}
              onClick={() => setActiveTab(section.name)}
              className={`
                flex-shrink-0 px-5 py-3.5 text-sm font-medium border-b-2 transition-colors
                ${isActive
                  ? "border-indigo-500 text-indigo-400"
                  : "border-transparent text-gray-600 hover:text-gray-300 hover:border-gray-700"
                }
                ${!hasAssets ? "opacity-40" : ""}
              `}
            >
              {label}
              <span className={`ml-2 text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                isActive && hasAssets
                  ? "bg-indigo-500/20 text-indigo-400"
                  : "bg-gray-800 text-gray-600"
              }`}>
                {section.assetCount}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <div className="p-5">
        {!activeSection || activeSection.assetCount === 0 ? (
          <div className="text-center py-12 text-gray-600">
            <p className="text-3xl mb-3">🔍</p>
            <p className="text-sm text-gray-500">No assets captured for this section.</p>
            <p className="text-xs mt-1 text-gray-700">
              {activeSection?.name === "campaigns" || activeSection?.name === "photoshoot"
                ? "This section requires interactive generation inside Pomelli."
                : "Pomelli may not have generated content here yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {activeSection.assets.map((asset, idx) => {
              const url = assetUrl(runId, activeSection.name, asset.file);
              return (
                <div
                  key={asset.index}
                  className="group relative aspect-square overflow-hidden rounded-lg bg-gray-800 cursor-pointer ring-1 ring-gray-700 hover:ring-2 hover:ring-indigo-500 transition-all"
                  onClick={() => setLightbox({ sectionName: activeSection.name, index: idx })}
                >
                  <img
                    src={url}
                    alt={`Asset ${asset.index}`}
                    className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end p-2">
                    <a
                      href={url}
                      download
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs bg-black/70 px-2 py-1 rounded-md"
                      onClick={e => e.stopPropagation()}
                    >
                      ↓ Save
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox !== null && lightboxAsset !== null && lightboxSection && (
        <LightboxModal
          url={assetUrl(runId, lightboxSection.name, lightboxAsset.file)}
          downloadUrl={assetUrl(runId, lightboxSection.name, lightboxAsset.file)}
          total={lightboxAssets.length}
          current={lightbox.index}
          onClose={() => setLightbox(null)}
          onPrev={() => setLightbox(prev => prev && prev.index > 0 ? { ...prev, index: prev.index - 1 } : prev)}
          onNext={() => setLightbox(prev => prev && prev.index < lightboxAssets.length - 1 ? { ...prev, index: prev.index + 1 } : prev)}
        />
      )}
    </div>
  );
}
