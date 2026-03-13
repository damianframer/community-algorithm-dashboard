"use client";

import { useState } from "react";

import { SettingsInputGroup } from "@/features/settings/components/setting-controls";
import {
  areSidebarSettingsEqual,
  type SidebarSettingsState,
} from "@/features/settings/lib/settings-state";
import { vectorsSidebarSections } from "@/features/vectors/lib/sidebar-settings";

type VectorsSidebarProps = {
  onResetSettings: () => void;
  onSaveSettings: () => void;
  onSearchChange: (value: string) => void;
  onSettingsChange: (value: SidebarSettingsState) => void;
  savedSettingsState: SidebarSettingsState;
  searchQuery: string;
  settingsState: SidebarSettingsState;
};

function SidebarArrow() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M2 4L6 8L10 4"
        stroke="#999999"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function VectorsSidebar({
  onResetSettings,
  onSaveSettings,
  onSearchChange,
  onSettingsChange,
  savedSettingsState,
  searchQuery,
  settingsState,
}: VectorsSidebarProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      vectorsSidebarSections.map((section) => [
        section.title,
        !!section.defaultOpen,
      ]),
    ),
  );
  const isDirty = !areSidebarSettingsEqual(settingsState, savedSettingsState);

  return (
    <aside className={isDirty ? "sidebar hasPendingChanges" : "sidebar"}>
      <div className="searchWrap">
        <input
          className="searchInput"
          type="search"
          placeholder="Search vectors..."
          aria-label="Search vectors"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <div className="settingRows">
        {vectorsSidebarSections.map((section) => {
          const isOpen = openSections[section.title];

          return (
            <section
              key={section.title}
              className={isOpen ? "settingGroup isOpen" : "settingGroup"}
            >
              <button
                type="button"
                className="settingRow"
                onClick={() =>
                  setOpenSections((current) => ({
                    ...current,
                    [section.title]: !current[section.title],
                  }))
                }
                aria-expanded={isOpen}
              >
                <span className="settingRowTitle">{section.title}</span>
                <span className="settingRowArrow">
                  <SidebarArrow />
                </span>
              </button>
              <div className={isOpen ? "settingRowBody" : "settingRowBody isCollapsed"}>
                <SettingsInputGroup
                  settings={section.settings}
                  fieldState={settingsState[section.title]}
                  onFieldStateChange={(updater) =>
                    onSettingsChange({
                      ...settingsState,
                      [section.title]: updater(settingsState[section.title]),
                    })
                  }
                />
              </div>
            </section>
          );
        })}
      </div>

      <div className="settingsActionBar" aria-hidden={!isDirty}>
        <button
          type="button"
          className="settingsActionButton"
          onClick={onResetSettings}
        >
          Reset
        </button>
        <button
          type="button"
          className="settingsActionButton primary"
          onClick={onSaveSettings}
        >
          Save Changes
        </button>
      </div>
    </aside>
  );
}
