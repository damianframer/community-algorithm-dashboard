"use client";

import { useState } from "react";

import { ComponentsContent } from "@/features/components/components/components-content";
import { ComponentsSidebar } from "@/features/components/components/components-sidebar";
import {
  getComponentRankingSettings,
  scoreComponents,
} from "@/features/components/lib/component-ranking";
import { getPositionChanges } from "@/features/marketplace/lib/position-change";
import { areSidebarSettingsEqual } from "@/features/settings/lib/settings-state";
import { componentsSidebarSections } from "@/features/components/lib/sidebar-settings";
import { usePersistedSidebarSettings } from "@/features/settings/lib/persisted-sidebar-settings";

const STORAGE_KEY = "components-workspace-state";

export function ComponentsWorkspace() {
  const [searchQuery, setSearchQuery] = useState("");
  const {
    savedSidebarSettings,
    sidebarSettings,
    setSidebarSettings,
    resetSidebarSettings,
    saveSidebarSettings,
  } = usePersistedSidebarSettings(
    componentsSidebarSections,
    STORAGE_KEY,
  );

  const rankingSettings = getComponentRankingSettings(sidebarSettings);
  const savedRankingSettings = getComponentRankingSettings(savedSidebarSettings);
  const isEditing = !areSidebarSettingsEqual(
    sidebarSettings,
    savedSidebarSettings,
  );
  const rankedComponents = scoreComponents(rankingSettings);
  const savedRankedComponents = scoreComponents(savedRankingSettings);
  const positionChanges = getPositionChanges(
    rankedComponents,
    savedRankedComponents,
  );

  return (
    <>
      <ComponentsSidebar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        savedSettingsState={savedSidebarSettings}
        settingsState={sidebarSettings}
        onSettingsChange={setSidebarSettings}
        onResetSettings={resetSidebarSettings}
        onSaveSettings={saveSidebarSettings}
      />
      <ComponentsContent
        components={rankedComponents}
        positionChanges={positionChanges}
        searchQuery={searchQuery}
        showPositionChanges={isEditing}
      />
    </>
  );
}
