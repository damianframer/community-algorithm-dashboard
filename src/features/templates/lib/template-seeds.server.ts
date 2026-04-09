import { BigQuery } from "@google-cloud/bigquery";

import {
  getDefaultTemplateSeeds,
  type TemplateExposureStats,
  type TemplateSeed,
} from "@/features/templates/lib/template-ranking";

const bigquery = new BigQuery();

const QUERY = `
  SELECT
    s.id AS template_id,
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
    s.conversion_rate_l7,
    s.conversion_rate_l30,
    s.conversion_rate_l90,
    s.conversion_rate_all_time,
    t.categories,
    DATE_DIFF(CURRENT_DATE(), s.published_date, DAY) AS age_days
  FROM \`framer-data-analysis.marketplace.template_stats\` s
  LEFT JOIN \`framer-data-analysis.marketplace.templates\` t
    ON s.id = t.id
  WHERE s.status = 'published'
  ORDER BY s.views_l30 DESC
`;

const TEMPLATE_EXPOSURE_CONFIG_VERSION = "template2_30d_v1";
const TEMPLATE_EXPOSURE_QUERY = `
  SELECT
    snapshot_date,
    template_id,
    display_rank
  FROM \`framer-data-analysis.marketplace.template2_rank_daily\`
  WHERE config_version = @configVersion
    AND snapshot_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 29 DAY)
`;

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const DEFAULT_POSITION_OUTSIDE_TOP_300 = 301;
const EXPOSURE_LOOKBACK_DAYS = 30;
const POSITION_CHANGE_LOOKBACK_DAYS = 14;
const MANUAL_TRENDING_OVERRIDES = {
  "e.hunter": {
    daysInTrending: 5,
    trendingFeatureCount: 6,
  },
} as const;
let cachedSeeds: TemplateSeed[] | null = null;
let cachedAt = 0;

type BigQueryTemplateRow = {
  activeSites30: number;
  activeSites7: number;
  activeSites90: number;
  activeSitesAllTime: number;
  ageDays: number;
  categories: unknown;
  conversionRate30: number;
  conversionRate7: number;
  conversionRate90: number;
  conversionRateAllTime: number;
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
  templateId: number;
  thumbnailUrl?: string;
  views30: number;
  views7: number;
  views90: number;
  viewsAllTime: number;
};

type TemplateExposureSnapshotRow = {
  displayRank: number;
  snapshotDate: string;
  templateId: number;
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
    templateId: toNumber(row.template_id),
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
    conversionRate7: toNumber(row.conversion_rate_l7),
    conversionRate30: toNumber(row.conversion_rate_l30),
    conversionRate90: toNumber(row.conversion_rate_l90),
    conversionRateAllTime: toNumber(row.conversion_rate_all_time),
  };
}

function normalizeSnapshotDate(value: unknown) {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  if (typeof value === "string") {
    return value.slice(0, 10);
  }

  return "";
}

function normalizeTemplateExposureSnapshotRow(
  row: Record<string, unknown>,
): TemplateExposureSnapshotRow | null {
  const snapshotDate = normalizeSnapshotDate(row.snapshot_date);
  const templateId = toNumber(row.template_id);
  const displayRank = toNumber(row.display_rank);

  if (!snapshotDate || templateId <= 0 || displayRank <= 0) {
    return null;
  }

  return {
    displayRank,
    snapshotDate,
    templateId,
  };
}

function getTemplateExposureWeight(displayRank: number) {
  if (displayRank <= 12) {
    return 8;
  }

  if (displayRank <= 48) {
    return 4;
  }

  if (displayRank <= 120) {
    return 2;
  }

  if (displayRank <= 300) {
    return 1;
  }

  return 0;
}

function formatDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addUtcDays(date: Date, days: number) {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function getDefaultExposureStats(ageDays: number): TemplateExposureStats {
  return {
    avgAbsPositionChange14: 0,
    explorationEligible: ageDays <= 45,
    top48StreakDays: 0,
    top300ExposureDays30: 0,
    weightedExposure30: 0,
  };
}

function buildExposureStatsByTemplate(
  rows: TemplateExposureSnapshotRow[],
) {
  const statsByTemplateId = new Map<number, Omit<TemplateExposureStats, "explorationEligible">>();

  if (rows.length === 0) {
    return statsByTemplateId;
  }

  const latestSnapshotKey = rows.reduce(
    (latest, row) => (row.snapshotDate > latest ? row.snapshotDate : latest),
    rows[0]!.snapshotDate,
  );
  const latestSnapshotDate = new Date(`${latestSnapshotKey}T00:00:00.000Z`);
  const positionsByTemplate = new Map<number, Map<string, number>>();

  for (const row of rows) {
    const positionsByDate =
      positionsByTemplate.get(row.templateId) ?? new Map<string, number>();
    positionsByDate.set(row.snapshotDate, row.displayRank);
    positionsByTemplate.set(row.templateId, positionsByDate);
  }

  for (const [templateId, positionsByDate] of positionsByTemplate) {
    const top300ExposureDays30 = positionsByDate.size;
    const weightedExposure30 = Array.from(positionsByDate.values()).reduce(
      (sum, displayRank) => sum + getTemplateExposureWeight(displayRank),
      0,
    );

    let top48StreakDays = 0;
    for (let offset = 0; offset < EXPOSURE_LOOKBACK_DAYS; offset += 1) {
      const dateKey = formatDateKey(addUtcDays(latestSnapshotDate, -offset));
      const displayRank = positionsByDate.get(dateKey);

      if (displayRank !== undefined && displayRank <= 48) {
        top48StreakDays += 1;
        continue;
      }

      break;
    }

    const last14Positions = Array.from(
      { length: POSITION_CHANGE_LOOKBACK_DAYS },
      (_, index) => {
        const offset = POSITION_CHANGE_LOOKBACK_DAYS - index - 1;
        const dateKey = formatDateKey(addUtcDays(latestSnapshotDate, -offset));
        return (
          positionsByDate.get(dateKey) ?? DEFAULT_POSITION_OUTSIDE_TOP_300
        );
      },
    );
    const totalPositionChange = last14Positions.slice(1).reduce(
      (sum, position, index) =>
        sum + Math.abs(position - last14Positions[index]!),
      0,
    );

    statsByTemplateId.set(templateId, {
      avgAbsPositionChange14:
        totalPositionChange / Math.max(last14Positions.length - 1, 1),
      top48StreakDays,
      top300ExposureDays30,
      weightedExposure30,
    });
  }

  return statsByTemplateId;
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
  exposureStatsByTemplateId: ReadonlyMap<
    number,
    Omit<TemplateExposureStats, "explorationEligible">
  >,
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
  const historicalExposureStats = exposureStatsByTemplateId.get(row.templateId);
  const exposureStats: TemplateExposureStats = historicalExposureStats
    ? {
        ...historicalExposureStats,
        explorationEligible:
          historicalExposureStats.top300ExposureDays30 <= 3 ||
          row.ageDays <= 45,
      }
    : getDefaultExposureStats(row.ageDays);
  const explorationCandidate = exposureStats.explorationEligible;
  const { previewBase, previewGlow } = buildPreviewStyles(
    row.name,
    category,
    pricingType,
  );

  return {
    templateId: row.templateId,
    name: row.name,
    creator: row.creator,
    category,
    pricingType,
    pricingLabel: isFree ? "Free" : `$${row.price}`,
    thumbnailUrl: row.thumbnailUrl,
    week: [row.views7, row.previews7, row.remixes7, conversions.week],
    month: [row.views30, row.previews30, row.remixes30, conversions.month],
    quarter: [row.views90, row.previews90, row.remixes90, conversions.quarter],
    conversionRates: {
      week: row.conversionRate7,
      month: row.conversionRate30,
      quarter: row.conversionRate90,
      lifetime: row.conversionRateAllTime,
    },
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
      conversionRate: row.conversionRateAllTime,
    },
    revenuePerConversion: row.price,
    newUserRate: estimateNewUserRate(row, currentPreviewGrowth),
    exposureStats,
    trendingFeatureCounts,
    ageDays: row.ageDays,
    isCurrentlyTrending,
    daysInTrending,
    daysSinceLastTrending,
    adminOverride,
    explorationCandidate,
    previewBase,
    previewGlow,
  };
}

export async function fetchTemplateSeeds(): Promise<TemplateSeed[]> {
  if (cachedSeeds && Date.now() - cachedAt < CACHE_TTL_MS) {
    return cachedSeeds;
  }

  try {
    const [rows] = await bigquery.query({ query: QUERY });
    let normalizedExposureRows: TemplateExposureSnapshotRow[] = [];

    try {
      const [exposureRows] = await bigquery.query({
        params: { configVersion: TEMPLATE_EXPOSURE_CONFIG_VERSION },
        query: TEMPLATE_EXPOSURE_QUERY,
      });
      normalizedExposureRows = exposureRows
        .map((row: Record<string, unknown>) => normalizeTemplateExposureSnapshotRow(row))
        .filter((row): row is TemplateExposureSnapshotRow => row !== null);
    } catch (error) {
      console.error(
        "Template exposure query failed, continuing without exposure history:",
        error,
      );
    }

    const normalizedRows = rows.map((row: Record<string, unknown>) =>
      normalizeBigQueryRow(row),
    );
    const exposureStatsByTemplateId = buildExposureStatsByTemplate(
      normalizedExposureRows,
    );
    const context: SeedSynthesisContext = {
      maxMonthViews: Math.max(...normalizedRows.map((row) => row.views30), 1),
      maxMonthRemixes: Math.max(...normalizedRows.map((row) => row.remixes30), 1),
    };
    const synthesizedSeeds = normalizedRows.map((row) =>
      synthesizeSeed(row, context, exposureStatsByTemplateId),
    );
    const seeds = applyManualTrendingOverrides(synthesizedSeeds);

    cachedSeeds = seeds;
    cachedAt = Date.now();
    return seeds;
  } catch (error) {
    console.error(
      "Primary BigQuery template query failed, using built-in fallback seeds:",
      error,
    );
    const fallbackSeeds = getDefaultTemplateSeeds();

    cachedSeeds = fallbackSeeds;
    cachedAt = Date.now();
    return fallbackSeeds;
  }
}
