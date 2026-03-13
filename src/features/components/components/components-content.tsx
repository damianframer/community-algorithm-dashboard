"use client";

import { useDeferredValue } from "react";

import { PositionChangeBadge } from "@/features/marketplace/components/position-change-badge";
import type { PositionChange } from "@/features/marketplace/lib/position-change";
import { interleaveByPricing } from "@/features/marketplace/lib/pricing-order";
import { formatScore } from "@/features/templates/lib/template-ranking";

import type { RankedComponent } from "@/features/components/lib/component-ranking";

type ComponentsContentProps = {
  components: RankedComponent[];
  positionChanges: ReadonlyMap<string, PositionChange>;
  searchQuery: string;
  showPositionChanges: boolean;
};

function getComponentMatchScore(component: RankedComponent, query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return 1;
  }

  const normalizedName = component.name.toLowerCase();

  if (normalizedName === normalizedQuery) {
    return 100;
  }

  if (normalizedName.startsWith(normalizedQuery)) {
    return 80;
  }

  if (normalizedName.includes(normalizedQuery)) {
    return 60 - normalizedName.indexOf(normalizedQuery);
  }

  return 0;
}

export function ComponentsContent({
  components: allComponents,
  positionChanges,
  searchQuery,
  showPositionChanges,
}: ComponentsContentProps) {
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const visibleComponents = deferredSearchQuery.trim()
    ? interleaveByPricing(
        allComponents
        .map((component) => ({
          component,
          searchScore: getComponentMatchScore(component, deferredSearchQuery),
        }))
        .filter(({ searchScore }) => searchScore > 0)
        .sort(
          (left, right) =>
            right.searchScore - left.searchScore ||
            right.component.finalScore - left.component.finalScore,
        )
        .map(({ component }) => component),
      )
    : allComponents;

  return (
    <section className="contentPane">
      <div className="contentShell">
        <div className="contentBody">
          <div className="contentTop">
            <div className="contentTitleWrap">
              <h1 className="contentTitle">Components</h1>
              <span className="contentCount">{visibleComponents.length}</span>
            </div>
          </div>

          <div className="pluginGrid">
            {visibleComponents.map((component) => (
              <article key={component.name} className="pluginCard">
                <div className="pluginThumbnail">
                  {showPositionChanges ? (
                    <PositionChangeBadge
                      change={positionChanges.get(component.name)}
                    />
                  ) : null}
                </div>

                <div className="templateCardHeader">
                  <div className="templateNameWrap">
                    <span className="templateName">{component.name}</span>
                  </div>

                  <div className="templateBadges">
                    <span className="templateBadge muted">{component.pricingLabel}</span>
                    <span className="templateBadge">
                      {formatScore(component.finalScore)} Score
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {visibleComponents.length === 0 ? (
            <p className="templateEmptyState">
              No components match the current search and settings.
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
