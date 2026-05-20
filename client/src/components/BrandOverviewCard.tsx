import type { BrandOverview } from "../types";

interface Props {
  overview: BrandOverview;
}

export default function BrandOverviewCard({ overview }: Props) {
  const { brandName, websiteUrl, tagline, colors, fonts, brandValues, businessOverview } = overview;

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
      {/* Identity */}
      <div className="mb-5">
        <h2 className="text-2xl font-bold text-white">{brandName || "—"}</h2>
        {tagline && (
          <p className="text-gray-400 mt-1 text-base italic">{tagline}</p>
        )}
        {websiteUrl && (
          <a
            href={websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 text-sm mt-1.5 inline-block hover:underline"
          >
            {websiteUrl.slice(0, 80)}
          </a>
        )}
        {businessOverview && (
          <p className="text-gray-500 text-sm mt-3 leading-relaxed line-clamp-3">
            {businessOverview}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Colors */}
        {colors.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">Colors</p>
            <div className="flex gap-3 flex-wrap">
              {colors.map(color => (
                <div key={color} className="flex flex-col items-center gap-1.5">
                  <div
                    className="w-9 h-9 rounded-full border border-gray-700 shadow-sm"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                  <span className="text-xs font-mono text-gray-500 tracking-tight">{color}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fonts */}
        {fonts.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">Fonts</p>
            <div className="flex gap-2 flex-wrap">
              {fonts.map(font => (
                <span
                  key={font}
                  className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-full text-sm text-gray-300 font-medium"
                >
                  {font}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Brand values */}
        {brandValues.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">Brand Values</p>
            <div className="flex gap-2 flex-wrap">
              {brandValues.map(value => (
                <span
                  key={value}
                  className="px-3 py-1.5 bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 rounded-full text-sm font-medium"
                >
                  {value}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
