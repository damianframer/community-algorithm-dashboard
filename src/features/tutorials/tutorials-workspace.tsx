"use client";

import { useState } from "react";

import { TutorialsContent } from "@/features/tutorials/components/tutorials-content";
import { TutorialsSidebar } from "@/features/tutorials/components/tutorials-sidebar";
import {
  getTutorialRankingSettings,
  scoreTutorials,
} from "@/features/tutorials/lib/tutorial-ranking";
import { tutorialsSidebarSections } from "@/features/tutorials/lib/sidebar-settings";
import { usePersistedSidebarSettings } from "@/features/settings/lib/persisted-sidebar-settings";

const STORAGE_KEY = "tutorials-workspace-state";

export function TutorialsWorkspace() {
  const [searchQuery, setSearchQuery] = useState("");
  const {
    savedSidebarSettings,
    sidebarSettings,
    setSidebarSettings,
    resetSidebarSettings,
    saveSidebarSettings,
  } = usePersistedSidebarSettings(
    tutorialsSidebarSections,
    STORAGE_KEY,
  );

  const rankingSettings = getTutorialRankingSettings(sidebarSettings);
  const rankedTutorials = scoreTutorials(rankingSettings);

  return (
    <>
      <TutorialsSidebar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        savedSettingsState={savedSidebarSettings}
        settingsState={sidebarSettings}
        onSettingsChange={setSidebarSettings}
        onResetSettings={resetSidebarSettings}
        onSaveSettings={saveSidebarSettings}
      />
      <TutorialsContent tutorials={rankedTutorials} searchQuery={searchQuery} />
    </>
  );
}
