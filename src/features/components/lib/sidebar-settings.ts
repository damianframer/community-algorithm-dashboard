import type { SettingSection } from "@/features/settings/lib/settings-state";

export const componentsSidebarSections: SettingSection[] = [
  {
    title: "Weight Metrics",
    settings: [
      {
        label: "Opens",
        description:
          "How many times the component page was opened. Higher value: raw page interest matters more.",
        kind: "stepper",
        initialValue: 3,
        min: 0,
        max: 15,
        step: 1,
        mode: "integer",
      },
      {
        label: "Unique Users",
        description:
          "How many distinct users used the component. Higher value: broad adoption matters more.",
        kind: "stepper",
        initialValue: 10,
        min: 0,
        max: 30,
        step: 1,
        mode: "integer",
      },
      {
        label: "Project Installs",
        description:
          "How many times the component was installed into projects. Strongest raw adoption signal. If paid normalization is on, adjusted installs are used.",
        kind: "stepper",
        initialValue: 15,
        min: 0,
        max: 40,
        step: 1,
        mode: "integer",
      },
      {
        label: "Project Spread",
        description:
          "How many separate projects use the component. Higher value: cross-project adoption matters more.",
        kind: "stepper",
        initialValue: 12,
        min: 0,
        max: 35,
        step: 1,
        mode: "integer",
      },
    ],
  },
  {
    title: "Rate Metrics",
    defaultOpen: true,
    settings: [
      {
        label: "Copy Rate",
        description:
          "How often a component is installed after being opened. Higher value: install conversion matters more.",
        kind: "slider",
        initialValue: 20,
        min: 0,
        max: 50,
        step: 1,
        mode: "integer",
      },
      {
        label: "Average Copies per User",
        description:
          "How many times each user installs the component on average. Higher value: repeated reuse matters more.",
        kind: "slider",
        initialValue: 10,
        min: 0,
        max: 40,
        step: 1,
        mode: "integer",
      },
    ],
  },
  {
    title: "Paid Normalization",
    defaultOpen: true,
    settings: [
      {
        label: "Paid Views Multiplier",
        description:
          "Boosts open signals for paid components so they stay competitive. Higher value: paid component page views count more.",
        kind: "stepper",
        initialValue: 1.2,
        min: 1,
        max: 3,
        step: 0.1,
        mode: "decimal",
      },
      {
        label: "Paid Install Multiplier",
        description:
          "Boosts install signals for paid components. Higher value: paid component installs count more.",
        kind: "stepper",
        initialValue: 1.5,
        min: 1,
        max: 4,
        step: 0.1,
        mode: "decimal",
      },
    ],
  },
  {
    title: "Time",
    defaultOpen: true,
    settings: [
      {
        label: "Lookback Window",
        description:
          "How far back the system looks when calculating metrics. Higher value: older activity is included.",
        kind: "dropdown",
        initialValue: "30 days",
        options: ["7 days", "14 days", "30 days", "60 days", "90 days"],
      },
      {
        label: "Recency Weight",
        description:
          "How much recent performance contributes to the blended score. Higher value: recent activity matters more.",
        kind: "slider",
        initialValue: 60,
        min: 0,
        max: 100,
        step: 1,
        mode: "integer",
      },
      {
        label: "Lifetime Weight",
        description:
          "How much historical performance contributes to the blended score. Higher value: lifetime track record matters more.",
        kind: "slider",
        initialValue: 40,
        min: 0,
        max: 100,
        step: 1,
        mode: "integer",
      },
      {
        label: "Fresh Component Boost",
        description:
          "Temporary visibility boost for new components. Higher value: new components get more initial exposure.",
        kind: "stepper",
        initialValue: 12,
        min: 0,
        max: 40,
        step: 1,
        mode: "integer",
      },
      {
        label: "Fresh Boost Duration",
        description:
          "How long the fresh component boost remains active. Higher value: new components stay boosted longer.",
        kind: "stepper",
        initialValue: 14,
        min: 3,
        max: 60,
        step: 1,
        mode: "integer",
      },
    ],
  },
  {
    title: "Momentum",
    defaultOpen: true,
    settings: [
      {
        label: "Window",
        description:
          "Time window used to compare recent growth against previous period.",
        kind: "dropdown",
        initialValue: "7 days",
        options: ["3 days", "7 days", "14 days", "30 days"],
      },
      {
        label: "Weight",
        description:
          "How much momentum contributes to the final score. Higher value: fast-growing components rise faster.",
        kind: "stepper",
        initialValue: 15,
        min: 0,
        max: 60,
        step: 1,
        mode: "integer",
      },
      {
        label: "Acceleration",
        description:
          "Rewards components whose growth is speeding up. Higher value: accelerating components rise even faster.",
        kind: "stepper",
        initialValue: 8,
        min: 0,
        max: 30,
        step: 1,
        mode: "integer",
      },
    ],
  },
  {
    title: "Minimum Statistics",
    settings: [
      {
        label: "Min Unique Users",
        description:
          "Minimum unique users before a component can trend. Higher value: components need more users to qualify.",
        kind: "stepper",
        initialValue: 10,
        min: 0,
        max: 200,
        step: 1,
        mode: "integer",
      },
      {
        label: "Min Installs",
        description:
          "Minimum project installs before a component can trend. Higher value: components need more installs to qualify.",
        kind: "stepper",
        initialValue: 15,
        min: 0,
        max: 300,
        step: 1,
        mode: "integer",
      },
      {
        label: "Paid Min Unique Users",
        description:
          "Lower unique-users threshold for paid components. Higher value: paid components still need meaningful adoption.",
        kind: "stepper",
        initialValue: 5,
        min: 0,
        max: 100,
        step: 1,
        mode: "integer",
      },
      {
        label: "Paid Min Installs",
        description:
          "Lower installs threshold for paid components. Higher value: paid components still need meaningful installs.",
        kind: "stepper",
        initialValue: 8,
        min: 0,
        max: 150,
        step: 1,
        mode: "integer",
      },
    ],
  },
  {
    title: "Rotation",
    settings: [
      {
        label: "Duration Decay",
        description:
          "How quickly a trending component's score is reduced over time. Higher value: components rotate out of trending faster.",
        kind: "stepper",
        initialValue: 0.08,
        min: 0,
        max: 0.5,
        step: 0.01,
        mode: "decimal",
      },
      {
        label: "Max Days",
        description:
          "Maximum days a component can stay in trending before becoming ineligible.",
        kind: "stepper",
        initialValue: 14,
        min: 3,
        max: 60,
        step: 1,
        mode: "integer",
      },
      {
        label: "Cooldown",
        description:
          "Days a component must wait after dropping out of trending before it can re-enter.",
        kind: "stepper",
        initialValue: 7,
        min: 1,
        max: 60,
        step: 1,
        mode: "integer",
      },
    ],
  },
  {
    title: "Exploration",
    settings: [
      {
        label: "Exploration %",
        description:
          "Percentage of trending slots reserved for newer or underexposed components. Higher value: more discovery slots.",
        kind: "slider",
        initialValue: 15,
        min: 0,
        max: 40,
        step: 1,
        mode: "integer",
      },
    ],
  },
  {
    title: "Diversity",
    settings: [
      {
        label: "Creator Cap",
        description:
          "Limits how many components from the same creator can appear at once. Higher value: creators can have more components in the feed.",
        kind: "stepper",
        initialValue: 3,
        min: 1,
        max: 10,
        step: 1,
        mode: "integer",
      },
      {
        label: "Category Cap",
        description:
          "Limits how many components from the same category can appear. Higher value: more components from the same category can appear together.",
        kind: "stepper",
        initialValue: 4,
        min: 1,
        max: 10,
        step: 1,
        mode: "integer",
      },
    ],
  },
  {
    title: "Overrides",
    settings: [
      {
        label: "Boost",
        description:
          "Manual ranking boost multiplier. Example: 1.2 = +20% ranking boost.",
        kind: "stepper",
        initialValue: 1.2,
        min: 1,
        max: 3,
        step: 0.1,
        mode: "decimal",
      },
      {
        label: "Decay",
        description:
          "Manual ranking reduction multiplier. Example: 0.8 = -20% ranking reduction.",
        kind: "stepper",
        initialValue: 0.8,
        min: 0.1,
        max: 1,
        step: 0.1,
        mode: "decimal",
      },
    ],
  },
];
