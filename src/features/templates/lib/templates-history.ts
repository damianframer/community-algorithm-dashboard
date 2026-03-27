import type {
  SettingFieldState,
  SettingSection,
  SidebarSettingsState,
} from "@/features/settings/lib/settings-state";
import { cloneSidebarSettingsState } from "@/features/settings/lib/settings-state";

export const MAX_TEMPLATE_HISTORY_ENTRIES = 100;

export type TemplateHistoryChangeDetail = {
  from: string;
  label: string;
  section: string;
  to: string;
};

export type TemplateHistoryEntry = {
  changedDetails: TemplateHistoryChangeDetail[];
  changedSettings: string[];
  id: string;
  savedAt: string;
  sidebarSettings: SidebarSettingsState;
  title: string;
};

function getFieldDisplayValue(fieldState: SettingFieldState) {
  return String("draft" in fieldState ? fieldState.draft : fieldState.value);
}

export function getTemplateHistoryChangeDetails(
  previousSettings: SidebarSettingsState,
  nextSettings: SidebarSettingsState,
  sections: SettingSection[],
) {
  const changedDetails: TemplateHistoryChangeDetail[] = [];

  for (const section of sections) {
    for (const setting of section.settings) {
      const previousField = previousSettings[section.title]?.[setting.label];
      const nextField = nextSettings[section.title]?.[setting.label];

      if (!previousField || !nextField) {
        continue;
      }

      const previousValue = getFieldDisplayValue(previousField);
      const nextValue = getFieldDisplayValue(nextField);

      if (previousValue !== nextValue) {
        changedDetails.push({
          from: previousValue,
          label: setting.label,
          section: section.title,
          to: nextValue,
        });
      }
    }
  }

  return changedDetails;
}

export function createTemplateHistoryEntry(
  previousSettings: SidebarSettingsState,
  nextSettings: SidebarSettingsState,
  sections: SettingSection[],
): TemplateHistoryEntry {
  const changedDetails = getTemplateHistoryChangeDetails(
    previousSettings,
    nextSettings,
    sections,
  );
  const changedLabels = changedDetails.map((detail) => detail.label);
  let title = "Saved current weights";

  if (changedLabels.length === 1) {
    title = `Updated ${changedLabels[0]}`;
  } else if (changedLabels.length === 2) {
    title = `Updated ${changedLabels[0]} and ${changedLabels[1]}`;
  } else if (changedLabels.length > 2) {
    title = `Updated ${changedLabels[0]}, ${changedLabels[1]} +${changedLabels.length - 2} more`;
  }

  return {
    changedDetails,
    changedSettings: changedLabels,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    savedAt: new Date().toISOString(),
    sidebarSettings: cloneSidebarSettingsState(nextSettings),
    title,
  };
}

export function formatTemplateHistoryDate(savedAt: string) {
  const parsedDate = new Date(savedAt);

  if (Number.isNaN(parsedDate.getTime())) {
    return "--.--.----";
  }

  return parsedDate.toLocaleDateString("en-GB").replace(/\//g, ".");
}

export function formatTemplateHistoryTimestamp(savedAt: string) {
  const parsedDate = new Date(savedAt);

  if (Number.isNaN(parsedDate.getTime())) {
    return "--.--.----";
  }

  const datePart = parsedDate.toLocaleDateString("en-GB").replace(/\//g, ".");
  const timePart = parsedDate.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${datePart} ${timePart}`;
}

export function isTemplateHistoryEntry(
  value: unknown,
): value is TemplateHistoryEntry {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "string" &&
    "savedAt" in value &&
    typeof value.savedAt === "string" &&
    "title" in value &&
    typeof value.title === "string" &&
    "sidebarSettings" in value &&
    typeof value.sidebarSettings === "object" &&
    value.sidebarSettings !== null &&
    (!("changedSettings" in value) || Array.isArray(value.changedSettings)) &&
    (!("changedDetails" in value) || Array.isArray(value.changedDetails))
  );
}
