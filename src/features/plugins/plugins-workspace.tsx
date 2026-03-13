"use client";

import { useState } from "react";

import { PluginsContent } from "@/features/plugins/components/plugins-content";
import { PluginsSidebar } from "@/features/plugins/components/plugins-sidebar";
import {
  getPluginRankingSettings,
  scorePlugins,
} from "@/features/plugins/lib/plugin-ranking";
import { pluginsSidebarSections } from "@/features/plugins/lib/sidebar-settings";
import { usePersistedSidebarSettings } from "@/features/settings/lib/persisted-sidebar-settings";

const STORAGE_KEY = "plugins-workspace-state";

export function PluginsWorkspace() {
  const [searchQuery, setSearchQuery] = useState("");
  const {
    savedSidebarSettings,
    sidebarSettings,
    setSidebarSettings,
    resetSidebarSettings,
    saveSidebarSettings,
  } = usePersistedSidebarSettings(
    pluginsSidebarSections,
    STORAGE_KEY,
  );

  const rankingSettings = getPluginRankingSettings(sidebarSettings);
  const rankedPlugins = scorePlugins(rankingSettings);

  return (
    <>
      <PluginsSidebar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        savedSettingsState={savedSidebarSettings}
        settingsState={sidebarSettings}
        onSettingsChange={setSidebarSettings}
        onResetSettings={resetSidebarSettings}
        onSaveSettings={saveSidebarSettings}
      />
      <PluginsContent plugins={rankedPlugins} searchQuery={searchQuery} />
    </>
  );
}
