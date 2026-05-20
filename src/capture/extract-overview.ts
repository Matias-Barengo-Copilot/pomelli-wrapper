/**
 * extract-overview.ts
 *
 * Extracts structured Brand Overview data from the Pomelli Business DNA page.
 * The page must already be at content_ready state (Business DNA visible).
 *
 * Returns a BrandOverview object that can be serialised to JSON.
 */

import type { Page } from "playwright";

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

// Known section labels in the order Pomelli renders them
const SECTION_LABELS = [
  "Colors",
  "Fonts",
  "Tagline",
  "Brand values",
  "Brand aesthetic",
  "Brand tone of voice",
  "Business overview",
  "Location",
  "Phone Number",
  "Business Hours",
  "Keywords",
  "Social Links",
  "Call-to-Action Links",
  "Testimonials",
] as const;

// Noise tokens to strip from extracted values
const NOISE = new Set([
  "edit", "link", "info", "delete_forever", "Reset",
  "Create Brand Book", "Create Website", "Pomelli Agent",
  "Aa", "", "more_vert",
]);

/**
 * Parse raw innerText of the Business DNA overview into labeled sections.
 * Each section spans from its header to the next known header (or end).
 */
function parseTextBlocks(raw: string): Record<string, string[]> {
  const lines = raw.split("\n").map(l => l.trim()).filter(Boolean);
  const result: Record<string, string[]> = {};

  // Find brand name and URL (before first section label)
  const firstLabelIdx = lines.findIndex(l => SECTION_LABELS.includes(l as typeof SECTION_LABELS[number]));
  result["__header__"] = firstLabelIdx > 0 ? lines.slice(0, firstLabelIdx) : [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (SECTION_LABELS.includes(line as typeof SECTION_LABELS[number])) {
      const values: string[] = [];
      i++;
      while (i < lines.length && !SECTION_LABELS.includes(lines[i] as typeof SECTION_LABELS[number])) {
        const v = lines[i].trim();
        if (!NOISE.has(v)) values.push(v);
        i++;
      }
      result[line] = values;
    } else {
      i++;
    }
  }

  return result;
}

function extractBrandNameAndUrl(headerLines: string[]): { brandName: string; websiteUrl: string } {
  // Header contains: [...nav labels...] "Brand Overview" "Business Details" <name> "link" <url>
  const linkIdx = headerLines.findIndex(l => l === "link");
  const url = linkIdx !== -1 ? (headerLines[linkIdx + 1] ?? "") : "";

  // Brand name is typically the first non-noise, non-nav-label line after "Business Details"
  const detailsIdx = headerLines.findIndex(l => l === "Business Details");
  let brandName = "";
  if (detailsIdx !== -1) {
    for (let i = detailsIdx + 1; i < headerLines.length; i++) {
      const v = headerLines[i];
      if (!NOISE.has(v) && v !== "link" && !v.startsWith("http") && v !== "Business Details") {
        brandName = v;
        break;
      }
    }
  }

  return { brandName, websiteUrl: url };
}

function cleanHex(values: string[]): string[] {
  return values.filter(v => /^#[0-9a-fA-F]{3,8}$/.test(v));
}

function cleanFonts(values: string[]): string[] {
  // Font entries appear as: "Aa" "FontName" pairs — Aa is already stripped by NOISE
  return values.filter(v => v && !v.match(/^#/) && v !== "Aa");
}

function cleanList(values: string[]): string[] {
  return values.filter(v => v && !v.startsWith("http") && v.length < 100);
}

function firstNonEmpty(values: string[]): string {
  return values.find(v => v.length > 20) ?? values[0] ?? "";
}

export async function extractOverview(page: Page): Promise<BrandOverview> {
  // Ensure we are on / can see the Business DNA overview content
  const rawText: string = await page.evaluate(() => {
    // Prefer the page-content container; fall back to full body
    const el =
      document.querySelector(".page-content") as HTMLElement ??
      document.querySelector(".page-container") as HTMLElement ??
      document.body;
    return el?.innerText ?? "";
  });

  const blocks = parseTextBlocks(rawText);
  const { brandName, websiteUrl } = extractBrandNameAndUrl(blocks["__header__"] ?? []);

  return {
    brandName,
    websiteUrl,
    colors:           cleanHex(blocks["Colors"] ?? []),
    fonts:            cleanFonts(blocks["Fonts"] ?? []),
    tagline:          firstNonEmpty(blocks["Tagline"] ?? []),
    brandValues:      cleanList(blocks["Brand values"] ?? []),
    brandAesthetic:   cleanList(blocks["Brand aesthetic"] ?? []),
    brandToneOfVoice: cleanList(blocks["Brand tone of voice"] ?? []),
    businessOverview: firstNonEmpty(blocks["Business overview"] ?? []),
    location:         (blocks["Location"] ?? []).join(", "),
    phoneNumber:      (blocks["Phone Number"] ?? []).join(""),
    businessHours:    (blocks["Business Hours"] ?? []).join(", "),
    keywords:         cleanList(blocks["Keywords"] ?? []),
    socialLinks:      (blocks["Social Links"] ?? []).filter(v => v.startsWith("http")),
  };
}

/** Format a BrandOverview as a human-readable markdown string */
export function overviewToMarkdown(overview: BrandOverview, brandUrl: string): string {
  const lines: string[] = [];
  const date = new Date().toISOString().slice(0, 10);

  lines.push(`# Brand Overview — ${overview.brandName || brandUrl}`);
  lines.push(`\n**Captured:** ${date}  \n**Source:** Pomelli Business DNA\n`);
  lines.push("---\n");

  lines.push(`## Identity\n`);
  lines.push(`| Field | Value |`);
  lines.push(`|---|---|`);
  lines.push(`| Brand name | ${overview.brandName} |`);
  lines.push(`| Website | ${overview.websiteUrl} |`);
  lines.push(`| Tagline | ${overview.tagline} |`);
  lines.push(`| Business overview | ${overview.businessOverview.slice(0, 300)} |`);
  if (overview.location)    lines.push(`| Location | ${overview.location} |`);
  if (overview.phoneNumber) lines.push(`| Phone | ${overview.phoneNumber} |`);
  lines.push("");

  lines.push(`## Visual Identity\n`);
  if (overview.colors.length) {
    lines.push(`### Colors\n`);
    overview.colors.forEach(c => lines.push(`- \`${c}\``));
    lines.push("");
  }
  if (overview.fonts.length) {
    lines.push(`### Fonts\n`);
    overview.fonts.forEach(f => lines.push(`- ${f}`));
    lines.push("");
  }

  lines.push(`## Brand Personality\n`);
  if (overview.brandValues.length) {
    lines.push(`### Values\n`);
    overview.brandValues.forEach(v => lines.push(`- ${v}`));
    lines.push("");
  }
  if (overview.brandAesthetic.length) {
    lines.push(`### Aesthetic\n`);
    overview.brandAesthetic.forEach(v => lines.push(`- ${v}`));
    lines.push("");
  }
  if (overview.brandToneOfVoice.length) {
    lines.push(`### Tone of Voice\n`);
    overview.brandToneOfVoice.forEach(v => lines.push(`- ${v}`));
    lines.push("");
  }

  if (overview.keywords.length) {
    lines.push(`## Keywords\n`);
    overview.keywords.forEach(k => lines.push(`- ${k}`));
    lines.push("");
  }

  if (overview.socialLinks.length) {
    lines.push(`## Social Links\n`);
    overview.socialLinks.forEach(l => lines.push(`- ${l}`));
    lines.push("");
  }

  return lines.join("\n");
}
