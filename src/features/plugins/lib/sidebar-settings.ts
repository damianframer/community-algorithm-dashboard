import type { SettingSection } from "@/features/settings/lib/settings-state";

export const pluginsSidebarSections: SettingSection[] = [
  {
    title: "Weight Metrics",
    settings: [
      {
        label: "Plugin Opens",
        description:
          "How many times the plugin is opened. Higher value: raw plugin usage matters more.",
        kind: "stepper",
        initialValue: 10,
        min: 0,
        max: 40,
        step: 1,
        mode: "integer",
      },
      {
        label: "Unique Users",
        description:
          "How many different users have used the plugin. Higher value: broad adoption matters more.",
        kind: "stepper",
        initialValue: 15,
        min: 0,
        max: 50,
        step: 1,
        mode: "integer",
      },
      {
        label: "Weekly Active Users",
        description:
          "Strong signal of active usage. Higher value: active weekly engagement matters more.",
        kind: "stepper",
        initialValue: 20,
        min: 0,
        max: 60,
        step: 1,
        mode: "integer",
      },
      {
        label: "Average Opens per User",
        description:
          "How often users use the plugin after discovering it. Higher value: repeated use per user matters more.",
        kind: "stepper",
        initialValue: 10,
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
        label: "Open Rate",
        description:
          "How often people open the plugin after viewing its page. Higher value: page-to-use conversion matters more.",
        kind: "slider",
        initialValue: 15,
        min: 0,
        max: 40,
        step: 1,
        mode: "integer",
      },
      {
        label: "Repeat Open Rate",
        description:
          "Whether users return to the plugin. Strong retention signal. Higher value: repeat usage matters more.",
        kind: "slider",
        initialValue: 20,
        min: 0,
        max: 60,
        step: 1,
        mode: "integer",
      },
      {
        label: "Bounce Rate Proxy",
        description:
          "Users who open once and never return. This value reduces the score. Higher value: one-and-done behavior is penalized more.",
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
        label: "Paid Open Multiplier",
        description:
          "Boosts open signals for paid plugins so they stay competitive. Higher value: paid plugin opens count more.",
        kind: "stepper",
        initialValue: 1.2,
        min: 1,
        max: 3,
        step: 0.1,
        mode: "decimal",
      },
      {
        label: "Paid WAU Multiplier",
        description:
          "Boosts weekly active user signals for paid plugins. Helps paid plugins compete with free ones.",
        kind: "stepper",
        initialValue: 1.3,
        min: 1,
        max: 3,
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
          "How much recent performance contributes. Plugins benefit more from recency because tools evolve quickly.",
        kind: "slider",
        initialValue: 65,
        min: 0,
        max: 100,
        step: 1,
        mode: "integer",
      },
      {
        label: "Lifetime Weight",
        description:
          "How much historical success matters. Higher value: lifetime track record matters more.",
        kind: "slider",
        initialValue: 35,
        min: 0,
        max: 100,
        step: 1,
        mode: "integer",
      },
    ],
  },
  {
    title: "Plugin Maintenance",
    defaultOpen: true,
    settings: [
      {
        label: "Update Freshness Weight",
        description:
          "How much plugin update freshness matters. Recently updated plugins get a boost. Higher value: maintenance matters more.",
        kind: "slider",
        initialValue: 15,
        min: 0,
        max: 40,
        step: 1,
        mode: "integer",
      },
      {
        label: "Max Update Age",
        description:
          "If a plugin has not been updated past this threshold, its ranking is reduced. Higher value: plugins can go longer without updates.",
        kind: "stepper",
        initialValue: 180,
        min: 30,
        max: 730,
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
          "How much momentum contributes to the final score. Higher value: fast-growing plugins rise faster.",
        kind: "stepper",
        initialValue: 15,
        min: 0,
        max: 50,
        step: 1,
        mode: "integer",
      },
      {
        label: "Acceleration",
        description:
          "Rewards plugins that are gaining momentum faster. Higher value: accelerating growth matters more.",
        kind: "stepper",
        initialValue: 8,
        min: 0,
        max: 25,
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
          "Minimum unique users before a plugin can trend. Higher value: plugins need more users to qualify.",
        kind: "stepper",
        initialValue: 20,
        min: 0,
        max: 500,
        step: 1,
        mode: "integer",
      },
      {
        label: "Min Weekly Active Users",
        description:
          "Minimum weekly active users before a plugin can trend. Higher value: plugins need more active users to qualify.",
        kind: "stepper",
        initialValue: 10,
        min: 0,
        max: 300,
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
          "How quickly a trending plugin's score is reduced over time. Higher value: plugins rotate out faster.",
        kind: "stepper",
        initialValue: 0.06,
        min: 0,
        max: 0.5,
        step: 0.01,
        mode: "decimal",
      },
      {
        label: "Max Days",
        description:
          "Maximum days a plugin can stay in trending before becoming ineligible.",
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
          "Days a plugin must wait after dropping out of trending before it can re-enter.",
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
          "Percentage of trending slots reserved for newer plugins. Higher value: more discovery slots.",
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
          "Limits how many plugins from the same creator can appear at once. Higher value: creators can have more plugins in the feed.",
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
          "Limits how many plugins from the same category can appear. Higher value: more plugins from the same category can appear together.",
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
