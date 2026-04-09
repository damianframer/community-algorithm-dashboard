import type { SettingSection } from "@/features/settings/lib/settings-state";

export const templateWorkspaceSidebarSections: SettingSection[] = [
  {
    title: "Time Window",
    defaultOpen: true,
    settings: [
      {
        label: "Lookback window",
        description:
          "How far back the current template ranking looks when scoring templates. This variant only uses the selected recent window and ignores lifetime history.",
        kind: "dropdown",
        initialValue: "30 days",
        options: ["7 days", "30 days"],
      },
      {
        label: "Minimum Views",
        description:
          "Templates need at least this many views in the selected 7d or 30d window to be included in this ranking.",
        kind: "slider",
        initialValue: 600,
        min: 200,
        max: 2000,
        step: 25,
        mode: "integer",
      },
    ],
  },
  {
    title: "Trending Rotation",
    defaultOpen: true,
    settings: [
      {
        label: "Freshness window",
        description:
          "Templates inside this age window can get a small lift and qualify for reserved exploration slots.",
        kind: "slider",
        initialValue: 45,
        min: 0,
        max: 90,
        step: 5,
        mode: "integer",
      },
      {
        label: "Reserved exploration share",
        description:
          "Reserves part of the first 48 positions for newer or exploration-eligible templates when available.",
        kind: "slider",
        initialValue: 15,
        min: 0,
        max: 40,
        step: 1,
        mode: "integer",
      },
      {
        label: "Weighted exposure threshold",
        description:
          "How much 30d display exposure a template can accumulate before anti-dominance decay starts.",
        kind: "stepper",
        initialValue: 24,
        min: 0,
        max: 120,
        step: 1,
        mode: "integer",
      },
      {
        label: "Exposure decay rate",
        description:
          "How quickly score decays once weighted exposure crosses the threshold. Lower value means stronger decay.",
        kind: "stepper",
        initialValue: 0.985,
        min: 0.9,
        max: 1,
        step: 0.005,
        mode: "decimal",
      },
      {
        label: "Top-48 streak threshold",
        description:
          "How many consecutive days a template can stay in the first 48 displayed positions before streak decay starts.",
        kind: "stepper",
        initialValue: 5,
        min: 0,
        max: 21,
        step: 1,
        mode: "integer",
      },
    ],
  },
  {
    title: "Core Score",
    defaultOpen: true,
    settings: [
      {
        label: "Preview Rate",
        description:
          "How many page visits turn into preview opens. Higher value: intrigue matters more.",
        kind: "slider",
        initialValue: 10,
        min: 0,
        max: 30,
        step: 1,
        mode: "integer",
      },
      {
        label: "Remix Rate",
        description:
          "How many preview opens turn into remixes. Higher value: usage intent matters more.",
        kind: "slider",
        initialValue: 24,
        min: 0,
        max: 40,
        step: 1,
        mode: "integer",
      },
      {
        label: "Active Site Rate",
        description:
          "How many remixes become active sites. Higher value: user success matters more.",
        kind: "slider",
        initialValue: 10,
        min: 0,
        max: 30,
        step: 1,
        mode: "integer",
      },
      {
        label: "Conversion Rate",
        description:
          "How many remixes lead to conversions. Higher value: business outcome matters more.",
        kind: "slider",
        initialValue: 2,
        min: 0,
        max: 40,
        step: 1,
        mode: "integer",
      },
    ],
  },
];
