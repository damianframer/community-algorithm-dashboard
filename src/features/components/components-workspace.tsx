"use client";

import { useState } from "react";

import { ComponentsContent } from "@/features/components/components/components-content";
import { ComponentsSidebar } from "@/features/components/components/components-sidebar";
import {
  getComponentRankingSettings,
  scoreComponents,
} from "@/features/components/lib/component-ranking";
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
  const rankedComponents = scoreComponents(rankingSettings);

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
      <ComponentsContent components={rankedComponents} searchQuery={searchQuery} />
    </>
  );
}
