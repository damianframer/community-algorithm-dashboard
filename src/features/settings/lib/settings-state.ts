export type NumericMode = "integer" | "decimal";

type SliderSetting = {
  effectNote?: string;
  label: string;
  description: string;
  kind: "slider";
  initialValue: number;
  min: number;
  max: number;
  step: number;
  mode: NumericMode;
};

type StepperSetting = {
  effectNote?: string;
  label: string;
  description: string;
  kind: "stepper";
  initialValue: number;
  min: number;
  max: number;
  step: number;
  mode: NumericMode;
};

type DropdownSetting = {
  effectNote?: string;
  label: string;
  description: string;
  kind: "dropdown";
  initialValue: string;
  options: string[];
};

export type SettingDefinition =
  | SliderSetting
  | StepperSetting
  | DropdownSetting;

export type SettingSection = {
  title: string;
  defaultOpen?: boolean;
  settings: SettingDefinition[];
};

export type NumericFieldState = {
  draft: string;
  value: number;
};

export type DropdownFieldState = {
  value: string;
};

export type SettingFieldState = NumericFieldState | DropdownFieldState;

export type SettingsSectionState = Record<string, SettingFieldState>;

export type SidebarSettingsState = Record<string, SettingsSectionState>;

function countDecimals(step: number) {
  const [, decimals = ""] = String(step).split(".");
  return decimals.length;
}

export function formatNumericSettingValue(
  value: number,
  mode: NumericMode,
  step: number,
) {
  if (mode === "decimal") {
    return value.toFixed(Math.max(1, countDecimals(step)));
  }

  return String(Math.round(value));
}

export function createSidebarSettingsState(
  sections: SettingSection[],
): SidebarSettingsState {
  return Object.fromEntries(
    sections.map((section) => [
      section.title,
      Object.fromEntries(
        section.settings.map((setting) => {
          if (setting.kind === "dropdown") {
            return [setting.label, { value: setting.initialValue }];
          }

          return [
            setting.label,
            {
              draft: formatNumericSettingValue(
                setting.initialValue,
                setting.mode,
                setting.step,
              ),
              value: setting.initialValue,
            },
          ];
        }),
      ),
    ]),
  ) as SidebarSettingsState;
}

export function cloneSidebarSettingsState(
  settingsState: SidebarSettingsState,
): SidebarSettingsState {
  return Object.fromEntries(
    Object.entries(settingsState).map(([sectionTitle, sectionState]) => [
      sectionTitle,
      Object.fromEntries(
        Object.entries(sectionState).map(([label, fieldState]) => [label, { ...fieldState }]),
      ),
    ]),
  ) as SidebarSettingsState;
}

function clampValue(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function normalizeNumericSettingValue(
  value: number,
  min: number,
  max: number,
  step: number,
) {
  const precision = Math.max(countDecimals(step), countDecimals(min));
  const clampedValue = clampValue(value, min, max);
  const steppedValue = min + Math.round((clampedValue - min) / step) * step;

  return Number(clampValue(steppedValue, min, max).toFixed(precision));
}

export function normalizeSidebarSettingsState(
  settingsState: SidebarSettingsState,
  sections: SettingSection[],
): SidebarSettingsState {
  return Object.fromEntries(
    sections.map((section) => [
      section.title,
      Object.fromEntries(
        section.settings.map((setting) => {
          const currentFieldState = settingsState[section.title][setting.label];

          if (setting.kind === "dropdown") {
            return [setting.label, { ...currentFieldState }];
          }

          const numericFieldState = currentFieldState as NumericFieldState;
          const parsedDraft = Number(numericFieldState.draft);
          const rawValue =
            numericFieldState.draft.trim() === "" || Number.isNaN(parsedDraft)
              ? numericFieldState.value
              : parsedDraft;
          const normalizedValue = normalizeNumericSettingValue(
            rawValue,
            setting.min,
            setting.max,
            setting.step,
          );

          return [
            setting.label,
            {
              draft: formatNumericSettingValue(
                normalizedValue,
                setting.mode,
                setting.step,
              ),
              value: normalizedValue,
            },
          ];
        }),
      ),
    ]),
  ) as SidebarSettingsState;
}
