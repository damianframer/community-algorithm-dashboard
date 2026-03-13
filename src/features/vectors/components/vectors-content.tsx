"use client";

import { useDeferredValue } from "react";

import { PositionChangeBadge } from "@/features/marketplace/components/position-change-badge";
import type { PositionChange } from "@/features/marketplace/lib/position-change";
import { formatScore } from "@/features/templates/lib/template-ranking";

import type { RankedVector } from "@/features/vectors/lib/vector-ranking";

type VectorsContentProps = {
  positionChanges: ReadonlyMap<string, PositionChange>;
  vectors: RankedVector[];
  searchQuery: string;
  showPositionChanges: boolean;
};

function getVectorMatchScore(vector: RankedVector, query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return 1;
  }

  const normalizedName = vector.name.toLowerCase();

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

export function VectorsContent({
  positionChanges,
  vectors: allVectors,
  searchQuery,
  showPositionChanges,
}: VectorsContentProps) {
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const visibleVectors = deferredSearchQuery.trim()
    ? allVectors
        .map((vector) => ({
          vector,
          searchScore: getVectorMatchScore(vector, deferredSearchQuery),
        }))
        .filter(({ searchScore }) => searchScore > 0)
        .sort(
          (left, right) =>
            right.searchScore - left.searchScore ||
            right.vector.finalScore - left.vector.finalScore,
        )
        .map(({ vector }) => vector)
    : allVectors;

  return (
    <section className="contentPane">
      <div className="contentShell">
        <div className="contentBody">
          <div className="contentTop">
            <div className="contentTitleWrap">
              <h1 className="contentTitle">Vectors</h1>
              <span className="contentCount">{visibleVectors.length}</span>
            </div>
          </div>

          <div className="pluginGrid">
            {visibleVectors.map((vector) => (
              <article key={vector.name} className="pluginCard">
                <div className="pluginThumbnail">
                  {showPositionChanges ? (
                    <PositionChangeBadge
                      change={positionChanges.get(vector.name)}
                    />
                  ) : null}
                </div>

                <div className="templateCardHeader">
                  <div className="templateNameWrap">
                    <span className="templateName">{vector.name}</span>
                  </div>

                  <div className="templateBadges">
                    <span className="templateBadge muted">{vector.pricingLabel}</span>
                    <span className="templateBadge">
                      {formatScore(vector.finalScore)} Score
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {visibleVectors.length === 0 ? (
            <p className="templateEmptyState">
              No vectors match the current search and settings.
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
