"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

import type {
  SettingDefinition,
  SidebarSettingsState,
} from "@/features/settings/lib/settings-state";
import {
  cloneSidebarSettingsState,
  createSidebarSettingsState,
  formatNumericSettingValue,
  normalizeNumericSettingValue,
  normalizeSidebarSettingsState,
} from "@/features/settings/lib/settings-state";
import {
  createTemplateHistoryEntry,
  isTemplateHistoryEntry,
  MAX_TEMPLATE_HISTORY_ENTRIES,
  type TemplateHistoryEntry,
} from "@/features/templates/lib/templates-history";
import type {
  StatsFilterValue,
  TemplatePricingFilterValue,
} from "@/features/templates/components/templates-content";
import { templatesSidebarSections } from "@/features/templates/lib/sidebar-settings";

const STORAGE_KEY = "templates-workspace-state";
const STORAGE_VERSION = 3;

type TemplatesWorkspaceContextValue = {
  currentHistoryEntryId: string | null;
  historyEntries: TemplateHistoryEntry[];
  pricingFilter: TemplatePricingFilterValue;
  previewHistoryEntry: (entryId: string) => void;
  rollbackHistoryEntry: (entryId: string) => void;
  savedSidebarSettings: SidebarSettingsState;
  searchQuery: string;
  sidebarSettings: SidebarSettingsState;
  statsFilter: StatsFilterValue;
  resetSidebarSettings: () => void;
  saveSidebarSettings: () => void;
  setPricingFilter: Dispatch<SetStateAction<TemplatePricingFilterValue>>;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  setSidebarSettings: Dispatch<SetStateAction<SidebarSettingsState>>;
  setStatsFilter: Dispatch<SetStateAction<StatsFilterValue>>;
};

type PersistedTemplatesWorkspaceState = {
  currentHistoryEntryId?: string | null;
  historyEntries?: TemplateHistoryEntry[];
  savedSidebarSettings: SidebarSettingsState;
  version: number;
};

type RestoredTemplatesWorkspaceState = {
  currentHistoryEntryId: string | null;
  historyEntries: TemplateHistoryEntry[];
  savedSidebarSettings: SidebarSettingsState;
};

const defaultSidebarSettingsState = createSidebarSettingsState(
  templatesSidebarSections,
);

const TemplatesWorkspaceStateContext =
  createContext<TemplatesWorkspaceContextValue | null>(null);

function getDefaultSidebarSettingsState() {
  return cloneSidebarSettingsState(defaultSidebarSettingsState);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function restoreNumericSetting(
  persistedFieldState: unknown,
  setting: Exclude<SettingDefinition, { kind: "dropdown" }>,
) {
  if (!isRecord(persistedFieldState) || typeof persistedFieldState.value !== "number") {
    return {
      draft: formatNumericSettingValue(
        setting.initialValue,
        setting.mode,
        setting.step,
      ),
      value: setting.initialValue,
    };
  }

  const normalizedValue = normalizeNumericSettingValue(
    persistedFieldState.value,
    setting.min,
    setting.max,
    setting.step,
  );

  return {
    draft: formatNumericSettingValue(
      normalizedValue,
      setting.mode,
      setting.step,
    ),
    value: normalizedValue,
  };
}

function restoreSidebarSettingsState(
  persistedSettingsState: unknown,
): SidebarSettingsState {
  if (!isRecord(persistedSettingsState)) {
    return getDefaultSidebarSettingsState();
  }

  return Object.fromEntries(
    templatesSidebarSections.map((section) => {
      const persistedSectionState = isRecord(persistedSettingsState[section.title])
        ? (persistedSettingsState[section.title] as Record<string, unknown>)
        : null;

      return [
        section.title,
        Object.fromEntries(
          section.settings.map((setting) => {
            const persistedFieldState = persistedSectionState?.[setting.label];

            if (setting.kind === "dropdown") {
              if (
                isRecord(persistedFieldState) &&
                typeof persistedFieldState.value === "string" &&
                setting.options.includes(persistedFieldState.value)
              ) {
                return [setting.label, { value: persistedFieldState.value }];
              }

              return [setting.label, { value: setting.initialValue }];
            }

            return [
              setting.label,
              restoreNumericSetting(persistedFieldState, setting),
            ];
          }),
        ),
      ];
    }),
  ) as SidebarSettingsState;
}

function readPersistedTemplatesWorkspaceState() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);

    if (!rawValue) {
      return null;
    }

    const parsedValue = JSON.parse(rawValue) as PersistedTemplatesWorkspaceState;

    if (!isRecord(parsedValue) || !("savedSidebarSettings" in parsedValue)) {
      return null;
    }

    const savedSidebarSettings = restoreSidebarSettingsState(
      parsedValue.savedSidebarSettings,
    );

    if (parsedValue.version === 1) {
      return {
        currentHistoryEntryId: null,
        historyEntries: [],
        savedSidebarSettings,
      } satisfies RestoredTemplatesWorkspaceState;
    }

    if (parsedValue.version !== 2 && parsedValue.version !== STORAGE_VERSION) {
      return null;
    }

    const historyEntries = Array.isArray(parsedValue.historyEntries)
      ? parsedValue.historyEntries
          .filter(isTemplateHistoryEntry)
          .map((entry) => ({
            ...entry,
            changedDetails: Array.isArray(entry.changedDetails)
              ? entry.changedDetails.filter(
                  (item) =>
                    typeof item === "object" &&
                    item !== null &&
                    "label" in item &&
                    typeof item.label === "string" &&
                    "section" in item &&
                    typeof item.section === "string" &&
                    "from" in item &&
                    typeof item.from === "string" &&
                    "to" in item &&
                    typeof item.to === "string",
                )
              : [],
            changedSettings: Array.isArray(entry.changedSettings)
              ? entry.changedSettings.filter((item) => typeof item === "string")
              : [],
            sidebarSettings: restoreSidebarSettingsState(entry.sidebarSettings),
          }))
      : [];

    const currentHistoryEntryId =
      typeof parsedValue.currentHistoryEntryId === "string"
        ? parsedValue.currentHistoryEntryId
        : historyEntries.find((entry) =>
            JSON.stringify(entry.sidebarSettings) === JSON.stringify(savedSidebarSettings),
          )?.id ?? null;

    return {
      currentHistoryEntryId,
      historyEntries,
      savedSidebarSettings,
    } satisfies RestoredTemplatesWorkspaceState;
  } catch {
    return null;
  }
}

function writePersistedTemplatesWorkspaceState(
  currentHistoryEntryId: string | null,
  savedSidebarSettings: SidebarSettingsState,
  historyEntries: TemplateHistoryEntry[],
) {
  if (typeof window === "undefined") {
    return;
  }

  const value: PersistedTemplatesWorkspaceState = {
    currentHistoryEntryId,
    historyEntries,
    savedSidebarSettings,
    version: STORAGE_VERSION,
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

export function TemplatesWorkspaceStateProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [pricingFilter, setPricingFilter] =
    useState<TemplatePricingFilterValue>("all");
  const [statsFilter, setStatsFilter] = useState<StatsFilterValue>("none");
  const [currentHistoryEntryId, setCurrentHistoryEntryId] = useState<string | null>(null);
  const [historyEntries, setHistoryEntries] = useState<TemplateHistoryEntry[]>([]);
  const [savedSidebarSettings, setSavedSidebarSettings] =
    useState<SidebarSettingsState>(() => getDefaultSidebarSettingsState());
  const [sidebarSettings, setSidebarSettings] = useState<SidebarSettingsState>(
    () => getDefaultSidebarSettingsState(),
  );

  useEffect(() => {
    const persistedSidebarSettings = readPersistedTemplatesWorkspaceState();

    if (!persistedSidebarSettings) {
      return;
    }

    setSavedSidebarSettings(persistedSidebarSettings.savedSidebarSettings);
    setSidebarSettings(
      cloneSidebarSettingsState(persistedSidebarSettings.savedSidebarSettings),
    );
    setCurrentHistoryEntryId(persistedSidebarSettings.currentHistoryEntryId);
    setHistoryEntries(persistedSidebarSettings.historyEntries);
  }, []);

  function resetSidebarSettings() {
    setSidebarSettings(cloneSidebarSettingsState(savedSidebarSettings));
  }

  function saveSidebarSettings() {
    const normalizedSettings = normalizeSidebarSettingsState(
      sidebarSettings,
      templatesSidebarSections,
    );
    const nextSavedSidebarSettings = cloneSidebarSettingsState(normalizedSettings);
    const nextHistoryEntry = createTemplateHistoryEntry(
        savedSidebarSettings,
        nextSavedSidebarSettings,
        templatesSidebarSections,
      );
    const nextHistoryEntries = [
      nextHistoryEntry,
      ...historyEntries,
    ].slice(0, MAX_TEMPLATE_HISTORY_ENTRIES);

    setSavedSidebarSettings(nextSavedSidebarSettings);
    setSidebarSettings(cloneSidebarSettingsState(nextSavedSidebarSettings));
    setCurrentHistoryEntryId(nextHistoryEntry.id);
    setHistoryEntries(nextHistoryEntries);
    writePersistedTemplatesWorkspaceState(
      nextHistoryEntry.id,
      nextSavedSidebarSettings,
      nextHistoryEntries,
    );
  }

  function rollbackHistoryEntry(entryId: string) {
    const entry = historyEntries.find((historyEntry) => historyEntry.id === entryId);

    if (!entry) {
      return;
    }

    const nextSavedSidebarSettings = cloneSidebarSettingsState(
      entry.sidebarSettings,
    );

    setSavedSidebarSettings(nextSavedSidebarSettings);
    setSidebarSettings(cloneSidebarSettingsState(nextSavedSidebarSettings));
    setCurrentHistoryEntryId(entry.id);
    writePersistedTemplatesWorkspaceState(
      entry.id,
      nextSavedSidebarSettings,
      historyEntries,
    );
  }

  function previewHistoryEntry(entryId: string) {
    const entry = historyEntries.find((historyEntry) => historyEntry.id === entryId);

    if (!entry) {
      return;
    }

    setSidebarSettings(cloneSidebarSettingsState(entry.sidebarSettings));
  }

  return (
    <TemplatesWorkspaceStateContext.Provider
      value={{
        currentHistoryEntryId,
        historyEntries,
        pricingFilter,
        previewHistoryEntry,
        rollbackHistoryEntry,
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
      }}
    >
      {children}
    </TemplatesWorkspaceStateContext.Provider>
  );
}

export function useTemplatesWorkspaceState() {
  const contextValue = useContext(TemplatesWorkspaceStateContext);

  if (!contextValue) {
    throw new Error(
      "useTemplatesWorkspaceState must be used within TemplatesWorkspaceStateProvider",
    );
  }

  return contextValue;
}
