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
  getTemplateSlug,
} from "@/features/templates/lib/template-paths";
import {
  filterTemplateWorkspaceSeeds,
  getTemplateWorkspaceDisplayMode,
  getTemplateWorkspaceRankingSettings,
  getTemplateWorkspaceSidebarSections,
  getTemplateWorkspaceTemplateHref,
  runTemplateWorkspacePipeline,
  type TemplateWorkspaceVariant,
} from "@/features/templates/lib/template-workspace-config";
import { type TemplateSeed } from "@/features/templates/lib/template-ranking";
import { useTemplatesWorkspaceState } from "@/features/templates/lib/templates-workspace-state";

type TemplatesWorkspaceProps = {
  initialSeeds?: TemplateSeed[];
  selectedTemplateSlug?: string;
  variant?: TemplateWorkspaceVariant;
};

export function TemplatesWorkspace({
  initialSeeds,
  selectedTemplateSlug,
  variant = "template",
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

  const rankingSettings = getTemplateWorkspaceRankingSettings(
    sidebarSettings,
    variant,
  );
  const savedRankingSettings = getTemplateWorkspaceRankingSettings(
    savedSidebarSettings,
    variant,
  );
  const displayMode = getTemplateWorkspaceDisplayMode(variant);
  const sidebarSections = getTemplateWorkspaceSidebarSections(variant);
  const isEditing = !areSidebarSettingsEqual(
    sidebarSettings,
    savedSidebarSettings,
  );
  const filteredSeeds = useMemo(
    () =>
      isLoading || !seeds
        ? []
        : filterTemplateWorkspaceSeeds(seeds, sidebarSettings, variant),
    [isLoading, seeds, sidebarSettings, variant],
  );
  const filteredSavedSeeds = useMemo(
    () =>
      isLoading || !seeds
        ? []
        : filterTemplateWorkspaceSeeds(seeds, savedSidebarSettings, variant),
    [isLoading, savedSidebarSettings, seeds, variant],
  );
  const {
    displayTemplates,
    pipelineSnapshots,
    rankedTemplates,
    rankingSeeds,
  } = useMemo(
    () =>
      isLoading
        ? {
            displayTemplates: [],
            pipelineSnapshots: new Map(),
            rankedTemplates: [],
            rankingSeeds: [],
          }
        : runTemplateWorkspacePipeline(filteredSeeds, rankingSettings, variant),
    [filteredSeeds, isLoading, rankingSettings, variant],
  );
  const savedPipeline = useMemo(
    () =>
      isLoading
        ? {
            displayTemplates: [],
            pipelineSnapshots: new Map(),
            rankedTemplates: [],
            rankingSeeds: [],
          }
        : runTemplateWorkspacePipeline(
            filteredSavedSeeds,
            savedRankingSettings,
            variant,
          ),
    [filteredSavedSeeds, isLoading, savedRankingSettings, variant],
  );
  const {
    displayTemplates: savedDisplayTemplates,
  } = savedPipeline;
  const selectedTemplatePipeline = useMemo(
    () =>
      isLoading || !seeds || !selectedTemplateSlug
        ? null
        : runTemplateWorkspacePipeline(seeds, rankingSettings, variant),
    [isLoading, rankingSettings, seeds, selectedTemplateSlug, variant],
  );
  const positionChanges = getPositionChanges(displayTemplates, savedDisplayTemplates);
  const selectedTemplate = selectedTemplateSlug
    ? rankedTemplates.find(
        (template) => getTemplateSlug(template.name) === selectedTemplateSlug,
      ) ??
      selectedTemplatePipeline?.rankedTemplates.find(
        (template) => getTemplateSlug(template.name) === selectedTemplateSlug,
      ) ??
      null
    : null;
  const selectedTemplateInDisplayList = selectedTemplate
    ? displayTemplates.some((template) => template.name === selectedTemplate.name)
    : false;
  const detailSidebarTemplates =
    selectedTemplate && !selectedTemplateInDisplayList
      ? [selectedTemplate, ...displayTemplates]
      : displayTemplates;
  const detailPipelineSnapshots =
    selectedTemplate &&
    !pipelineSnapshots.has(selectedTemplate.name) &&
    selectedTemplatePipeline
      ? selectedTemplatePipeline.pipelineSnapshots
      : pipelineSnapshots;
  const detailRankingSeeds =
    selectedTemplate &&
    !rankingSeeds.some(
      (seed) =>
        (selectedTemplate.templateId !== undefined &&
          seed.templateId === selectedTemplate.templateId) ||
        seed.name === selectedTemplate.name,
    ) &&
    selectedTemplatePipeline
      ? selectedTemplatePipeline.rankingSeeds
      : rankingSeeds;

  return (
    <>
      {selectedTemplate ? (
        <TemplateListSidebar
          getTemplateHref={(template) =>
            getTemplateWorkspaceTemplateHref(template.name, variant)
          }
          templates={detailSidebarTemplates}
          selectedTemplateName={selectedTemplate.name}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      ) : (
        <TemplatesSidebar
          sections={sidebarSections}
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
        displayMode={displayMode}
        getTemplateHref={(template) =>
          getTemplateWorkspaceTemplateHref(template.name, variant)
        }
        isLoading={isLoading}
        searchQuery={searchQuery}
        pricingFilter={pricingFilter}
        statsFilter={statsFilter}
        displayTemplates={displayTemplates}
        pipelineSnapshots={detailPipelineSnapshots}
        rankedTemplates={rankedTemplates}
        rankingSettings={rankingSettings}
        scoreBreakdownSeeds={detailRankingSeeds}
        positionChanges={positionChanges}
        showPositionChanges={isEditing}
        selectedTemplate={selectedTemplate}
        onPricingFilterChange={setPricingFilter}
        onStatsFilterChange={setStatsFilter}
      />
    </>
  );
}
