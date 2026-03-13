"use client";

import { useEffect, useRef, useState } from "react";

import {
  formatNumericSettingValue,
  normalizeNumericSettingValue,
  type NumericFieldState,
  type SettingDefinition,
  type SettingsSectionState,
} from "@/features/settings/lib/settings-state";

type NumericSetting = Extract<SettingDefinition, { kind: "slider" | "stepper" }>;
type DropdownSetting = Extract<SettingDefinition, { kind: "dropdown" }>;

type NumericControlProps = {
  description: string;
  label: string;
  draft: string;
  effectNote?: string;
  maxValueLabel: string;
  minValueLabel: string;
  value: number;
  onBlur: () => void;
  onDraftChange: (value: string) => void;
  onArrowStep: (direction: -1 | 1) => void;
};

type SliderControlProps = NumericControlProps & {
  min: number;
  max: number;
  step: number;
  onSliderChange: (value: number) => void;
};

type NumericInputProps = {
  value: string;
  onBlur: () => void;
  onChange: (value: string) => void;
  onArrowStep: (direction: -1 | 1) => void;
};

function NumericInput({
  value,
  onBlur,
  onChange,
  onArrowStep,
}: NumericInputProps) {
  return (
    <input
      className="controlNumberInput"
      type="text"
      inputMode="decimal"
      value={value}
      onBlur={onBlur}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === "ArrowUp") {
          event.preventDefault();
          onArrowStep(1);
        }

        if (event.key === "ArrowDown") {
          event.preventDefault();
          onArrowStep(-1);
        }
      }}
    />
  );
}

function SettingLabel({
  description,
  effectNote,
  label,
  maxValueLabel,
  minValueLabel,
}: {
  description: string;
  effectNote?: string;
  label: string;
  maxValueLabel?: string;
  minValueLabel?: string;
}) {
  const timerRef = useRef<number | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(
    () => () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    },
    [],
  );

  function clearTooltipTimer() {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  function handleTooltipEnter() {
    clearTooltipTimer();
    timerRef.current = window.setTimeout(() => {
      setShowTooltip(true);
    }, 800);
  }

  function handleTooltipLeave() {
    clearTooltipTimer();
    setShowTooltip(false);
  }

  const descriptionMatch = description.match(
    /^(.*?)(Higher value:.*|Lower value:.*)$/,
  );
  const primaryDescription = descriptionMatch?.[1].trim() ?? description;
  const secondaryDescription = descriptionMatch?.[2].trim() ?? "";

  return (
    <span
      className="settingControlLabelWrap"
      onMouseEnter={handleTooltipEnter}
      onMouseLeave={handleTooltipLeave}
      onFocus={handleTooltipEnter}
      onBlur={handleTooltipLeave}
      tabIndex={0}
    >
      <span className="settingControlLabel">
        {label}
      </span>
      {showTooltip ? (
        <span className="settingControlTooltip" role="tooltip">
          <span className="settingControlTooltipTitleWrap">
            <span className="settingControlTooltipTitle">{label}</span>
            {minValueLabel && maxValueLabel ? (
              <span className="settingControlTooltipRange">
                <span className="settingControlTooltipRangeValue">
                  min: {minValueLabel}
                </span>
                <span className="settingControlTooltipRangeDivider" />
                <span className="settingControlTooltipRangeValue">
                  max: {maxValueLabel}
                </span>
              </span>
            ) : null}
          </span>
          <span className="settingControlTooltipBody">
            <span className="settingControlTooltipDescription">
              {primaryDescription}
            </span>
            {secondaryDescription ? (
              <>
                <span className="settingControlTooltipDivider" />
                <span className="settingControlTooltipDescription">
                  {secondaryDescription}
                </span>
              </>
            ) : null}
            {effectNote ? (
              <>
                <span className="settingControlTooltipDivider" />
                <span className="settingControlTooltipEffect">
                  {effectNote}
                </span>
              </>
            ) : null}
          </span>
        </span>
      ) : null}
    </span>
  );
}

function SliderControl(props: SliderControlProps) {
  const {
    description,
    draft,
    label,
    max,
    maxValueLabel,
    min,
    minValueLabel,
    onArrowStep,
    onBlur,
    onDraftChange,
    onSliderChange,
    step,
    value,
  } = props;
  const progress = ((value - min) / (max - min)) * 100;

  return (
    <div className="settingControl">
      <SettingLabel
        label={label}
        description={description}
        effectNote={props.effectNote}
        minValueLabel={minValueLabel}
        maxValueLabel={maxValueLabel}
      />
      <NumericInput
        value={draft}
        onBlur={onBlur}
        onChange={onDraftChange}
        onArrowStep={onArrowStep}
      />
      <input
        className="sliderInput"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        style={{ ["--progress" as string]: `${progress}%` }}
        onInput={(event) => onSliderChange(Number(event.currentTarget.value))}
        aria-label={label}
      />
    </div>
  );
}

function MinusIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect y="4" width="9.5" height="1.5" rx="0.75" fill="#999999" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect y="4" width="9.5" height="1.5" rx="0.75" fill="#999999" />
      <rect
        x="5.5"
        width="9.5"
        height="1.5"
        rx="0.75"
        transform="rotate(90 5.5 0)"
        fill="#999999"
      />
    </svg>
  );
}

function StepperControl(props: NumericControlProps) {
  const {
    description,
    draft,
    label,
    maxValueLabel,
    minValueLabel,
    onArrowStep,
    onBlur,
    onDraftChange,
  } = props;

  return (
    <div className="settingControl">
      <SettingLabel
        label={label}
        description={description}
        effectNote={props.effectNote}
        minValueLabel={minValueLabel}
        maxValueLabel={maxValueLabel}
      />
      <NumericInput
        value={draft}
        onBlur={onBlur}
        onChange={onDraftChange}
        onArrowStep={onArrowStep}
      />
      <div className="stepperControl" aria-label={`${label} stepper`}>
        <button
          type="button"
          className="stepperButton"
          onClick={() => onArrowStep(-1)}
          aria-label={`Decrease ${label}`}
        >
          <MinusIcon />
        </button>
        <span className="stepperDivider" />
        <button
          type="button"
          className="stepperButton"
          onClick={() => onArrowStep(1)}
          aria-label={`Increase ${label}`}
        >
          <PlusIcon />
        </button>
      </div>
    </div>
  );
}

function DropdownArrow() {
  return (
    <svg
      width="8"
      height="8"
      viewBox="0 0 8 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M1.33325 2.66663L3.99992 5.33329L6.66659 2.66663"
        stroke="#999999"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

type DropdownControlProps = {
  description: string;
  effectNote?: string;
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
};

function DropdownControl({
  description,
  effectNote,
  label,
  onChange,
  options,
  value,
}: DropdownControlProps) {
  return (
    <label className="settingControl">
      <SettingLabel
        label={label}
        description={description}
        effectNote={effectNote}
      />
      <span className="dropdownField">
        <select
          className="dropdownSelect"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-label={label}
        >
          {options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
        <span className="dropdownArrow">
          <DropdownArrow />
        </span>
      </span>
    </label>
  );
}

function inferSettingEffectNote(setting: SettingDefinition) {
  if (setting.effectNote) {
    return setting.effectNote;
  }

  const label = setting.label.toLowerCase();
  const description = setting.description.toLowerCase();

  if (setting.kind === "dropdown") {
    return "Effect: Changes a calculation rule or time window, not a direct score add.";
  }

  if (label.includes("multiplier") || description.includes("multiplier")) {
    return "Effect: Multiplies the underlying signal before scoring.";
  }

  if (
    label.includes("min.") ||
    label.includes("threshold") ||
    label.includes("cooldown") ||
    label.includes("cap") ||
    label.includes("max days") ||
    label.includes("window") ||
    label.includes("duration") ||
    label.includes("half-life") ||
    description.includes("minimum") ||
    description.includes("limits how many") ||
    description.includes("must wait") ||
    description.includes("stay in trending") ||
    description.includes("appear in trending") ||
    description.includes("reserved for")
  ) {
    return "Effect: Changes eligibility or feed rules, not a direct score add.";
  }

  if (label.includes("boost")) {
    return "Effect: Adds directly to the score component.";
  }

  if (label.includes("decay")) {
    return "Effect: Applies a score penalty over time or under a rule.";
  }

  return "Effect: Adds weighted score based on this signal.";
}

type SettingsInputGroupProps = {
  fieldState: SettingsSectionState;
  onFieldStateChange: (
    updater: (current: SettingsSectionState) => SettingsSectionState,
  ) => void;
  settings: SettingDefinition[];
};

export function SettingsInputGroup({
  fieldState,
  onFieldStateChange,
  settings,
}: SettingsInputGroupProps) {
  function updateNumericValue(setting: NumericSetting, nextValue: number) {
    const safeValue = normalizeNumericSettingValue(
      nextValue,
      setting.min,
      setting.max,
      setting.step,
    );

    onFieldStateChange((current) => ({
      ...current,
      [setting.label]: {
        draft: formatNumericSettingValue(safeValue, setting.mode, setting.step),
        value: safeValue,
      },
    }));
  }

  function handleDraftChange(setting: NumericSetting, nextDraft: string) {
    onFieldStateChange((current) => {
      const currentState = current[setting.label] as NumericFieldState;
      const parsed = Number(nextDraft);

      return {
        ...current,
        [setting.label]: {
          draft: nextDraft,
          value: Number.isNaN(parsed)
            ? currentState.value
            : normalizeNumericSettingValue(
                parsed,
                setting.min,
                setting.max,
                setting.step,
              ),
        },
      };
    });
  }

  function handleBlur(setting: NumericSetting) {
    const currentState = fieldState[setting.label] as NumericFieldState;

    if (currentState.draft.trim() === "") {
      updateNumericValue(setting, 0);
      return;
    }

    const parsed = Number(currentState.draft);
    updateNumericValue(setting, Number.isNaN(parsed) ? currentState.value : parsed);
  }

  function handleArrowStep(setting: NumericSetting, direction: -1 | 1) {
    const currentState = fieldState[setting.label] as NumericFieldState;
    const baseValue =
      currentState.draft.trim() === "" ? 0 : Number(currentState.draft);
    const nextValue =
      Number.isNaN(baseValue) ? currentState.value : baseValue + setting.step * direction;

    updateNumericValue(setting, nextValue);
  }

  function handleDropdownChange(setting: DropdownSetting, nextValue: string) {
    onFieldStateChange((current) => ({
      ...current,
      [setting.label]: { value: nextValue },
    }));
  }

  return (
    <div className="settingsInputExamples">
      {settings.map((setting) => {
        if (setting.kind === "slider") {
          const currentState = fieldState[setting.label] as NumericFieldState;

          return (
            <SliderControl
              key={setting.label}
              description={setting.description}
              draft={currentState.draft}
              effectNote={inferSettingEffectNote(setting)}
              label={setting.label}
              max={setting.max}
              maxValueLabel={formatNumericSettingValue(
                setting.max,
                setting.mode,
                setting.step,
              )}
              min={setting.min}
              minValueLabel={formatNumericSettingValue(
                setting.min,
                setting.mode,
                setting.step,
              )}
              onArrowStep={(direction) => handleArrowStep(setting, direction)}
              onBlur={() => handleBlur(setting)}
              onDraftChange={(nextDraft) => handleDraftChange(setting, nextDraft)}
              onSliderChange={(nextValue) => updateNumericValue(setting, nextValue)}
              step={setting.step}
              value={currentState.value}
            />
          );
        }

        if (setting.kind === "stepper") {
          const currentState = fieldState[setting.label] as NumericFieldState;

          return (
            <StepperControl
              key={setting.label}
              description={setting.description}
              draft={currentState.draft}
              effectNote={inferSettingEffectNote(setting)}
              label={setting.label}
              maxValueLabel={formatNumericSettingValue(
                setting.max,
                setting.mode,
                setting.step,
              )}
              minValueLabel={formatNumericSettingValue(
                setting.min,
                setting.mode,
                setting.step,
              )}
              onArrowStep={(direction) => handleArrowStep(setting, direction)}
              onBlur={() => handleBlur(setting)}
              onDraftChange={(nextDraft) => handleDraftChange(setting, nextDraft)}
              value={currentState.value}
            />
          );
        }

        const currentState = fieldState[setting.label] as { value: string };

        return (
          <DropdownControl
            key={setting.label}
              description={setting.description}
              effectNote={inferSettingEffectNote(setting)}
              label={setting.label}
              options={setting.options}
            value={currentState.value}
            onChange={(nextValue) => handleDropdownChange(setting, nextValue)}
          />
        );
      })}
    </div>
  );
}
