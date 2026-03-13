"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { interleaveByPricing } from "@/features/marketplace/lib/pricing-order";
import {
  formatScore,
  type RankedTemplate,
} from "@/features/templates/lib/template-ranking";

const PAGE_SIZE = 20;

type TemplateListSidebarProps = {
  getTemplateHref: (template: RankedTemplate) => string;
  templates: RankedTemplate[];
  selectedTemplateName: string | null;
  searchQuery: string;
  onSearchChange: (value: string) => void;
};

export function TemplateListSidebar({
  getTemplateHref,
  templates,
  selectedTemplateName,
  searchQuery,
  onSearchChange,
}: TemplateListSidebarProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredTemplates = normalizedQuery
    ? interleaveByPricing(
        templates.filter(
          (t) =>
            t.name.toLowerCase().includes(normalizedQuery) ||
            t.creator.toLowerCase().includes(normalizedQuery) ||
            t.category.toLowerCase().includes(normalizedQuery),
        ),
      )
    : templates;
  const visibleTemplates = filteredTemplates.slice(0, visibleCount);
  const hasMore = visibleCount < filteredTemplates.length;

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filteredTemplates.length));
  }, [filteredTemplates.length]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "100px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filteredTemplates.length]);

  return (
    <aside className="sidebar templateListSidebar">
      <div className="searchWrap">
        <input
          className="searchInput"
          type="search"
          placeholder="Search..."
          aria-label="Search templates"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <div className="templateListRows">
        {visibleTemplates.map((template) => {
          const isActive = template.name === selectedTemplateName;

          return (
            <Link
              key={template.name}
              href={getTemplateHref(template)}
              className={
                isActive ? "templateListRow active" : "templateListRow"
              }
            >
              <span className="templateListName">{template.name}</span>
              <div className="templateListBadges">
                <span className="templateBadge muted">
                  {template.pricingLabel}
                </span>
                <span className="templateBadge">
                  {formatScore(template.finalScore)} Score
                </span>
              </div>
            </Link>
          );
        })}
        {hasMore ? <div ref={sentinelRef} className="templateListSentinel" /> : null}
      </div>
    </aside>
  );
}
