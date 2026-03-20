"use client";

import Link from "next/link";
import { useCallback, useDeferredValue, useEffect, useMemo, useState, type CSSProperties } from "react";

import { PositionChangeBadge } from "@/features/marketplace/components/position-change-badge";
import type { PositionChange } from "@/features/marketplace/lib/position-change";
import {
  formatMetricValue,
  formatScore,
  getScoreBreakdown,
  getTemplateDisplayScore,
  getTemplatePipelineSnapshot,
  getTemplatesForDisplay,
  MAX_TEMPLATE_DISPLAY_COUNT,
  type TemplatePipelineSnapshot,
  type RankedTemplate,
  type RankedTemplateStats,
  type RankingSettings,
  type TemplateSeed,
} from "@/features/templates/lib/template-ranking";

type FilterOption<T extends string> = {
  label: string;
  value: T;
};

export type TemplatePricingFilterValue = "all" | "free" | "paid";
export type StatsFilterValue = "none" | "week" | "month";

const pricingFilterOptions: FilterOption<TemplatePricingFilterValue>[] = [
  { label: "All Templates", value: "all" },
  { label: "Free Templates", value: "free" },
  { label: "Paid Templates", value: "paid" },
];

const statsFilterOptions: FilterOption<StatsFilterValue>[] = [
  { label: "No Stats", value: "none" },
  { label: "Week Stats", value: "week" },
  { label: "Month Stats", value: "month" },
];

const templateStatsLabels: {
  key: keyof RankedTemplateStats;
  label: string;
}[] = [
  { label: "Views", key: "views" },
  { label: "Previews", key: "previews" },
  { label: "Remixes", key: "remixes" },
  { label: "Active Sites", key: "activeSites" },
  { label: "Conversions", key: "conversions" },
];

const templateDetailStatsLabels: {
  key: keyof RankedTemplateStats;
  label: string;
}[] = [
  { label: "Views", key: "views" },
  { label: "Previews", key: "previews" },
  { label: "Remixes", key: "remixes" },
  { label: "Active Sites", key: "activeSites" },
  { label: "Conversions", key: "conversions" },
];

type DetailStatsFilterValue = "week" | "month";

const detailStatsFilterOptions: FilterOption<DetailStatsFilterValue>[] = [
  { label: "Week Stats", value: "week" },
  { label: "Month Stats", value: "month" },
];

type TemplatesContentProps = {
  getTemplateHref: (template: RankedTemplate) => string;
  searchQuery: string;
  pricingFilter: TemplatePricingFilterValue;
  statsFilter: StatsFilterValue;
  positionChanges: ReadonlyMap<string, PositionChange>;
  rankedTemplates: RankedTemplate[];
  rankingSettings: RankingSettings;
  scoreBreakdownSeeds?: TemplateSeed[];
  selectedTemplate: RankedTemplate | null;
  showPositionChanges: boolean;
  onPricingFilterChange: (value: TemplatePricingFilterValue) => void;
  onStatsFilterChange: (value: StatsFilterValue) => void;
};

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

function getLevenshteinDistance(source: string, target: string) {
  const matrix = Array.from({ length: source.length + 1 }, () =>
    Array<number>(target.length + 1).fill(0),
  );

  for (let row = 0; row <= source.length; row += 1) {
    matrix[row][0] = row;
  }

  for (let column = 0; column <= target.length; column += 1) {
    matrix[0][column] = column;
  }

  for (let row = 1; row <= source.length; row += 1) {
    for (let column = 1; column <= target.length; column += 1) {
      const substitutionCost = source[row - 1] === target[column - 1] ? 0 : 1;

      matrix[row][column] = Math.min(
        matrix[row - 1][column] + 1,
        matrix[row][column - 1] + 1,
        matrix[row - 1][column - 1] + substitutionCost,
      );
    }
  }

  return matrix[source.length][target.length];
}

function getTemplateMatchScore(template: RankedTemplate, query: string) {
  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) {
    return 1;
  }

  const name = normalizeText(template.name);
  const creator = normalizeText(template.creator);
  const category = normalizeText(template.category);
  const nameParts = name.split(/\s+/);

  if (name === normalizedQuery) {
    return 100;
  }

  if (name.startsWith(normalizedQuery)) {
    return 90;
  }

  if (name.includes(normalizedQuery)) {
    return 80 - name.indexOf(normalizedQuery);
  }

  if (creator.includes(normalizedQuery)) {
    return 65;
  }

  if (category.includes(normalizedQuery)) {
    return 55;
  }

  if (
    normalizedQuery.length >= 3 &&
    nameParts.some((part) => getLevenshteinDistance(part, normalizedQuery) <= 2)
  ) {
    return 50;
  }

  return 0;
}

function FilterArrow() {
  return (
    <svg
      width="8"
      height="8"
      viewBox="0 0 8 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M1.25 2.5L4 5.25L6.75 2.5"
        stroke="#999999"
        strokeWidth="1.125"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FilterSelect<T extends string>({
  ariaLabel,
  onChange,
  options,
  value,
}: {
  ariaLabel: string;
  onChange: (value: T) => void;
  options: FilterOption<T>[];
  value: T;
}) {
  return (
    <label className="contentFilter">
      <select
        aria-label={ariaLabel}
        className="contentFilterSelect"
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <span className="contentFilterArrow">
        <FilterArrow />
      </span>
    </label>
  );
}

function getTemplatePreviewStyle(template: RankedTemplate) {
  return {
    "--template-preview-base": template.previewBase || "none",
    "--template-preview-glow": template.previewGlow || "none",
    "--template-preview-image": template.thumbnailUrl
      ? `url("${template.thumbnailUrl}")`
      : "none",
  } as CSSProperties;
}

function formatDateFromBaseDate(baseDate: Date, dayOffset: number) {
  const date = new Date(baseDate);
  date.setDate(date.getDate() + dayOffset);
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

type DetailStatRow = { label: string; value: string };
type TemplateDataRow = {
  label: string;
  source: string;
  usedBy: string;
  value: string;
};

function formatDataValue(value: boolean | number | string | null | undefined) {
  if (value === null || value === undefined) {
    return "Not available";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (typeof value === "number") {
    return Number.isInteger(value)
      ? formatMetricValue(value)
      : value.toFixed(2);
  }

  return value;
}

function getDetailRows(
  template: RankedTemplate,
  rankingSettings: RankingSettings,
  today: Date | null,
): DetailStatRow[] {
  const approvalDate = today
    ? formatDateFromBaseDate(today, -template.ageDays)
    : "--.--.----";
  const freshBoostExpirationDate = today
    ? formatDateFromBaseDate(
        today,
        rankingSettings.freshBoostDuration - template.ageDays,
      )
    : "--.--.----";
  const hasFreshBoost = template.ageDays <= rankingSettings.freshBoostDuration;
  const isPaid = template.pricingType === "paid";

  return [
    { label: "Approval Date", value: approvalDate },
    { label: "Template Age", value: `${template.ageDays}d` },
    { label: "Is Paid", value: isPaid ? "Yes" : "No" },
    {
      label: "Template Price",
      value: isPaid ? template.pricingLabel : "-",
    },
    {
      label: "New User Activations",
      value: String(template.stats.month.newUserActivations),
    },
    { label: "Is Trending", value: template.isCurrentlyTrending ? "Yes" : "No" },
    { label: "Days in Trending", value: String(template.daysInTrending) },
    { label: "Has Fresh Template Boost", value: hasFreshBoost ? "Yes" : "No" },
    { label: "Fresh Boost Start Date", value: approvalDate },
    {
      label: "Fresh Boost Expiration Date",
      value: freshBoostExpirationDate,
    },
    {
      label: "Admin Boost Flag",
      value: template.adminOverride === "great" ? "Yes" : "-",
    },
    {
      label: "Admin Decay Flag",
      value: template.adminOverride === "bad" ? "Yes" : "-",
    },
  ];
}

function getPipelineRows(
  template: RankedTemplate,
  rankingSettings: RankingSettings,
  pipelineSnapshot: TemplatePipelineSnapshot | null,
): DetailStatRow[] {
  return [
    { label: "Base Ranking Score", value: formatScore(template.rankingScore) },
    { label: "Final Feed Score", value: formatScore(template.finalScore) },
    {
      label: "Rotation Multiplier",
      value:
        pipelineSnapshot?.rotationMultiplier === null ||
        pipelineSnapshot?.rotationMultiplier === undefined
          ? "-"
          : pipelineSnapshot.rotationMultiplier.toFixed(2),
    },
    { label: "Display Score", value: formatScore(getTemplateDisplayScore(template)) },
    {
      label: "Feed Eligible",
      value: pipelineSnapshot?.feedEligible ? "Yes" : "No",
    },
    {
      label: "Ineligibility Reason",
      value: pipelineSnapshot?.feedIneligibilityLabel ?? "Eligible",
    },
    {
      label: "Age Priority Candidate",
      value: pipelineSnapshot?.agePriorityCandidate ? "Yes" : "No",
    },
    {
      label: "Reserved Share Applied",
      value: pipelineSnapshot?.reservedAgePriorityApplied ? "Yes" : "No",
    },
    {
      label: "Age Priority Reserved Share",
      value: `${rankingSettings.agePriorityReservedShare}%`,
    },
    {
      label: "Feed Position",
      value:
        pipelineSnapshot?.feedPosition === null ||
        pipelineSnapshot?.feedPosition === undefined
          ? "-"
          : `#${String(pipelineSnapshot.feedPosition + 1)}`,
    },
    {
      label: "Display Position",
      value:
        pipelineSnapshot?.displayPosition === null ||
        pipelineSnapshot?.displayPosition === undefined
          ? "-"
          : `#${String(pipelineSnapshot.displayPosition + 1)}`,
    },
  ];
}

function getTemplateDataRows(
  template: RankedTemplate,
  templateSeed?: TemplateSeed | null,
): TemplateDataRow[] {
  const quarter = templateSeed?.quarter;

  return [
    {
      label: "Title",
      value: template.name,
      usedBy: "Template identity and detail page slug",
      source: "template_stats.title",
    },
    {
      label: "Creator",
      value: template.creator,
      usedBy: "Creator cap and search",
      source: "template_stats.creator",
    },
    {
      label: "Category",
      value: template.category,
      usedBy: "Category cap and search",
      source: "templates.categories[0]",
    },
    {
      label: "Price",
      value: template.pricingLabel,
      usedBy: "Pricing split and revenue-per-conversion",
      source: "template_stats.price",
    },
    {
      label: "Age (days)",
      value: formatDataValue(template.ageDays),
      usedBy: "Fresh boost and age priority",
      source: "DATE_DIFF(CURRENT_DATE(), template_stats.published_date, DAY)",
    },
    {
      label: "7d Views",
      value: formatDataValue(templateSeed?.week[0] ?? template.stats.week.views),
      usedBy: "Views weight and recency scoring",
      source: "template_stats.views_l7",
    },
    {
      label: "30d Views",
      value: formatDataValue(templateSeed?.month[0] ?? template.stats.month.views),
      usedBy: "Views weight and recency scoring",
      source: "template_stats.views_l30",
    },
    {
      label: "90d Views",
      value: formatDataValue(quarter?.[0]),
      usedBy: "90d lookback and lifetime blend",
      source: "template_stats.views_l90",
    },
    {
      label: "All-time Views",
      value: formatDataValue(templateSeed?.lifetime?.views),
      usedBy: "Used when Lifetime source is set to all-time",
      source: "template_stats.views_all_time",
    },
    {
      label: "7d Previews",
      value: formatDataValue(templateSeed?.week[1] ?? template.stats.week.previews),
      usedBy: "Preview weight, preview rate, CTR threshold",
      source: "template_stats.visitors_l7",
    },
    {
      label: "30d Previews",
      value: formatDataValue(templateSeed?.month[1] ?? template.stats.month.previews),
      usedBy: "Preview weight, preview rate, CTR threshold",
      source: "template_stats.visitors_l30",
    },
    {
      label: "90d Previews",
      value: formatDataValue(quarter?.[1]),
      usedBy: "90d lookback and lifetime blend",
      source: "template_stats.visitors_l90",
    },
    {
      label: "All-time Previews",
      value: formatDataValue(templateSeed?.lifetime?.previews),
      usedBy: "Used when Lifetime source is set to all-time",
      source: "template_stats.visitors_all_time",
    },
    {
      label: "7d Remixes",
      value: formatDataValue(templateSeed?.week[2] ?? template.stats.week.remixes),
      usedBy: "Remix weight and remix rate",
      source: "template_stats.unique_user_remixes_l7",
    },
    {
      label: "30d Remixes",
      value: formatDataValue(templateSeed?.month[2] ?? template.stats.month.remixes),
      usedBy: "Remix weight and remix rate",
      source: "template_stats.unique_user_remixes_l30",
    },
    {
      label: "90d Remixes",
      value: formatDataValue(quarter?.[2]),
      usedBy: "90d lookback and lifetime blend",
      source: "template_stats.unique_user_remixes_l90",
    },
    {
      label: "All-time Remixes",
      value: formatDataValue(templateSeed?.lifetime?.remixes),
      usedBy: "Used when Lifetime source is set to all-time",
      source: "template_stats.unique_user_remixes_all_time",
    },
    {
      label: "7d Active Sites",
      value: formatDataValue(template.stats.week.activeSites),
      usedBy: "Active Sites weight and Active Site Rate",
      source: "template_stats.active_sites_l7",
    },
    {
      label: "30d Active Sites",
      value: formatDataValue(template.stats.month.activeSites),
      usedBy: "Active Sites weight and Active Site Rate",
      source: "template_stats.active_sites_l30",
    },
    {
      label: "90d Active Sites",
      value: formatDataValue(templateSeed?.activeSites?.quarter),
      usedBy: "90d lookback and lifetime blend",
      source: "template_stats.active_sites_l90",
    },
    {
      label: "All-time Active Sites",
      value: formatDataValue(templateSeed?.lifetime?.activeSites),
      usedBy: "Used when Lifetime source is set to all-time",
      source: "template_stats.active_sites_all_time",
    },
    {
      label: "7d Conversions",
      value: formatDataValue(templateSeed?.week[3] ?? template.stats.week.conversions),
      usedBy: "Conversion, conversion rate, and revenue scoring",
      source: "Not in BigQuery yet",
    },
    {
      label: "30d Conversions",
      value: formatDataValue(templateSeed?.month[3] ?? template.stats.month.conversions),
      usedBy: "Conversion, conversion rate, and revenue scoring",
      source: "Not in BigQuery yet",
    },
    {
      label: "90d Conversions",
      value: formatDataValue(quarter?.[3]),
      usedBy: "90d lookback and lifetime blend",
      source: "Not in BigQuery yet",
    },
    {
      label: "All-time Conversions",
      value: formatDataValue(templateSeed?.lifetime?.conversions),
      usedBy: "Used when Lifetime source is set to all-time",
      source: "template_stats.sales",
    },
    {
      label: "New User Rate",
      value: formatDataValue(templateSeed?.newUserRate),
      usedBy: "New User Activation boost",
      source: "Not in BigQuery yet",
    },
    {
      label: "Currently Trending",
      value: formatDataValue(template.isCurrentlyTrending),
      usedBy: "Trending rotation eligibility",
      source: "Not in BigQuery yet",
    },
    {
      label: "Days in Trending",
      value: formatDataValue(template.daysInTrending),
      usedBy: "Trending duration decay and max days",
      source: "Not in BigQuery yet",
    },
    {
      label: "Days Since Last Trending",
      value: formatDataValue(
        template.isCurrentlyTrending ? null : templateSeed?.daysSinceLastTrending,
      ),
      usedBy: "Trending cooldown",
      source: "Not in BigQuery yet",
    },
    {
      label: "Trending Feature Count (30d)",
      value: formatDataValue(
        templateSeed?.trendingFeatureCounts?.last30Days ??
          template.trendingFeatureCounts.last30Days,
      ),
      usedBy: "Repeat feature decay when window is 30d",
      source: "Not in BigQuery yet",
    },
    {
      label: "Trending Feature Count (90d)",
      value: formatDataValue(
        templateSeed?.trendingFeatureCounts?.last90Days ??
          template.trendingFeatureCounts.last90Days,
      ),
      usedBy: "Repeat feature decay when window is 90d",
      source: "Not in BigQuery yet",
    },
    {
      label: "Trending Feature Count (Lifetime)",
      value: formatDataValue(
        templateSeed?.trendingFeatureCounts?.lifetime ??
          template.trendingFeatureCounts.lifetime,
      ),
      usedBy: "Reference count for historical Trending exposure",
      source: "Not in BigQuery yet",
    },
    {
      label: "Exploration Candidate",
      value: formatDataValue(template.explorationCandidate),
      usedBy: "Reserved feed slots",
      source: "Not in BigQuery yet",
    },
    {
      label: "Momentum Preview Growth",
      value: formatDataValue(templateSeed?.momentum.previewGrowth),
      usedBy: "Momentum weight and acceleration",
      source: "Not in BigQuery yet",
    },
    {
      label: "Momentum Remix Growth",
      value: formatDataValue(templateSeed?.momentum.remixGrowth),
      usedBy: "Momentum weight and acceleration",
      source: "Not in BigQuery yet",
    },
    {
      label: "Previous Preview Growth",
      value: formatDataValue(templateSeed?.momentum.previousPreviewGrowth),
      usedBy: "Acceleration baseline",
      source: "Not in BigQuery yet",
    },
    {
      label: "Previous Remix Growth",
      value: formatDataValue(templateSeed?.momentum.previousRemixGrowth),
      usedBy: "Acceleration baseline",
      source: "Not in BigQuery yet",
    },
    {
      label: "Admin Override",
      value: template.adminOverride,
      usedBy: "Admin boost/decay overrides",
      source: "Not in BigQuery yet",
    },
  ];
}

type DetailTab = "statistics" | "score-breakdown" | "pipeline" | "data";

function TemplateDetailView({
  scoreBreakdownSeeds,
  templateSeed,
  template,
  rankingSettings,
  pipelineSnapshot,
}: {
  scoreBreakdownSeeds?: TemplateSeed[];
  templateSeed?: TemplateSeed | null;
  template: RankedTemplate;
  rankingSettings: RankingSettings;
  pipelineSnapshot: TemplatePipelineSnapshot | null;
}) {
  const [detailStatsFilter, setDetailStatsFilter] =
    useState<DetailStatsFilterValue>("week");
  const [activeTab, setActiveTab] = useState<DetailTab>("statistics");
  const [today, setToday] = useState<Date | null>(null);
  const stats = template.stats[detailStatsFilter];
  const scoreBreakdown = getScoreBreakdown(
    template.name,
    rankingSettings,
    scoreBreakdownSeeds,
  );
  const templateLink = `www.${template.name.toLowerCase()}.framer.website`;

  useEffect(() => {
    setToday(new Date());
  }, []);

  const detailRows = getDetailRows(template, rankingSettings, today);
  const pipelineRows = getPipelineRows(
    template,
    rankingSettings,
    pipelineSnapshot,
  );
  const dataRows = getTemplateDataRows(template, templateSeed);

  return (
    <section className="contentPane">
      <div className="contentShell">
        <div className="detailWrap">
          <div className="detailTop">
            <div className="detailTitle">
              <div className="detailTitleText">
                <h1 className="detailName">{template.name}</h1>
                <span className="detailLink">{templateLink}</span>
              </div>
            </div>
            <FilterSelect
              ariaLabel="Filter detail stats range"
              options={detailStatsFilterOptions}
              value={detailStatsFilter}
              onChange={setDetailStatsFilter}
            />
          </div>

          <div className="detailHero">
            <div
              className="detailThumbnail"
              style={getTemplatePreviewStyle(template)}
            />
            <div className="detailStats">
              <div className="detailStatsHeader">
                <span className="detailStatsName">{template.name}</span>
                <div className="templateBadges">
                  <span className="templateBadge muted">{template.pricingLabel}</span>
                    <span className="templateBadge">
                      {formatScore(getTemplateDisplayScore(template))} Score
                    </span>
                  </div>
                </div>
              {templateDetailStatsLabels.map((stat) => (
                <div key={stat.key} className="detailStatRow">
                  <span className="detailStatLabel">{stat.label}</span>
                  <span className="detailStatValue">
                    {formatMetricValue(stats[stat.key])}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="detailTabs">
            <div className="detailTabList">
              <button
                className={activeTab === "statistics" ? "detailTab active" : "detailTab"}
                onClick={() => setActiveTab("statistics")}
              >
                Statistics
              </button>
              <button
                className={activeTab === "score-breakdown" ? "detailTab active" : "detailTab"}
                onClick={() => setActiveTab("score-breakdown")}
              >
                Score breakdown
              </button>
              <button
                className={activeTab === "pipeline" ? "detailTab active" : "detailTab"}
                onClick={() => setActiveTab("pipeline")}
              >
                Pipeline
              </button>
              <button
                className={activeTab === "data" ? "detailTab active" : "detailTab"}
                onClick={() => setActiveTab("data")}
              >
                Data
              </button>
              <button className="detailTab" disabled>Tables</button>
            </div>
            <div className="detailTabDivider" />
          </div>

          {activeTab === "statistics" ? (
            <div className="detailTable">
              <div className="detailTableHeader">
                <span className="detailTableHeaderCell">Name</span>
                <span className="detailTableHeaderCell">Score</span>
              </div>
              {detailRows.map((row) => (
                <div key={row.label} className="detailTableRow">
                  <span className="detailTableCell">{row.label}</span>
                  <span className="detailTableCell">{row.value}</span>
                </div>
              ))}
            </div>
          ) : activeTab === "score-breakdown" ? (
            <div className="detailTable threeCol">
              <div className="detailTableHeader">
                <span className="detailTableHeaderCell">Component</span>
                <span className="detailTableHeaderCell">Score</span>
                <span className="detailTableHeaderCell alignRight">Total</span>
              </div>
              {scoreBreakdown.map((row) => (
                <div key={row.label} className="detailTableRow">
                  <span className="detailTableCell">{row.label}</span>
                  <span className="detailTableCell">{row.score.toFixed(1)}</span>
                  <span className="detailTableCell alignRight">{row.total.toFixed(1)}</span>
                </div>
              ))}
            </div>
          ) : activeTab === "pipeline" ? (
            <div className="detailTable">
              <div className="detailTableHeader">
                <span className="detailTableHeaderCell">Stage</span>
                <span className="detailTableHeaderCell">Value</span>
              </div>
              {pipelineRows.map((row) => (
                <div key={row.label} className="detailTableRow">
                  <span className="detailTableCell">{row.label}</span>
                  <span className="detailTableCell">{row.value}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="detailTable">
              <div className="detailTableHeader">
                <span className="detailTableHeaderCell">Data Point</span>
                <span className="detailTableHeaderCell">Value</span>
                <span className="detailTableHeaderCell">Used By</span>
                <span className="detailTableHeaderCell">BigQuery Source</span>
              </div>
              {dataRows.map((row) => (
                <div key={row.label} className="detailTableRow">
                  <span className="detailTableCell">{row.label}</span>
                  <span className="detailTableCell">{row.value}</span>
                  <span className="detailTableCell">{row.usedBy}</span>
                  <span className="detailTableCell">{row.source}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

const PAGE_SIZE = 48;

export function TemplatesContent({
  getTemplateHref,
  onPricingFilterChange,
  onStatsFilterChange,
  pricingFilter,
  positionChanges,
  rankedTemplates: allRankedTemplates,
  rankingSettings,
  scoreBreakdownSeeds,
  searchQuery,
  selectedTemplate,
  showPositionChanges,
  statsFilter,
}: TemplatesContentProps) {
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const rankedTemplates =
    pricingFilter === "all"
      ? allRankedTemplates
      : allRankedTemplates.filter(
          (template) => template.pricingType === pricingFilter,
        );
  const visibleTemplates = useMemo(() =>
    deferredSearchQuery.trim()
      ? rankedTemplates
          .map((template) => ({
            searchScore: getTemplateMatchScore(template, deferredSearchQuery),
            template,
          }))
          .filter(({ searchScore }) => searchScore > 0)
          .sort(
            (left, right) =>
              right.searchScore - left.searchScore ||
              getTemplateDisplayScore(right.template) -
                getTemplateDisplayScore(left.template),
          )
          .map(({ template }) => template)
          .slice(0, MAX_TEMPLATE_DISPLAY_COUNT)
      : getTemplatesForDisplay(rankedTemplates, rankingSettings),
    [deferredSearchQuery, rankedTemplates, rankingSettings],
  );
  const [pageCount, setPageCount] = useState(1);

  // Reset pagination when filters or search change
  useEffect(() => {
    setPageCount(1);
  }, [deferredSearchQuery, pricingFilter]);

  const displayedTemplates = visibleTemplates.slice(0, pageCount * PAGE_SIZE);
  const hasMore = displayedTemplates.length < visibleTemplates.length;
  const loadMore = useCallback(() => setPageCount((c) => c + 1), []);
  const visibleStats = statsFilter === "none" ? null : statsFilter;

  if (selectedTemplate) {
    const freshTemplate =
      allRankedTemplates.find((t) => t.name === selectedTemplate.name);
    const templateSeed = scoreBreakdownSeeds?.find(
      (seed) => seed.name === selectedTemplate.name,
    );
    const resolvedTemplate = freshTemplate ?? selectedTemplate;
    const pipelineSnapshot = getTemplatePipelineSnapshot(
      allRankedTemplates,
      rankingSettings,
      resolvedTemplate.name,
    );
    return (
      <TemplateDetailView
        pipelineSnapshot={pipelineSnapshot}
        scoreBreakdownSeeds={scoreBreakdownSeeds}
        templateSeed={templateSeed}
        template={resolvedTemplate}
        rankingSettings={rankingSettings}
      />
    );
  }

  return (
    <section className="contentPane">
      <div className="contentShell">
        <div className="contentBody">
          <div className="contentTop">
            <div className="contentTitleWrap">
              <h1 className="contentTitle">Templates</h1>
              <span className="contentCount">{visibleTemplates.length} of {rankedTemplates.length}</span>
            </div>

            <div className="contentFilters" aria-label="Template filters">
              <FilterSelect
                ariaLabel="Filter templates by pricing"
                options={pricingFilterOptions}
                value={pricingFilter}
                onChange={onPricingFilterChange}
              />
              <FilterSelect
                ariaLabel="Filter template stats range"
                options={statsFilterOptions}
                value={statsFilter}
                onChange={onStatsFilterChange}
              />
            </div>
          </div>

          <div className="templateGrid">
            {displayedTemplates.map((template) => {
              const stats = visibleStats ? template.stats[visibleStats] : null;

              return (
                <Link
                  key={template.name}
                  href={getTemplateHref(template)}
                  className={stats ? "templateCard hasStats" : "templateCard"}
                >
                  <div
                    className="templateImagePlaceholder"
                    style={getTemplatePreviewStyle(template)}
                  >
                    {showPositionChanges ? (
                      <PositionChangeBadge
                        change={positionChanges.get(template.name)}
                      />
                    ) : null}
                  </div>

                  <div className="templateCardHeader">
                    <div className="templateNameWrap">
                      <span className="templateName">{template.name}</span>
                      <span className="templateMeta">
                        {template.creator} · {template.category}
                      </span>
                    </div>

                    <div className="templateBadges">
                      <span className="templateBadge muted">{template.pricingLabel}</span>
                      <span className="templateBadge">
                        {formatScore(getTemplateDisplayScore(template))} Score
                      </span>
                    </div>
                  </div>

                  {stats
                    ? templateStatsLabels.map((stat) => (
                        <div key={stat.key} className="templateStatRow">
                          <span className="templateStatLabel">{stat.label}</span>
                          <span className="templateStatValue">
                            {formatMetricValue(stats[stat.key])}
                          </span>
                        </div>
                      ))
                    : null}
                </Link>
              );
            })}
          </div>
          {hasMore ? (
            <button className="loadMoreButton" onClick={loadMore}>
              Load more ({visibleTemplates.length - displayedTemplates.length} remaining)
            </button>
          ) : null}
          {visibleTemplates.length === 0 ? (
            <p className="templateEmptyState">
              No templates match the current search and filters.
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
