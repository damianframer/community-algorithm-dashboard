import type { SidebarSettingsState } from "@/features/settings/lib/settings-state";
import { getScopedTemplateHref } from "@/features/templates/lib/template-paths";
import {
  filterTemplateWorkspaceSeedsByMinimumViews,
  getTemplateWorkspaceRankingModelSettings,
  runTemplateWorkspaceRankingPipeline,
  type TemplateWorkspacePipelineResult,
} from "@/features/templates/lib/template-workspace-ranking";
import { templateWorkspaceSidebarSections } from "@/features/templates/lib/template-workspace-sidebar-settings";
import {
  type TemplateSeed,
  type RankingSettings,
} from "@/features/templates/lib/template-ranking";

export type TemplateWorkspaceDisplayMode = "marketplace" | "ranking";
export type TemplateWorkspaceVariant = "template";

export function getTemplateWorkspaceDisplayMode(
  variant: TemplateWorkspaceVariant,
): TemplateWorkspaceDisplayMode {
  void variant;
  return "ranking";
}

export function getTemplateWorkspaceHomeHref(
  variant: TemplateWorkspaceVariant,
) {
  void variant;
  return "/";
}

export function getTemplateWorkspaceRankingSettings(
  settings: SidebarSettingsState,
  variant: TemplateWorkspaceVariant,
): RankingSettings {
  void variant;
  return getTemplateWorkspaceRankingModelSettings(settings);
}

export function runTemplateWorkspacePipeline(
  seeds: TemplateSeed[],
  settings: RankingSettings,
  variant: TemplateWorkspaceVariant,
): TemplateWorkspacePipelineResult {
  void variant;
  return runTemplateWorkspaceRankingPipeline(seeds, settings);
}

export function getTemplateWorkspaceSidebarSections(
  variant: TemplateWorkspaceVariant,
) {
  void variant;
  return templateWorkspaceSidebarSections;
}

export function getTemplateWorkspaceStorageKey(
  variant: TemplateWorkspaceVariant,
) {
  void variant;
  return "template-workspace-state";
}

export function getTemplateWorkspaceLegacyStorageKeys(
  variant: TemplateWorkspaceVariant,
) {
  void variant;
  return ["templates-workspace-state"];
}

export function getTemplateWorkspaceTemplateHref(
  templateName: string,
  variant: TemplateWorkspaceVariant,
) {
  return getScopedTemplateHref(
    templateName,
    getTemplateWorkspaceHomeHref(variant),
  );
}

export function filterTemplateWorkspaceSeeds(
  seeds: TemplateSeed[],
  settings: SidebarSettingsState,
  variant: TemplateWorkspaceVariant,
) {
  void variant;
  return filterTemplateWorkspaceSeedsByMinimumViews(seeds, settings);
}
