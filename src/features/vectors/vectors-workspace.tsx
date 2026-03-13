"use client";

import { useState } from "react";

import { VectorsContent } from "@/features/vectors/components/vectors-content";
import { VectorsSidebar } from "@/features/vectors/components/vectors-sidebar";
import {
  getVectorRankingSettings,
  scoreVectors,
} from "@/features/vectors/lib/vector-ranking";
import { vectorsSidebarSections } from "@/features/vectors/lib/sidebar-settings";
import { usePersistedSidebarSettings } from "@/features/settings/lib/persisted-sidebar-settings";

const STORAGE_KEY = "vectors-workspace-state";

export function VectorsWorkspace() {
  const [searchQuery, setSearchQuery] = useState("");
  const {
    savedSidebarSettings,
    sidebarSettings,
    setSidebarSettings,
    resetSidebarSettings,
    saveSidebarSettings,
  } = usePersistedSidebarSettings(
    vectorsSidebarSections,
    STORAGE_KEY,
  );

  const rankingSettings = getVectorRankingSettings(sidebarSettings);
  const rankedVectors = scoreVectors(rankingSettings);

  return (
    <>
      <VectorsSidebar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        savedSettingsState={savedSidebarSettings}
        settingsState={sidebarSettings}
        onSettingsChange={setSidebarSettings}
        onResetSettings={resetSidebarSettings}
        onSaveSettings={saveSidebarSettings}
      />
      <VectorsContent vectors={rankedVectors} searchQuery={searchQuery} />
    </>
  );
}
