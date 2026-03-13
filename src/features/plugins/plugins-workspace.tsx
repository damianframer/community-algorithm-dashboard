"use client";

import { useState } from "react";

import { getPositionChanges } from "@/features/marketplace/lib/position-change";
import { interleaveByPricing } from "@/features/marketplace/lib/pricing-order";
import { PluginsContent } from "@/features/plugins/components/plugins-content";
import { PluginsSidebar } from "@/features/plugins/components/plugins-sidebar";
import { areSidebarSettingsEqual } from "@/features/settings/lib/settings-state";
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
  const savedRankingSettings = getPluginRankingSettings(savedSidebarSettings);
  const isEditing = !areSidebarSettingsEqual(
    sidebarSettings,
    savedSidebarSettings,
  );
  const rankedPlugins = scorePlugins(rankingSettings);
  const savedRankedPlugins = scorePlugins(savedRankingSettings);
  const orderedPlugins = interleaveByPricing(rankedPlugins);
  const orderedSavedPlugins = interleaveByPricing(savedRankedPlugins);
  const positionChanges = getPositionChanges(orderedPlugins, orderedSavedPlugins);

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
      <PluginsContent
        plugins={orderedPlugins}
        positionChanges={positionChanges}
        searchQuery={searchQuery}
        showPositionChanges={isEditing}
      />
    </>
  );
}
