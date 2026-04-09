"use client";

import { useEffect, useMemo, useState } from "react";

import { createSidebarSettingsState } from "@/features/settings/lib/settings-state";
import { TemplatesHistorySidebar } from "@/features/templates/components/templates-history-sidebar";
import { TemplatesHistoryView } from "@/features/templates/components/templates-history-view";
import {
  getTemplateWorkspaceHomeHref,
  getTemplateWorkspaceSidebarSections,
  type TemplateWorkspaceVariant,
} from "@/features/templates/lib/template-workspace-config";
import { useTemplatesWorkspaceState } from "@/features/templates/lib/templates-workspace-state";
import {
  getTemplateHistoryChangeDetails,
  type TemplateHistoryEntry,
} from "@/features/templates/lib/templates-history";

type TemplatesHistoryWorkspaceProps = {
  variant?: TemplateWorkspaceVariant;
};

export function TemplatesHistoryWorkspace({
  variant = "template",
}: TemplatesHistoryWorkspaceProps) {
  const {
    currentHistoryEntryId,
    historyEntries,
    previewHistoryEntry,
    rollbackHistoryEntry,
  } = useTemplatesWorkspaceState();
  const sections = getTemplateWorkspaceSidebarSections(variant);
  const homeHref = getTemplateWorkspaceHomeHref(variant);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);

  useEffect(() => {
    if (historyEntries.length === 0) {
      setSelectedEntryId(null);
      return;
    }

    const hasSelectedEntry = historyEntries.some((entry) => entry.id === selectedEntryId);

    if (!hasSelectedEntry) {
      setSelectedEntryId(currentHistoryEntryId ?? historyEntries[0].id);
    }
  }, [currentHistoryEntryId, historyEntries, selectedEntryId]);

  function isCurrentEntry(entry: TemplateHistoryEntry) {
    return entry.id === currentHistoryEntryId;
  }

  const selectedEntry = historyEntries.find((entry) => entry.id === selectedEntryId) ?? null;
  const selectedEntryIndex = selectedEntry
    ? historyEntries.findIndex((entry) => entry.id === selectedEntry.id)
    : -1;
  const previousEntry = selectedEntryIndex >= 0
    ? historyEntries[selectedEntryIndex + 1] ?? null
    : null;
  const selectedEntryChangeDetails = useMemo(
    () =>
      selectedEntry
        ? selectedEntry.changedDetails.length > 0
          ? selectedEntry.changedDetails
          : getTemplateHistoryChangeDetails(
              previousEntry?.sidebarSettings ??
                createSidebarSettingsState(sections),
              selectedEntry.sidebarSettings,
              sections,
            )
        : [],
    [previousEntry?.sidebarSettings, sections, selectedEntry],
  );
  const touchedSections = useMemo(
    () =>
      Array.from(
        new Set(selectedEntryChangeDetails.map((detail) => detail.section)),
      ),
    [selectedEntryChangeDetails],
  );

  return (
    <>
      <TemplatesHistorySidebar
        historyEntries={historyEntries}
        isCurrentEntry={isCurrentEntry}
        onSelectEntry={setSelectedEntryId}
        selectedEntryId={selectedEntryId}
      />
      <TemplatesHistoryView
        changeDetails={selectedEntryChangeDetails}
        homeHref={homeHref}
        isCurrentEntry={selectedEntry ? isCurrentEntry(selectedEntry) : false}
        onCheckVersion={previewHistoryEntry}
        onRollback={rollbackHistoryEntry}
        selectedEntry={selectedEntry}
        touchedSections={touchedSections}
      />
    </>
  );
}
