import { BigQuery } from "@google-cloud/bigquery";

import { createSidebarSettingsState } from "@/features/settings/lib/settings-state";
import { templatesSidebarSections } from "@/features/templates/lib/sidebar-settings";
import {
  getFeedTemplates,
  getRankingSettings,
  scoreTemplates,
  type TemplateSeed,
} from "@/features/templates/lib/template-ranking";

const bigquery = new BigQuery();

const QUERY = `
  SELECT
    s.title,
    s.creator,
    s.thumbnail,
    s.price,
    s.published_date,
    s.views_l7,
    s.views_l30,
    s.views_l90,
    s.visitors_l7,
    s.visitors_l30,
    s.visitors_l90,
    s.unique_user_remixes_l7 AS remixes_l7,
    s.unique_user_remixes_l30 AS remixes_l30,
    s.unique_user_remixes_l90 AS remixes_l90,
    s.active_sites_l7,
    s.active_sites_l30,
    s.active_sites_l90,
    s.views_all_time,
    s.visitors_all_time,
    s.unique_user_remixes_all_time AS remixes_all_time,
    s.active_sites_all_time,
    s.sales,
    t.categories,
    DATE_DIFF(CURRENT_DATE(), s.published_date, DAY) AS age_days
  FROM \`framer-data-analysis.marketplace.template_stats\` s
  LEFT JOIN \`framer-data-analysis.marketplace.templates\` t
    ON s.id = t.id
  WHERE s.status = 'published'
  ORDER BY s.views_l30 DESC
`;

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const CURRENT_TRENDING_SHARE = 0.06;
const MIN_CURRENT_TRENDING = 24;
const MAX_CURRENT_TRENDING = 240;
const MANUAL_TRENDING_OVERRIDES = {
  "e.hunter": {
    daysInTrending: 5,
    trendingFeatureCount: 6,
  },
} as const;
const NULL_MOMENTUM: TemplateSeed["momentum"] = {
  previewGrowth: null,
  remixGrowth: null,
  previousPreviewGrowth: null,
  previousRemixGrowth: null,
};
let cachedSeeds: TemplateSeed[] | null = null;
let cachedAt = 0;

type BigQueryTemplateRow = {
  activeSites30: number;
  activeSites7: number;
  activeSites90: number;
  activeSitesAllTime: number;
  ageDays: number;
  categories: unknown;
  creator: string;
  conversionsAllTime: number;
  name: string;
  previews30: number;
  previews7: number;
  previews90: number;
  previewsAllTime: number;
  price: number;
  remixes30: number;
  remixes7: number;
  remixes90: number;
  remixesAllTime: number;
  thumbnailUrl?: string;
  views30: number;
  views7: number;
  views90: number;
  viewsAllTime: number;
};

type SeedSynthesisContext = {
  maxMonthRemixes: number;
  maxMonthViews: number;
};

const CATEGORY_PALETTES: Record<string, readonly [string, string, string, string][]> = {
  Agency: [
    ["#0d1021", "#1d2550", "#4b7fff", "rgba(89, 136, 255, 0.42)"],
    ["#110f1d", "#281b44", "#a76bff", "rgba(185, 124, 255, 0.35)"],
  ],
  Business: [
    ["#0c1417", "#17313b", "#22b8cf", "rgba(44, 200, 255, 0.35)"],
    ["#10131f", "#25355f", "#5f87ff", "rgba(111, 152, 255, 0.34)"],
  ],
  Ecommerce: [
    ["#160f0d", "#4a2117", "#ff8a4c", "rgba(255, 151, 84, 0.36)"],
    ["#161114", "#4a2640", "#ff6d9d", "rgba(255, 120, 170, 0.34)"],
  ],
  Landing: [
    ["#0d1119", "#1a2548", "#3f8cff", "rgba(74, 155, 255, 0.36)"],
    ["#111017", "#31204e", "#be6dff", "rgba(201, 124, 255, 0.33)"],
  ],
  Personal: [
    ["#111013", "#35223b", "#ff74a6", "rgba(255, 124, 171, 0.33)"],
    ["#120f14", "#2d243d", "#a780ff", "rgba(176, 144, 255, 0.34)"],
  ],
  Portfolio: [
    ["#0a0f17", "#16304d", "#2f8cff", "rgba(69, 154, 255, 0.38)"],
    ["#120f18", "#2e1d43", "#8a63ff", "rgba(151, 118, 255, 0.34)"],
  ],
  SaaS: [
    ["#0b1017", "#173149", "#00a8ff", "rgba(45, 190, 255, 0.36)"],
    ["#0d1119", "#1d2b56", "#5c87ff", "rgba(110, 149, 255, 0.34)"],
  ],
};

const FALLBACK_PALETTES = [
  ["#0c1019", "#1a2648", "#4f84ff", "rgba(87, 139, 255, 0.36)"],
  ["#101018", "#2a1f3d", "#a26cff", "rgba(170, 120, 255, 0.34)"],
  ["#11120e", "#2a3720", "#7acb62", "rgba(137, 220, 110, 0.33)"],
  ["#16100f", "#42221a", "#ff8c5a", "rgba(255, 147, 101, 0.35)"],
] as const;

function ensureCurrentTrendingFeatureCounts(seed: TemplateSeed) {
  if (!seed.trendingFeatureCounts) {
    return seed.trendingFeatureCounts;
  }

  return {
    last30Days: Math.max(seed.trendingFeatureCounts.last30Days, 1),
    last90Days: Math.max(seed.trendingFeatureCounts.last90Days, 1),
    lifetime: Math.max(seed.trendingFeatureCounts.lifetime, 1),
  };
}

function toNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function roundMetricValue(value: number) {
  return Math.max(0, Math.round(value));
}

function ratio(numerator: number, denominator: number) {
  return numerator / Math.max(denominator, 1);
}

function hashString(input: string) {
  let hash = 0;

  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function normalizeLog(value: number, maxValue: number) {
  return Math.log(value + 1) / Math.log(maxValue + 1);
}

function buildThumbnailUrl(rawUrl: string): string {
  return `https://www.framer.com/creators-assets/_next/image/?url=${encodeURIComponent(rawUrl)}&w=3840&q=100`;
}

function getPrimaryCategory(rawCategories: unknown) {
  return Array.isArray(rawCategories) && rawCategories.length > 0
    ? String(rawCategories[0])
    : "Other";
}

function normalizeBigQueryRow(row: Record<string, unknown>): BigQueryTemplateRow {
  return {
    name: String(row.title ?? "Untitled"),
    creator: String(row.creator ?? "Unknown"),
    categories: row.categories,
    price: toNumber(row.price),
    ageDays: toNumber(row.age_days),
    thumbnailUrl: row.thumbnail ? buildThumbnailUrl(String(row.thumbnail)) : undefined,
    views7: toNumber(row.views_l7),
    views30: toNumber(row.views_l30),
    views90: toNumber(row.views_l90),
    previews7: toNumber(row.visitors_l7),
    previews30: toNumber(row.visitors_l30),
    previews90: toNumber(row.visitors_l90),
    remixes7: toNumber(row.remixes_l7),
    remixes30: toNumber(row.remixes_l30),
    remixes90: toNumber(row.remixes_l90),
    activeSites7: toNumber(row.active_sites_l7),
    activeSites30: toNumber(row.active_sites_l30),
    activeSites90: toNumber(row.active_sites_l90),
    viewsAllTime: toNumber(row.views_all_time),
    previewsAllTime: toNumber(row.visitors_all_time),
    remixesAllTime: toNumber(row.remixes_all_time),
    activeSitesAllTime: toNumber(row.active_sites_all_time),
    conversionsAllTime: toNumber(row.sales),
  };
}

function computeGrowth(currentValue: number, baselineValue: number) {
  return clamp(ratio(currentValue, baselineValue) - 1, -0.35, 0.45);
}

function estimateConversions(
  row: BigQueryTemplateRow,
  currentRemixGrowth: number,
  previousRemixGrowth: number,
) {
  const previewRate = ratio(row.previews30, row.views30);
  const remixRate = ratio(row.remixes30, row.previews30);
  const isFree = row.price === 0;
  const baseRate = isFree ? 0.055 : 0.028;
  const priceFactor =
    row.price === 0 ? 1.08 : clamp(1 - Math.log10(row.price + 10) * 0.18, 0.56, 0.92);
  const ageFactor =
    row.ageDays <= 30 ? 1.08 : row.ageDays >= 180 ? 0.94 : 1;
  const monthRate = clamp(
    (baseRate + previewRate * 0.015 + remixRate * 0.05) * priceFactor * ageFactor,
    isFree ? 0.025 : 0.012,
    isFree ? 0.11 : 0.055,
  );
  const weekRate = clamp(
    monthRate * (1 + Math.max(-0.12, currentRemixGrowth) * 0.35),
    isFree ? 0.02 : 0.01,
    isFree ? 0.12 : 0.06,
  );
  const quarterRate = clamp(
    monthRate * (1 - previousRemixGrowth * 0.15),
    isFree ? 0.024 : 0.011,
    isFree ? 0.105 : 0.052,
  );

  return {
    week: roundMetricValue(row.remixes7 * weekRate),
    month: roundMetricValue(row.remixes30 * monthRate),
    quarter: roundMetricValue(row.remixes90 * quarterRate),
  };
}

function estimateNewUserRate(row: BigQueryTemplateRow, currentPreviewGrowth: number) {
  const previewRate = ratio(row.previews30, row.views30);
  const isFree = row.price === 0;

  return clamp(
    (isFree ? 0.18 : 0.11) +
      previewRate * 0.08 +
      Math.max(0, currentPreviewGrowth) * 0.12 -
      Math.min(row.ageDays, 240) / 1400,
    isFree ? 0.12 : 0.08,
    isFree ? 0.32 : 0.22,
  );
}

function estimateTrendingFeatureCounts(
  row: BigQueryTemplateRow,
  popularityScore: number,
  growthScore: number,
  isCurrentlyTrending: boolean,
  daysSinceLastTrending: number | null,
) {
  const lifetime = clamp(
    roundMetricValue(
      (row.ageDays / 45) * (0.35 + popularityScore * 1.8) +
        (isCurrentlyTrending ? 1.5 : 0),
    ),
    0,
    24,
  );
  const recentBias = clamp(
    0.4 +
      Math.max(growthScore, -0.15) +
      (isCurrentlyTrending ? 0.35 : 0) -
      (daysSinceLastTrending ?? 0) / 120,
    0.18,
    1,
  );
  const last90Days = Math.min(
    lifetime,
    Math.max(
      isCurrentlyTrending ? 1 : 0,
      roundMetricValue(
        lifetime *
          Math.min(1, 90 / Math.max(row.ageDays, 90)) *
          recentBias,
      ),
    ),
  );
  const last30Days = Math.min(
    last90Days,
    Math.max(
      isCurrentlyTrending ? 1 : 0,
      roundMetricValue(
        last90Days *
          Math.min(1, 30 / Math.max(row.ageDays, 30)) *
          clamp(
            0.75 + Math.max(growthScore, 0) * 0.8 + (isCurrentlyTrending ? 0.2 : 0),
            0.35,
            1.1,
          ),
      ),
    ),
  );

  return {
    last30Days,
    last90Days,
    lifetime,
  };
}

function buildPreviewStyles(name: string, category: string, pricingType: TemplateSeed["pricingType"]) {
  const palettes = CATEGORY_PALETTES[category] ?? FALLBACK_PALETTES;
  const hash = hashString(`${name}:${category}:${pricingType}`);
  const palette = palettes[hash % palettes.length];
  const angle = 126 + (hash % 28);
  const glowX = 18 + (hash % 58);
  const glowY = 14 + ((hash >>> 5) % 58);
  const glowSize = 24 + (hash % 10);

  return {
    previewBase: `linear-gradient(${angle}deg, ${palette[0]} 0%, ${palette[1]} 48%, ${palette[2]} 100%)`,
    previewGlow: `radial-gradient(circle at ${glowX}% ${glowY}%, ${palette[3]}, transparent ${glowSize}%)`,
  };
}

const defaultRankingSettings = getRankingSettings(
  createSidebarSettingsState(templatesSidebarSections),
);

function applyCurrentTrendingAssignments(seeds: TemplateSeed[]) {
  if (seeds.length === 0) {
    return seeds;
  }

  const currentTrendingCount = clamp(
    Math.round(seeds.length * CURRENT_TRENDING_SHARE),
    MIN_CURRENT_TRENDING,
    Math.min(MAX_CURRENT_TRENDING, seeds.length),
  );
  const rankedTemplates = getFeedTemplates(
    scoreTemplates(defaultRankingSettings, seeds),
    defaultRankingSettings,
  );
  const currentTrendingRanks = new Map(
    rankedTemplates
      .slice(0, currentTrendingCount)
      .map((template, index) => [template.name, index] as const),
  );

  return seeds.map((seed) => {
    const trendingRank = currentTrendingRanks.get(seed.name);

    if (trendingRank === undefined) {
      return {
        ...seed,
        isCurrentlyTrending: false,
        daysInTrending: 0,
        daysSinceLastTrending: seed.daysSinceLastTrending,
      };
    }

    const rankRatio = trendingRank / Math.max(currentTrendingCount - 1, 1);
    return {
      ...seed,
      isCurrentlyTrending: true,
      daysInTrending: clamp(Math.round(1 + rankRatio * 5), 1, 6),
      daysSinceLastTrending: null,
      trendingFeatureCounts: ensureCurrentTrendingFeatureCounts(seed),
    };
  });
}

function applyManualTrendingOverrides(seeds: TemplateSeed[]) {
  return seeds.map((seed) => {
    const override =
      MANUAL_TRENDING_OVERRIDES[seed.name.trim().toLowerCase() as keyof typeof MANUAL_TRENDING_OVERRIDES];

    if (!override) {
      return seed;
    }

    return {
      ...seed,
      isCurrentlyTrending: true,
      daysInTrending: override.daysInTrending,
      daysSinceLastTrending: null,
      manualTrendingDays: override.daysInTrending,
      trendingFeatureCounts: {
        last30Days: override.trendingFeatureCount,
        last90Days: override.trendingFeatureCount,
        lifetime: override.trendingFeatureCount,
      },
    };
  });
}

function synthesizeSeed(
  row: BigQueryTemplateRow,
  context: SeedSynthesisContext,
): TemplateSeed {
  const isFree = row.price === 0;
  const category = getPrimaryCategory(row.categories);
  const pricingType: TemplateSeed["pricingType"] = isFree ? "free" : "paid";
  const currentPreviewGrowth = computeGrowth(row.previews7, row.previews30 / 4.2857);
  const currentRemixGrowth = computeGrowth(row.remixes7, row.remixes30 / 4.2857);
  const previousRemixGrowth = computeGrowth(row.remixes30 / 4.2857, row.remixes90 / 13);
  const popularityScore =
    0.58 * normalizeLog(row.views30, context.maxMonthViews) +
    0.42 * normalizeLog(row.remixes30, context.maxMonthRemixes);
  const growthScore = 0.45 * currentPreviewGrowth + 0.55 * currentRemixGrowth;
  const trendSignal = popularityScore * 0.72 + clamp((growthScore + 0.2) / 0.5, 0, 1) * 0.28;
  const isCurrentlyTrending =
    trendSignal >= 0.68 || (popularityScore >= 0.82 && growthScore > -0.02);
  const explorationCandidate =
    !isCurrentlyTrending &&
    row.ageDays <= 45 &&
    (currentPreviewGrowth >= 0.08 || currentRemixGrowth >= 0.08);
  const daysInTrending = isCurrentlyTrending
    ? clamp(Math.round(1 + popularityScore * 4 - Math.max(growthScore, 0) * 3), 1, 6)
    : 0;
  const daysSinceLastTrending = isCurrentlyTrending
    ? null
    : popularityScore >= 0.45 || row.ageDays > 21
      ? clamp(Math.round(2 + (1 - clamp(growthScore, -0.15, 0.2) + (1 - popularityScore)) * 4), 2, 18)
      : null;
  const adminOverride: TemplateSeed["adminOverride"] =
    row.ageDays <= 35 && popularityScore >= 0.78 && growthScore >= 0.18
      ? "great"
      : row.ageDays >= 120 &&
          popularityScore >= 0.48 &&
          ratio(row.remixes30, row.previews30) < 0.085 &&
          currentRemixGrowth <= -0.08
        ? "bad"
        : "none";
  const conversions = estimateConversions(row, currentRemixGrowth, previousRemixGrowth);
  const trendingFeatureCounts = estimateTrendingFeatureCounts(
    row,
    popularityScore,
    growthScore,
    isCurrentlyTrending,
    daysSinceLastTrending,
  );
  const { previewBase, previewGlow } = buildPreviewStyles(
    row.name,
    category,
    pricingType,
  );

  return {
    name: row.name,
    creator: row.creator,
    category,
    pricingType,
    pricingLabel: isFree ? "Free" : `$${row.price}`,
    thumbnailUrl: row.thumbnailUrl,
    week: [row.views7, row.previews7, row.remixes7, conversions.week],
    month: [row.views30, row.previews30, row.remixes30, conversions.month],
    quarter: [row.views90, row.previews90, row.remixes90, conversions.quarter],
    activeSites: {
      week: row.activeSites7,
      month: row.activeSites30,
      quarter: row.activeSites90,
    },
    lifetime: {
      views: row.viewsAllTime,
      previews: row.previewsAllTime,
      remixes: row.remixesAllTime,
      activeSites: row.activeSitesAllTime,
      conversions: row.conversionsAllTime,
    },
    revenuePerConversion: row.price,
    newUserRate: estimateNewUserRate(row, currentPreviewGrowth),
    trendingFeatureCounts,
    ageDays: row.ageDays,
    isCurrentlyTrending,
    daysInTrending,
    daysSinceLastTrending,
    adminOverride,
    explorationCandidate,
    momentum: NULL_MOMENTUM,
    previewBase,
    previewGlow,
  };
}

export async function fetchTemplateSeeds(): Promise<TemplateSeed[]> {
  if (cachedSeeds && Date.now() - cachedAt < CACHE_TTL_MS) {
    return cachedSeeds;
  }

  const [rows] = await bigquery.query({ query: QUERY });
  const normalizedRows = rows.map((row: Record<string, unknown>) => normalizeBigQueryRow(row));
  const context: SeedSynthesisContext = {
    maxMonthViews: Math.max(...normalizedRows.map((row) => row.views30), 1),
    maxMonthRemixes: Math.max(...normalizedRows.map((row) => row.remixes30), 1),
  };
  const synthesizedSeeds = normalizedRows.map((row) => synthesizeSeed(row, context));
  const seeds = applyManualTrendingOverrides(
    applyCurrentTrendingAssignments(synthesizedSeeds),
  );

  cachedSeeds = seeds;
  cachedAt = Date.now();
  return seeds;
}
