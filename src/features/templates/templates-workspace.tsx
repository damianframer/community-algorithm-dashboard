"use client";

import { useEffect, useMemo, useState } from "react";

import { TemplateListSidebar } from "@/features/templates/components/template-list-sidebar";
import { getPositionChanges } from "@/features/marketplace/lib/position-change";
import { areSidebarSettingsEqual } from "@/features/settings/lib/settings-state";
import {
  TemplatesContent,
} from "@/features/templates/components/templates-content";
import { TemplatesSidebar } from "@/features/templates/components/templates-sidebar";
import {
  getTemplateHref,
  getTemplateSlug,
} from "@/features/templates/lib/template-paths";
import {
  annotateCurrentTrendingTemplates,
  getRankingSettings,
  getTemplatesForDisplay,
  projectCurrentTrendingSeeds,
  scoreTemplates,
  type TemplateSeed,
} from "@/features/templates/lib/template-ranking";
import { useTemplatesWorkspaceState } from "@/features/templates/lib/templates-workspace-state";

type TemplatesWorkspaceProps = {
  initialSeeds?: TemplateSeed[];
  selectedTemplateSlug?: string;
};

export function TemplatesWorkspace({
  initialSeeds,
  selectedTemplateSlug,
}: TemplatesWorkspaceProps) {
  const [seeds, setSeeds] = useState<TemplateSeed[] | null>(initialSeeds ?? null);
  const isLoading = seeds === null;

  useEffect(() => {
    if (initialSeeds) {
      return;
    }

    fetch("/api/templates")
      .then((res) => {
        if (!res.ok) throw new Error("API error");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) setSeeds(data);
        else setSeeds([]);
      })
      .catch(() => {
        setSeeds([]);
      });
  }, [initialSeeds]);

  const {
    pricingFilter,
    savedSidebarSettings,
    searchQuery,
    sidebarSettings,
    statsFilter,
    resetSidebarSettings,
    saveSidebarSettings,
    setPricingFilter,
    setSearchQuery,
    setSidebarSettings,
    setStatsFilter,
  } = useTemplatesWorkspaceState();

  const rankingSettings = getRankingSettings(sidebarSettings);
  const savedRankingSettings = getRankingSettings(savedSidebarSettings);
  const isEditing = !areSidebarSettingsEqual(
    sidebarSettings,
    savedSidebarSettings,
  );
  const rankingSeeds = useMemo(
    () =>
      isLoading || !seeds
        ? []
        : projectCurrentTrendingSeeds(seeds, rankingSettings),
    [isLoading, rankingSettings, seeds],
  );
  const savedRankingSeeds = useMemo(
    () =>
      isLoading || !seeds
        ? []
        : projectCurrentTrendingSeeds(seeds, savedRankingSettings),
    [isLoading, savedRankingSettings, seeds],
  );
  const rankedTemplates = isLoading
    ? []
    : annotateCurrentTrendingTemplates(
        scoreTemplates(rankingSettings, rankingSeeds),
        rankingSettings,
      );
  const savedRankedTemplates = isLoading
    ? []
    : annotateCurrentTrendingTemplates(
        scoreTemplates(savedRankingSettings, savedRankingSeeds),
        savedRankingSettings,
      );
  const displayTemplates = getTemplatesForDisplay(rankedTemplates, rankingSettings);
  const savedDisplayTemplates = getTemplatesForDisplay(
    savedRankedTemplates,
    savedRankingSettings,
  );
  const positionChanges = getPositionChanges(displayTemplates, savedDisplayTemplates);
  const selectedTemplate = selectedTemplateSlug
    ? rankedTemplates.find(
        (template) => getTemplateSlug(template.name) === selectedTemplateSlug,
      ) ?? null
    : null;

  return (
    <>
      {selectedTemplate ? (
        <TemplateListSidebar
          getTemplateHref={(template) => getTemplateHref(template.name)}
          templates={displayTemplates}
          selectedTemplateName={selectedTemplate.name}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      ) : (
        <TemplatesSidebar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          savedSettingsState={savedSidebarSettings}
          settingsState={sidebarSettings}
          onSettingsChange={setSidebarSettings}
          onResetSettings={resetSidebarSettings}
          onSaveSettings={saveSidebarSettings}
        />
      )}
      <TemplatesContent
        getTemplateHref={(template) => getTemplateHref(template.name)}
        isLoading={isLoading}
        searchQuery={searchQuery}
        pricingFilter={pricingFilter}
        statsFilter={statsFilter}
        rankedTemplates={rankedTemplates}
        rankingSettings={rankingSettings}
        scoreBreakdownSeeds={rankingSeeds}
        positionChanges={positionChanges}
        showPositionChanges={isEditing}
        selectedTemplate={selectedTemplate}
        onPricingFilterChange={setPricingFilter}
        onStatsFilterChange={setStatsFilter}
      />
    </>
  );
}
