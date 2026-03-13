"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useState, type CSSProperties } from "react";

import { PositionChangeBadge } from "@/features/marketplace/components/position-change-badge";
import type { PositionChange } from "@/features/marketplace/lib/position-change";
import { interleaveByPricing } from "@/features/marketplace/lib/pricing-order";
import {
  applyFeedRules,
  formatMetricValue,
  formatScore,
  getScoreBreakdown,
  type RankedTemplate,
  type RankedTemplateStats,
  type RankingSettings,
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
  { label: "Conversions", key: "conversions" },
];

const templateDetailStatsLabels: {
  key: keyof RankedTemplateStats;
  label: string;
}[] = [
  { label: "Views", key: "views" },
  { label: "Previews", key: "previews" },
  { label: "Remixes", key: "remixes" },
  { label: "Conversions", key: "conversions" },
  { label: "Revenue", key: "revenue" },
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
    "--template-preview-base": template.previewBase,
    "--template-preview-glow": template.previewGlow,
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

type DetailTab = "statistics" | "score-breakdown";

function TemplateDetailView({
  template,
  rankingSettings,
}: {
  template: RankedTemplate;
  rankingSettings: RankingSettings;
}) {
  const [detailStatsFilter, setDetailStatsFilter] =
    useState<DetailStatsFilterValue>("week");
  const [activeTab, setActiveTab] = useState<DetailTab>("statistics");
  const [today, setToday] = useState<Date | null>(null);
  const stats = template.stats[detailStatsFilter];
  const scoreBreakdown = getScoreBreakdown(template.name, rankingSettings);
  const templateLink = `www.${template.name.toLowerCase()}.framer.website`;

  useEffect(() => {
    setToday(new Date());
  }, []);

  const detailRows = getDetailRows(template, rankingSettings, today);

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
                    {formatScore(template.finalScore)} Score
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
          ) : (
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
          )}
        </div>
      </div>
    </section>
  );
}

export function TemplatesContent({
  getTemplateHref,
  onPricingFilterChange,
  onStatsFilterChange,
  pricingFilter,
  positionChanges,
  rankedTemplates: allRankedTemplates,
  rankingSettings,
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
  const visibleTemplates = deferredSearchQuery.trim()
    ? rankedTemplates
        .map((template) => ({
          searchScore: getTemplateMatchScore(template, deferredSearchQuery),
          template,
        }))
        .filter(({ searchScore }) => searchScore > 0)
        .sort(
          (left, right) =>
            right.searchScore - left.searchScore ||
            right.template.finalScore - left.template.finalScore,
        )
        .map(({ template }) => template)
    : interleaveByPricing(applyFeedRules(rankedTemplates, rankingSettings));
  const visibleStats = statsFilter === "none" ? null : statsFilter;

  if (selectedTemplate) {
    const freshTemplate = rankedTemplates.find((t) => t.name === selectedTemplate.name);
    return (
      <TemplateDetailView
        template={freshTemplate ?? selectedTemplate}
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
              <span className="contentCount">{visibleTemplates.length}</span>
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
            {visibleTemplates.map((template) => {
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
                        {formatScore(template.finalScore)} Score
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
