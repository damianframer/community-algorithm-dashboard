"use client";

import { useEffect, useState } from "react";

import type {
  SettingDefinition,
  SettingSection,
  SidebarSettingsState,
} from "@/features/settings/lib/settings-state";
import {
  cloneSidebarSettingsState,
  createSidebarSettingsState,
  formatNumericSettingValue,
  normalizeNumericSettingValue,
  normalizeSidebarSettingsState,
} from "@/features/settings/lib/settings-state";

type PersistedSidebarSettingsState = {
  savedSidebarSettings: SidebarSettingsState;
  version: number;
};

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
  sections: SettingSection[],
) {
  if (!isRecord(persistedSettingsState)) {
    return cloneSidebarSettingsState(createSidebarSettingsState(sections));
  }

  return Object.fromEntries(
    sections.map((section) => {
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

function readPersistedSidebarSettings(
  storageKey: string,
  storageVersion: number,
  sections: SettingSection[],
) {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(storageKey);

    if (!rawValue) {
      return null;
    }

    const parsedValue = JSON.parse(rawValue) as PersistedSidebarSettingsState;

    if (
      !isRecord(parsedValue) ||
      parsedValue.version !== storageVersion ||
      !("savedSidebarSettings" in parsedValue)
    ) {
      return null;
    }

    return restoreSidebarSettingsState(parsedValue.savedSidebarSettings, sections);
  } catch {
    return null;
  }
}

function writePersistedSidebarSettings(
  storageKey: string,
  storageVersion: number,
  savedSidebarSettings: SidebarSettingsState,
) {
  if (typeof window === "undefined") {
    return;
  }

  const value: PersistedSidebarSettingsState = {
    savedSidebarSettings,
    version: storageVersion,
  };

  window.localStorage.setItem(storageKey, JSON.stringify(value));
}

export function usePersistedSidebarSettings(
  sections: SettingSection[],
  storageKey: string,
  storageVersion = 1,
) {
  const [savedSidebarSettings, setSavedSidebarSettings] = useState(() =>
    cloneSidebarSettingsState(createSidebarSettingsState(sections)),
  );
  const [sidebarSettings, setSidebarSettings] = useState(() =>
    cloneSidebarSettingsState(createSidebarSettingsState(sections)),
  );

  useEffect(() => {
    const persistedSidebarSettings = readPersistedSidebarSettings(
      storageKey,
      storageVersion,
      sections,
    );

    if (!persistedSidebarSettings) {
      return;
    }

    setSavedSidebarSettings(persistedSidebarSettings);
    setSidebarSettings(cloneSidebarSettingsState(persistedSidebarSettings));
  }, [sections, storageKey, storageVersion]);

  function resetSidebarSettings() {
    setSidebarSettings(cloneSidebarSettingsState(savedSidebarSettings));
  }

  function saveSidebarSettings() {
    const normalizedSettings = normalizeSidebarSettingsState(
      sidebarSettings,
      sections,
    );
    const nextSavedSidebarSettings = cloneSidebarSettingsState(normalizedSettings);

    setSavedSidebarSettings(nextSavedSidebarSettings);
    setSidebarSettings(cloneSidebarSettingsState(nextSavedSidebarSettings));
    writePersistedSidebarSettings(
      storageKey,
      storageVersion,
      nextSavedSidebarSettings,
    );
  }

  return {
    resetSidebarSettings,
    saveSidebarSettings,
    savedSidebarSettings,
    setSidebarSettings,
    sidebarSettings,
  };
}
