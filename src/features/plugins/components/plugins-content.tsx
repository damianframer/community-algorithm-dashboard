"use client";

import { useDeferredValue } from "react";

import { formatScore } from "@/features/templates/lib/template-ranking";

import type { RankedPlugin } from "@/features/plugins/lib/plugin-ranking";

type PluginsContentProps = {
  plugins: RankedPlugin[];
  searchQuery: string;
};

function getPluginMatchScore(plugin: RankedPlugin, query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return 1;
  }

  const normalizedName = plugin.name.toLowerCase();

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

export function PluginsContent({
  plugins: allPlugins,
  searchQuery,
}: PluginsContentProps) {
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const visiblePlugins = deferredSearchQuery.trim()
    ? allPlugins
        .map((plugin) => ({
          plugin,
          searchScore: getPluginMatchScore(plugin, deferredSearchQuery),
        }))
        .filter(({ searchScore }) => searchScore > 0)
        .sort(
          (left, right) =>
            right.searchScore - left.searchScore ||
            right.plugin.finalScore - left.plugin.finalScore,
        )
        .map(({ plugin }) => plugin)
    : allPlugins;

  return (
    <section className="contentPane">
      <div className="contentShell">
        <div className="contentBody">
          <div className="contentTop">
            <div className="contentTitleWrap">
              <h1 className="contentTitle">Plugins</h1>
              <span className="contentCount">{visiblePlugins.length}</span>
            </div>
          </div>

          <div className="pluginGrid">
            {visiblePlugins.map((plugin) => (
              <article key={plugin.name} className="pluginCard">
                <div className="pluginThumbnail" aria-hidden="true" />

                <div className="templateCardHeader">
                  <div className="templateNameWrap">
                    <span className="templateName">{plugin.name}</span>
                  </div>

                  <div className="templateBadges">
                    <span className="templateBadge muted">{plugin.pricingLabel}</span>
                    <span className="templateBadge">
                      {formatScore(plugin.finalScore)} Score
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {visiblePlugins.length === 0 ? (
            <p className="templateEmptyState">
              No plugins match the current search and settings.
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
