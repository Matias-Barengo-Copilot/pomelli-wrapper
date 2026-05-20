export interface BrandOverview {
  brandName: string;
  websiteUrl: string;
  colors: string[];
  fonts: string[];
  tagline: string;
  brandValues: string[];
  brandAesthetic: string[];
  brandToneOfVoice: string[];
  businessOverview: string;
  location: string;
  phoneNumber: string;
  businessHours: string;
  keywords: string[];
  socialLinks: string[];
}

export interface AssetEntry {
  index: number;
  url: string;
  file: string;
  contentType: string;
  sizeBytes: number;
}

export interface SectionCapture {
  name: string;
  capturedAt: string;
  screenshotFile: string;
  assetCount: number;
  assets: AssetEntry[];
}

export interface RunManifest {
  schemaVersion: string;
  runId: string;
  brandUrl: string;
  startedAt: string;
  completedAt: string;
  status: "completed" | "partial" | "failed";
  error: string | null;
  overview: BrandOverview | null;
  sections: SectionCapture[];
}

export interface RunSummary {
  runId: string;
  brandUrl: string;
  brandName: string | null;
  startedAt: string;
  completedAt: string;
  status: string;
  totalAssets: number;
}
