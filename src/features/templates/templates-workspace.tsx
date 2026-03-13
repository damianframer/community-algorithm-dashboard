"use client";

import { TemplateListSidebar } from "@/features/templates/components/template-list-sidebar";
import { getPositionChanges } from "@/features/marketplace/lib/position-change";
import { interleaveByPricing } from "@/features/marketplace/lib/pricing-order";
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
  applyFeedRules,
  getRankingSettings,
  scoreTemplates,
} from "@/features/templates/lib/template-ranking";
import { useTemplatesWorkspaceState } from "@/features/templates/lib/templates-workspace-state";

type TemplatesWorkspaceProps = {
  selectedTemplateSlug?: string;
};

export function TemplatesWorkspace({
  selectedTemplateSlug,
}: TemplatesWorkspaceProps) {
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
  const rankedTemplates = scoreTemplates(rankingSettings);
  const savedRankedTemplates = scoreTemplates(savedRankingSettings);
  const feedTemplates = interleaveByPricing(
    applyFeedRules(rankedTemplates, rankingSettings),
  );
  const savedFeedTemplates = interleaveByPricing(
    applyFeedRules(savedRankedTemplates, savedRankingSettings),
  );
  const positionChanges = getPositionChanges(feedTemplates, savedFeedTemplates);
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
          templates={feedTemplates}
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
        searchQuery={searchQuery}
        pricingFilter={pricingFilter}
        statsFilter={statsFilter}
        rankedTemplates={rankedTemplates}
        rankingSettings={rankingSettings}
        positionChanges={positionChanges}
        showPositionChanges={isEditing}
        selectedTemplate={selectedTemplate}
        onPricingFilterChange={setPricingFilter}
        onStatsFilterChange={setStatsFilter}
      />
    </>
  );
}
