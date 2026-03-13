"use client";

import { useDeferredValue } from "react";

import { formatScore } from "@/features/templates/lib/template-ranking";

import type { RankedTutorial } from "@/features/tutorials/lib/tutorial-ranking";

type TutorialsContentProps = {
  tutorials: RankedTutorial[];
  searchQuery: string;
};

function getTutorialMatchScore(tutorial: RankedTutorial, query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return 1;
  }

  const normalizedName = tutorial.name.toLowerCase();

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

export function TutorialsContent({
  tutorials: allTutorials,
  searchQuery,
}: TutorialsContentProps) {
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const visibleTutorials = deferredSearchQuery.trim()
    ? allTutorials
        .map((tutorial) => ({
          tutorial,
          searchScore: getTutorialMatchScore(tutorial, deferredSearchQuery),
        }))
        .filter(({ searchScore }) => searchScore > 0)
        .sort(
          (left, right) =>
            right.searchScore - left.searchScore ||
            right.tutorial.finalScore - left.tutorial.finalScore,
        )
        .map(({ tutorial }) => tutorial)
    : allTutorials;

  return (
    <section className="contentPane">
      <div className="contentShell">
        <div className="contentBody">
          <div className="contentTop">
            <div className="contentTitleWrap">
              <h1 className="contentTitle">Tutorials</h1>
              <span className="contentCount">{visibleTutorials.length}</span>
            </div>
          </div>

          <div className="pluginGrid">
            {visibleTutorials.map((tutorial) => (
              <article key={tutorial.name} className="pluginCard">
                <div className="pluginThumbnail" aria-hidden="true" />

                <div className="templateCardHeader">
                  <div className="templateNameWrap">
                    <span className="templateName">{tutorial.name}</span>
                  </div>

                  <div className="templateBadges">
                    <span className="templateBadge muted">
                      {tutorial.durationMinutes}min
                    </span>
                    <span className="templateBadge">
                      {formatScore(tutorial.finalScore)} Score
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {visibleTutorials.length === 0 ? (
            <p className="templateEmptyState">
              No tutorials match the current search and settings.
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
