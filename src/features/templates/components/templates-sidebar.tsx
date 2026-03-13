"use client";

import { useState } from "react";

import { SettingsInputGroup } from "@/features/settings/components/setting-controls";
import {
  areSidebarSettingsEqual,
  type SidebarSettingsState,
} from "@/features/settings/lib/settings-state";
import { templatesSidebarSections } from "@/features/templates/lib/sidebar-settings";

type TemplatesSidebarProps = {
  savedSettingsState: SidebarSettingsState;
  settingsState: SidebarSettingsState;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSettingsChange: (value: SidebarSettingsState) => void;
  onResetSettings: () => void;
  onSaveSettings: () => void;
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

export function TemplatesSidebar({
  savedSettingsState,
  settingsState,
  onResetSettings,
  onSaveSettings,
  onSettingsChange,
  onSearchChange,
  searchQuery,
}: TemplatesSidebarProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      templatesSidebarSections.map((section) => [section.title, !!section.defaultOpen]),
    ),
  );
  const isDirty = !areSidebarSettingsEqual(settingsState, savedSettingsState);

  return (
    <aside className={isDirty ? "sidebar hasPendingChanges" : "sidebar"}>
      <div className="searchWrap">
        <input
          className="searchInput"
          type="search"
          placeholder="Search templates..."
          aria-label="Search templates"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <div className="settingRows">
        {templatesSidebarSections.map((row) => {
          const isOpen = openSections[row.title];

          return (
            <section
              key={row.title}
              className={isOpen ? "settingGroup isOpen" : "settingGroup"}
            >
              <button
                type="button"
                className="settingRow"
                onClick={() =>
                  setOpenSections((current) => ({
                    ...current,
                    [row.title]: !current[row.title],
                  }))
                }
                aria-expanded={isOpen}
              >
                <span className="settingRowTitle">{row.title}</span>
                <span className="settingRowArrow">
                  <SidebarArrow />
                </span>
              </button>
              <div className={isOpen ? "settingRowBody" : "settingRowBody isCollapsed"}>
                <SettingsInputGroup
                  settings={row.settings}
                  fieldState={settingsState[row.title]}
                  onFieldStateChange={(updater) =>
                    onSettingsChange({
                      ...settingsState,
                      [row.title]: updater(settingsState[row.title]),
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
