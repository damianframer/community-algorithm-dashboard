import type { SettingSection } from "@/features/settings/lib/settings-state";

export const tutorialsSidebarSections: SettingSection[] = [
  {
    title: "Weight Metrics",
    settings: [
      {
        label: "Views",
        description:
          "How many times the tutorial page is opened. Higher value: raw popularity matters more.",
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
          "How many different people read the tutorial. Better signal than raw views. Higher value: broad reach matters more.",
        kind: "stepper",
        initialValue: 15,
        min: 0,
        max: 50,
        step: 1,
        mode: "integer",
      },
      {
        label: "Remix Clicks",
        description:
          "How many times the remix project link was clicked. Only relevant for tutorials with a remixable project. Keep lower weight since not all tutorials have remix links.",
        kind: "stepper",
        initialValue: 6,
        min: 0,
        max: 25,
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
        label: "Remix Rate",
        description:
          "How often people click the remix project after reading the tutorial. Higher value: conversion to remix matters more.",
        kind: "slider",
        initialValue: 12,
        min: 0,
        max: 40,
        step: 1,
        mode: "integer",
      },
      {
        label: "Return View Rate",
        description:
          "Whether users come back to the tutorial later. Strong quality signal. Higher value: repeat visits matter more.",
        kind: "slider",
        initialValue: 15,
        min: 0,
        max: 50,
        step: 1,
        mode: "integer",
      },
    ],
  },
  {
    title: "Tutorial Duration Adjustment",
    defaultOpen: true,
    settings: [
      {
        label: "Duration Multiplier",
        description:
          "Slightly boosts longer tutorials that naturally get fewer views. Only applied when tutorial exceeds the long-tutorial threshold.",
        kind: "stepper",
        initialValue: 1.0,
        min: 0.8,
        max: 1.5,
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
          "How much recent performance contributes to the blended score. Tutorials benefit more from recency than templates.",
        kind: "slider",
        initialValue: 70,
        min: 0,
        max: 100,
        step: 1,
        mode: "integer",
      },
      {
        label: "Lifetime Weight",
        description:
          "How much historical performance contributes. Older tutorials still matter but should not dominate.",
        kind: "slider",
        initialValue: 30,
        min: 0,
        max: 100,
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
          "How much momentum contributes to the final score. Higher value: trending tutorials rise faster.",
        kind: "stepper",
        initialValue: 12,
        min: 0,
        max: 40,
        step: 1,
        mode: "integer",
      },
      {
        label: "Acceleration",
        description:
          "Boosts tutorials whose popularity is speeding up. Higher value: accelerating interest matters more.",
        kind: "stepper",
        initialValue: 6,
        min: 0,
        max: 20,
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
          "Minimum unique users before a tutorial can trend. Higher value: tutorials need more readers to qualify.",
        kind: "stepper",
        initialValue: 15,
        min: 0,
        max: 200,
        step: 1,
        mode: "integer",
      },
      {
        label: "Min Views",
        description:
          "Minimum views before a tutorial can trend. Higher value: tutorials need more views to qualify.",
        kind: "stepper",
        initialValue: 30,
        min: 0,
        max: 500,
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
          "How quickly a trending tutorial's score is reduced over time. Higher value: tutorials rotate out faster.",
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
          "Maximum days a tutorial can stay in trending before becoming ineligible.",
        kind: "stepper",
        initialValue: 10,
        min: 3,
        max: 45,
        step: 1,
        mode: "integer",
      },
      {
        label: "Cooldown",
        description:
          "Days a tutorial must wait after dropping out of trending before it can re-enter.",
        kind: "stepper",
        initialValue: 5,
        min: 1,
        max: 30,
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
          "Percentage of trending slots reserved for newer tutorials. Higher value: more discovery slots.",
        kind: "slider",
        initialValue: 20,
        min: 0,
        max: 50,
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
          "Limits how many tutorials from the same creator can appear at once. Higher value: creators can have more tutorials in the feed.",
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
          "Limits how many tutorials from the same category can appear. Higher value: more tutorials from the same category can appear together.",
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
          "Manual ranking boost for tutorials the team wants to highlight. Example: 1.2 = +20% boost.",
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
          "Manual ranking reduction for outdated tutorials. Example: 0.8 = -20% reduction.",
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
