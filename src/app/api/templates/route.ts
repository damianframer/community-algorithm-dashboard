import { BigQuery } from "@google-cloud/bigquery";
import { NextResponse } from "next/server";

import type { TemplateSeed } from "@/features/templates/lib/template-ranking";

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
    s.remixes_l7,
    s.remixes_l30,
    s.remixes_l90,
    s.unique_user_remixes_l7,
    s.unique_user_remixes_l30,
    s.unique_user_remixes_l90,
    s.conversion_rate_l7,
    s.conversion_rate_l30,
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
let cachedSeeds: TemplateSeed[] | null = null;
let cachedAt = 0;

function buildThumbnailUrl(rawUrl: string): string {
  return `https://www.framer.com/creators-assets/_next/image/?url=${encodeURIComponent(rawUrl)}&w=3840&q=100`;
}

async function fetchSeeds(): Promise<TemplateSeed[]> {
  if (cachedSeeds && Date.now() - cachedAt < CACHE_TTL_MS) {
    return cachedSeeds;
  }

  const [rows] = await bigquery.query({ query: QUERY });

  const seeds: TemplateSeed[] = rows.map((row: Record<string, unknown>) => {
    const price = Number(row.price) || 0;
    const isFree = price === 0;

    return {
      name: row.title as string,
      creator: (row.creator as string) || "Unknown",
      category: Array.isArray(row.categories) && row.categories.length > 0
        ? row.categories[0] as string
        : "Other",
      pricingType: isFree ? "free" : "paid",
      pricingLabel: isFree ? "Free" : `$${price}`,
      thumbnailUrl: row.thumbnail ? buildThumbnailUrl(row.thumbnail as string) : undefined,
      week: [
        Number(row.views_l7) || 0,
        Number(row.visitors_l7) || 0,
        Number(row.remixes_l7) || 0,
        Number(row.unique_user_remixes_l7) || 0,
      ],
      month: [
        Number(row.views_l30) || 0,
        Number(row.visitors_l30) || 0,
        Number(row.remixes_l30) || 0,
        Number(row.unique_user_remixes_l30) || 0,
      ],
      quarter: [
        Number(row.views_l90) || 0,
        Number(row.visitors_l90) || 0,
        Number(row.remixes_l90) || 0,
        Number(row.unique_user_remixes_l90) || 0,
      ],
      revenuePerConversion: price,
      newUserRate: 0, // TODO: not available in BigQuery yet — needs new user tracking data
      ageDays: Number(row.age_days) || 0,
      isCurrentlyTrending: false, // TODO: no trending state in BigQuery yet
      daysInTrending: 0,
      daysSinceLastTrending: null,
      adminOverride: "none",
      explorationCandidate: false, // TODO: no exploration flag in BigQuery yet
      momentum: {
        // TODO: momentum needs week-over-week snapshot data in BigQuery
        previewGrowth: 0,
        remixGrowth: 0,
        previousPreviewGrowth: 0,
        previousRemixGrowth: 0,
      },
      previewBase: "",
      previewGlow: "",
    } satisfies TemplateSeed;
  });

  cachedSeeds = seeds;
  cachedAt = Date.now();
  return seeds;
}

export async function GET() {
  try {
    const seeds = await fetchSeeds();
    return NextResponse.json(seeds);
  } catch (error) {
    console.error("BigQuery query failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch template data" },
      { status: 500 },
    );
  }
}
