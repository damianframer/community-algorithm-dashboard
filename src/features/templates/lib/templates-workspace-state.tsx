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
import type {
  StatsFilterValue,
  TemplatePricingFilterValue,
} from "@/features/templates/components/templates-content";
import { templatesSidebarSections } from "@/features/templates/lib/sidebar-settings";

const STORAGE_KEY = "templates-workspace-state";
const STORAGE_VERSION = 1;

type TemplatesWorkspaceContextValue = {
  pricingFilter: TemplatePricingFilterValue;
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
  savedSidebarSettings: SidebarSettingsState;
  version: number;
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

    if (
      !isRecord(parsedValue) ||
      parsedValue.version !== STORAGE_VERSION ||
      !("savedSidebarSettings" in parsedValue)
    ) {
      return null;
    }

    return restoreSidebarSettingsState(parsedValue.savedSidebarSettings);
  } catch {
    return null;
  }
}

function writePersistedTemplatesWorkspaceState(
  savedSidebarSettings: SidebarSettingsState,
) {
  if (typeof window === "undefined") {
    return;
  }

  const value: PersistedTemplatesWorkspaceState = {
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

    setSavedSidebarSettings(persistedSidebarSettings);
    setSidebarSettings(cloneSidebarSettingsState(persistedSidebarSettings));
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

    setSavedSidebarSettings(nextSavedSidebarSettings);
    setSidebarSettings(cloneSidebarSettingsState(nextSavedSidebarSettings));
    writePersistedTemplatesWorkspaceState(nextSavedSidebarSettings);
  }

  return (
    <TemplatesWorkspaceStateContext.Provider
      value={{
        pricingFilter,
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
