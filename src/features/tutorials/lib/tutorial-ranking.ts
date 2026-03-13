import type {
  DropdownFieldState,
  NumericFieldState,
  SidebarSettingsState,
} from "@/features/settings/lib/settings-state";
import {
  applyExplorationOrdering,
  getOverrideMultiplier,
  getRotationState,
  type AdminOverride,
} from "@/features/marketplace/lib/ranking-helpers";

export type TutorialLookbackWindow =
  | "7 days"
  | "14 days"
  | "30 days"
  | "60 days"
  | "90 days";

export type TutorialMomentumWindow = "3 days" | "7 days" | "14 days" | "30 days";

type TutorialPeriodMetrics = {
  remixClicks: number;
  returningUsers: number;
  uniqueUsers: number;
  views: number;
};

type TutorialMomentumMetrics = {
  currentViews: number;
  previousViews: number;
};

type TutorialSeed = {
  ageDays: number;
  daysInTrending: number;
  durationMinutes: number;
  hasRemixProject: boolean;
  isCurrentlyTrending: boolean;
  metrics: Record<TutorialLookbackWindow, TutorialPeriodMetrics>;
  momentum: Record<TutorialMomentumWindow, TutorialMomentumMetrics>;
  name: string;
};

export type TutorialRankingSettings = {
  accelerationWeight: number;
  boost: number;
  categoryCap: number;
  cooldown: number;
  creatorCap: number;
  decay: number;
  durationDecay: number;
  durationMultiplier: number;
  explorationPercent: number;
  lifetimeWeight: number;
  lookbackWindow: TutorialLookbackWindow;
  maxDays: number;
  minUniqueUsers: number;
  minViews: number;
  momentumWeight: number;
  momentumWindow: TutorialMomentumWindow;
  recencyWeight: number;
  remixClicksWeight: number;
  remixRateWeight: number;
  returnViewRateWeight: number;
  uniqueUsersWeight: number;
  viewsWeight: number;
};

export type RankedTutorial = {
  ageDays: number;
  daysInTrending: number;
  durationMinutes: number;
  finalScore: number;
  hasRemixProject: boolean;
  isCurrentlyTrending: boolean;
  isEligible: boolean;
  name: string;
  remixClicks: number;
  remixRate: number;
  returnViewRate: number;
  returningUsers: number;
  uniqueUsers: number;
  views: number;
};

const LONG_TUTORIAL_THRESHOLD_MINUTES = 15;

const tutorialSeeds: TutorialSeed[] = [
  {
    name: "Getting Started with Framer",
    ageDays: 180,
    durationMinutes: 8,
    hasRemixProject: true,
    isCurrentlyTrending: false,
    daysInTrending: 0,
    metrics: {
      "7 days": { views: 4200, uniqueUsers: 2800, remixClicks: 620, returningUsers: 840 },
      "14 days": { views: 7800, uniqueUsers: 5100, remixClicks: 1150, returningUsers: 1530 },
      "30 days": { views: 15200, uniqueUsers: 9800, remixClicks: 2200, returningUsers: 2940 },
      "60 days": { views: 28400, uniqueUsers: 18200, remixClicks: 4100, returningUsers: 5460 },
      "90 days": { views: 40200, uniqueUsers: 25600, remixClicks: 5800, returningUsers: 7680 },
    },
    momentum: {
      "3 days": { currentViews: 1800, previousViews: 1760 },
      "7 days": { currentViews: 4200, previousViews: 4100 },
      "14 days": { currentViews: 7800, previousViews: 7600 },
      "30 days": { currentViews: 15200, previousViews: 14800 },
    },
  },
  {
    name: "Building Responsive Layouts",
    ageDays: 90,
    durationMinutes: 12,
    hasRemixProject: true,
    isCurrentlyTrending: true,
    daysInTrending: 3,
    metrics: {
      "7 days": { views: 3100, uniqueUsers: 2050, remixClicks: 480, returningUsers: 720 },
      "14 days": { views: 5800, uniqueUsers: 3750, remixClicks: 890, returningUsers: 1310 },
      "30 days": { views: 11200, uniqueUsers: 7200, remixClicks: 1720, returningUsers: 2520 },
      "60 days": { views: 18600, uniqueUsers: 11900, remixClicks: 2840, returningUsers: 4170 },
      "90 days": { views: 21400, uniqueUsers: 13700, remixClicks: 3260, returningUsers: 4800 },
    },
    momentum: {
      "3 days": { currentViews: 1400, previousViews: 1200 },
      "7 days": { currentViews: 3100, previousViews: 2700 },
      "14 days": { currentViews: 5800, previousViews: 5100 },
      "30 days": { currentViews: 11200, previousViews: 9800 },
    },
  },
  {
    name: "CMS Collections Deep Dive",
    ageDays: 60,
    durationMinutes: 22,
    hasRemixProject: true,
    isCurrentlyTrending: true,
    daysInTrending: 5,
    metrics: {
      "7 days": { views: 2400, uniqueUsers: 1600, remixClicks: 350, returningUsers: 640 },
      "14 days": { views: 4500, uniqueUsers: 2950, remixClicks: 650, returningUsers: 1180 },
      "30 days": { views: 8700, uniqueUsers: 5600, remixClicks: 1260, returningUsers: 2240 },
      "60 days": { views: 12100, uniqueUsers: 7800, remixClicks: 1750, returningUsers: 3120 },
      "90 days": { views: 12100, uniqueUsers: 7800, remixClicks: 1750, returningUsers: 3120 },
    },
    momentum: {
      "3 days": { currentViews: 1100, previousViews: 920 },
      "7 days": { currentViews: 2400, previousViews: 2000 },
      "14 days": { currentViews: 4500, previousViews: 3800 },
      "30 days": { currentViews: 8700, previousViews: 7400 },
    },
  },
  {
    name: "Scroll Animations Guide",
    ageDays: 30,
    durationMinutes: 15,
    hasRemixProject: true,
    isCurrentlyTrending: true,
    daysInTrending: 7,
    metrics: {
      "7 days": { views: 2800, uniqueUsers: 1900, remixClicks: 520, returningUsers: 680 },
      "14 days": { views: 5200, uniqueUsers: 3400, remixClicks: 960, returningUsers: 1220 },
      "30 days": { views: 8400, uniqueUsers: 5500, remixClicks: 1540, returningUsers: 1980 },
      "60 days": { views: 8400, uniqueUsers: 5500, remixClicks: 1540, returningUsers: 1980 },
      "90 days": { views: 8400, uniqueUsers: 5500, remixClicks: 1540, returningUsers: 1980 },
    },
    momentum: {
      "3 days": { currentViews: 1300, previousViews: 1000 },
      "7 days": { currentViews: 2800, previousViews: 2150 },
      "14 days": { currentViews: 5200, previousViews: 4000 },
      "30 days": { currentViews: 8400, previousViews: 0 },
    },
  },
  {
    name: "SEO Best Practices",
    ageDays: 150,
    durationMinutes: 10,
    hasRemixProject: false,
    isCurrentlyTrending: false,
    daysInTrending: 0,
    metrics: {
      "7 days": { views: 3500, uniqueUsers: 2300, remixClicks: 0, returningUsers: 690 },
      "14 days": { views: 6500, uniqueUsers: 4200, remixClicks: 0, returningUsers: 1260 },
      "30 days": { views: 12600, uniqueUsers: 8100, remixClicks: 0, returningUsers: 2430 },
      "60 days": { views: 23400, uniqueUsers: 15000, remixClicks: 0, returningUsers: 4500 },
      "90 days": { views: 33200, uniqueUsers: 21200, remixClicks: 0, returningUsers: 6360 },
    },
    momentum: {
      "3 days": { currentViews: 1500, previousViews: 1480 },
      "7 days": { currentViews: 3500, previousViews: 3450 },
      "14 days": { currentViews: 6500, previousViews: 6400 },
      "30 days": { currentViews: 12600, previousViews: 12400 },
    },
  },
  {
    name: "Custom Code Overrides",
    ageDays: 120,
    durationMinutes: 18,
    hasRemixProject: true,
    isCurrentlyTrending: false,
    daysInTrending: 0,
    metrics: {
      "7 days": { views: 1900, uniqueUsers: 1250, remixClicks: 280, returningUsers: 500 },
      "14 days": { views: 3500, uniqueUsers: 2300, remixClicks: 520, returningUsers: 920 },
      "30 days": { views: 6800, uniqueUsers: 4400, remixClicks: 1000, returningUsers: 1760 },
      "60 days": { views: 12600, uniqueUsers: 8100, remixClicks: 1850, returningUsers: 3240 },
      "90 days": { views: 17800, uniqueUsers: 11400, remixClicks: 2600, returningUsers: 4560 },
    },
    momentum: {
      "3 days": { currentViews: 820, previousViews: 810 },
      "7 days": { currentViews: 1900, previousViews: 1880 },
      "14 days": { currentViews: 3500, previousViews: 3450 },
      "30 days": { currentViews: 6800, previousViews: 6700 },
    },
  },
  {
    name: "Design Tokens Workflow",
    ageDays: 45,
    durationMinutes: 14,
    hasRemixProject: false,
    isCurrentlyTrending: true,
    daysInTrending: 2,
    metrics: {
      "7 days": { views: 2200, uniqueUsers: 1450, remixClicks: 0, returningUsers: 580 },
      "14 days": { views: 4100, uniqueUsers: 2680, remixClicks: 0, returningUsers: 1070 },
      "30 days": { views: 7900, uniqueUsers: 5100, remixClicks: 0, returningUsers: 2040 },
      "60 days": { views: 10400, uniqueUsers: 6700, remixClicks: 0, returningUsers: 2680 },
      "90 days": { views: 10400, uniqueUsers: 6700, remixClicks: 0, returningUsers: 2680 },
    },
    momentum: {
      "3 days": { currentViews: 1000, previousViews: 820 },
      "7 days": { currentViews: 2200, previousViews: 1800 },
      "14 days": { currentViews: 4100, previousViews: 3400 },
      "30 days": { currentViews: 7900, previousViews: 6600 },
    },
  },
  {
    name: "E-commerce Store Setup",
    ageDays: 75,
    durationMinutes: 25,
    hasRemixProject: true,
    isCurrentlyTrending: false,
    daysInTrending: 0,
    metrics: {
      "7 days": { views: 1600, uniqueUsers: 1050, remixClicks: 240, returningUsers: 420 },
      "14 days": { views: 3000, uniqueUsers: 1950, remixClicks: 450, returningUsers: 780 },
      "30 days": { views: 5800, uniqueUsers: 3750, remixClicks: 860, returningUsers: 1500 },
      "60 days": { views: 9600, uniqueUsers: 6200, remixClicks: 1420, returningUsers: 2480 },
      "90 days": { views: 11200, uniqueUsers: 7200, remixClicks: 1650, returningUsers: 2880 },
    },
    momentum: {
      "3 days": { currentViews: 680, previousViews: 670 },
      "7 days": { currentViews: 1600, previousViews: 1580 },
      "14 days": { currentViews: 3000, previousViews: 2950 },
      "30 days": { currentViews: 5800, previousViews: 5700 },
    },
  },
  {
    name: "Form Handling Patterns",
    ageDays: 100,
    durationMinutes: 11,
    hasRemixProject: true,
    isCurrentlyTrending: false,
    daysInTrending: 0,
    metrics: {
      "7 days": { views: 1400, uniqueUsers: 920, remixClicks: 180, returningUsers: 320 },
      "14 days": { views: 2600, uniqueUsers: 1700, remixClicks: 340, returningUsers: 590 },
      "30 days": { views: 5000, uniqueUsers: 3250, remixClicks: 650, returningUsers: 1140 },
      "60 days": { views: 9200, uniqueUsers: 5900, remixClicks: 1200, returningUsers: 2070 },
      "90 days": { views: 12800, uniqueUsers: 8200, remixClicks: 1660, returningUsers: 2870 },
    },
    momentum: {
      "3 days": { currentViews: 600, previousViews: 590 },
      "7 days": { currentViews: 1400, previousViews: 1380 },
      "14 days": { currentViews: 2600, previousViews: 2560 },
      "30 days": { currentViews: 5000, previousViews: 4920 },
    },
  },
  {
    name: "Page Transitions Masterclass",
    ageDays: 10,
    durationMinutes: 20,
    hasRemixProject: true,
    isCurrentlyTrending: false,
    daysInTrending: 0,
    metrics: {
      "7 days": { views: 1800, uniqueUsers: 1200, remixClicks: 380, returningUsers: 480 },
      "14 days": { views: 1800, uniqueUsers: 1200, remixClicks: 380, returningUsers: 480 },
      "30 days": { views: 1800, uniqueUsers: 1200, remixClicks: 380, returningUsers: 480 },
      "60 days": { views: 1800, uniqueUsers: 1200, remixClicks: 380, returningUsers: 480 },
      "90 days": { views: 1800, uniqueUsers: 1200, remixClicks: 380, returningUsers: 480 },
    },
    momentum: {
      "3 days": { currentViews: 950, previousViews: 550 },
      "7 days": { currentViews: 1800, previousViews: 0 },
      "14 days": { currentViews: 1800, previousViews: 0 },
      "30 days": { currentViews: 1800, previousViews: 0 },
    },
  },
  {
    name: "Localization with Framer",
    ageDays: 200,
    durationMinutes: 16,
    hasRemixProject: false,
    isCurrentlyTrending: false,
    daysInTrending: 0,
    metrics: {
      "7 days": { views: 1100, uniqueUsers: 720, remixClicks: 0, returningUsers: 250 },
      "14 days": { views: 2000, uniqueUsers: 1300, remixClicks: 0, returningUsers: 450 },
      "30 days": { views: 3900, uniqueUsers: 2500, remixClicks: 0, returningUsers: 870 },
      "60 days": { views: 7200, uniqueUsers: 4600, remixClicks: 0, returningUsers: 1610 },
      "90 days": { views: 10200, uniqueUsers: 6500, remixClicks: 0, returningUsers: 2280 },
    },
    momentum: {
      "3 days": { currentViews: 470, previousViews: 465 },
      "7 days": { currentViews: 1100, previousViews: 1090 },
      "14 days": { currentViews: 2000, previousViews: 1980 },
      "30 days": { currentViews: 3900, previousViews: 3850 },
    },
  },
  {
    name: "Breakpoints & Variants",
    ageDays: 5,
    durationMinutes: 9,
    hasRemixProject: true,
    isCurrentlyTrending: false,
    daysInTrending: 0,
    metrics: {
      "7 days": { views: 900, uniqueUsers: 600, remixClicks: 140, returningUsers: 180 },
      "14 days": { views: 900, uniqueUsers: 600, remixClicks: 140, returningUsers: 180 },
      "30 days": { views: 900, uniqueUsers: 600, remixClicks: 140, returningUsers: 180 },
      "60 days": { views: 900, uniqueUsers: 600, remixClicks: 140, returningUsers: 180 },
      "90 days": { views: 900, uniqueUsers: 600, remixClicks: 140, returningUsers: 180 },
    },
    momentum: {
      "3 days": { currentViews: 500, previousViews: 260 },
      "7 days": { currentViews: 900, previousViews: 0 },
      "14 days": { currentViews: 900, previousViews: 0 },
      "30 days": { currentViews: 900, previousViews: 0 },
    },
  },
];

const tutorialMetadata: Partial<
  Record<
    TutorialSeed["name"],
    {
      adminOverride?: AdminOverride;
      category?: string;
      creator?: string;
      daysSinceLastTrending?: number | null;
      explorationCandidate?: boolean;
    }
  >
> = {
  "Getting Started with Framer": { adminOverride: "great", creator: "Framer Team", category: "Foundations" },
  "Building Responsive Layouts": { creator: "Layout Lab", category: "Layouts" },
  "CMS Collections Deep Dive": { creator: "Content Works", category: "CMS", explorationCandidate: true },
  "Scroll Animations Guide": { creator: "Motion Forge", category: "Animation", explorationCandidate: true },
  "SEO Best Practices": { adminOverride: "bad", creator: "Growth Loop", category: "Marketing" },
  "Custom Code Overrides": { creator: "Code Craft", category: "Development" },
  "Design Tokens Workflow": { creator: "Design Systems Co", category: "Design System", explorationCandidate: true },
  "E-commerce Store Setup": { creator: "Commerce Labs", category: "Commerce", daysSinceLastTrending: 2 },
  "Form Handling Patterns": { creator: "Form School", category: "Forms" },
  "Page Transitions Masterclass": { creator: "Motion Forge", category: "Animation" },
  "Localization with Framer": { creator: "Global Kit", category: "Localization" },
  "Breakpoints & Variants": { creator: "Layout Lab", category: "Layouts" },
};

function safeDivide(numerator: number, denominator: number) {
  if (denominator <= 0) return 0;
  return numerator / denominator;
}

function clampGrowth(growth: number) {
  return Math.min(2, Math.max(growth, -0.95));
}

function getNumericSettingValue(
  settings: SidebarSettingsState,
  section: string,
  label: string,
) {
  return (settings[section][label] as NumericFieldState).value;
}

function getDropdownSettingValue(
  settings: SidebarSettingsState,
  section: string,
  label: string,
) {
  return (settings[section][label] as DropdownFieldState).value;
}

function blendScores(
  recentScore: number,
  lifetimeScore: number,
  settings: TutorialRankingSettings,
) {
  return (
    (settings.recencyWeight / 100) * recentScore +
    (settings.lifetimeWeight / 100) * lifetimeScore
  );
}

function getViewGrowth(momentumMetrics: TutorialMomentumMetrics) {
  return clampGrowth(
    safeDivide(
      momentumMetrics.currentViews - momentumMetrics.previousViews,
      Math.max(momentumMetrics.previousViews, 1),
    ),
  );
}

function getPreviousMomentumWindow(
  window: TutorialMomentumWindow,
): TutorialMomentumWindow | null {
  switch (window) {
    case "3 days":
      return "7 days";
    case "7 days":
      return "14 days";
    case "14 days":
      return "30 days";
    case "30 days":
      return null;
  }
}

function getMomentumScore(
  tutorial: TutorialSeed,
  settings: TutorialRankingSettings,
) {
  const currentGrowth = Math.max(
    0,
    getViewGrowth(tutorial.momentum[settings.momentumWindow]),
  );
  const previousWindow = getPreviousMomentumWindow(settings.momentumWindow);
  const previousGrowth =
    previousWindow === null
      ? currentGrowth
      : Math.max(0, getViewGrowth(tutorial.momentum[previousWindow]));
  const acceleration = Math.max(0, currentGrowth - previousGrowth);

  return (
    settings.momentumWeight * currentGrowth +
    settings.accelerationWeight * acceleration
  );
}

export function getTutorialRankingSettings(
  settings: SidebarSettingsState,
): TutorialRankingSettings {
  return {
    viewsWeight: getNumericSettingValue(settings, "Weight Metrics", "Views"),
    uniqueUsersWeight: getNumericSettingValue(settings, "Weight Metrics", "Unique Users"),
    remixClicksWeight: getNumericSettingValue(settings, "Weight Metrics", "Remix Clicks"),
    remixRateWeight: getNumericSettingValue(settings, "Rate Metrics", "Remix Rate"),
    returnViewRateWeight: getNumericSettingValue(settings, "Rate Metrics", "Return View Rate"),
    durationMultiplier: getNumericSettingValue(settings, "Tutorial Duration Adjustment", "Duration Multiplier"),
    lookbackWindow: getDropdownSettingValue(settings, "Time", "Lookback Window") as TutorialLookbackWindow,
    recencyWeight: getNumericSettingValue(settings, "Time", "Recency Weight"),
    lifetimeWeight: getNumericSettingValue(settings, "Time", "Lifetime Weight"),
    momentumWindow: getDropdownSettingValue(settings, "Momentum", "Window") as TutorialMomentumWindow,
    momentumWeight: getNumericSettingValue(settings, "Momentum", "Weight"),
    accelerationWeight: getNumericSettingValue(settings, "Momentum", "Acceleration"),
    minUniqueUsers: getNumericSettingValue(settings, "Minimum Statistics", "Min Unique Users"),
    minViews: getNumericSettingValue(settings, "Minimum Statistics", "Min Views"),
    durationDecay: getNumericSettingValue(settings, "Rotation", "Duration Decay"),
    maxDays: getNumericSettingValue(settings, "Rotation", "Max Days"),
    cooldown: getNumericSettingValue(settings, "Rotation", "Cooldown"),
    explorationPercent: getNumericSettingValue(settings, "Exploration", "Exploration %"),
    creatorCap: getNumericSettingValue(settings, "Diversity", "Creator Cap"),
    categoryCap: getNumericSettingValue(settings, "Diversity", "Category Cap"),
    boost: getNumericSettingValue(settings, "Overrides", "Boost"),
    decay: getNumericSettingValue(settings, "Overrides", "Decay"),
  };
}

export function scoreTutorials(settings: TutorialRankingSettings): RankedTutorial[] {
  const rankedTutorials = tutorialSeeds.map((tutorial) => {
    const metadata = tutorialMetadata[tutorial.name];
    const recentMetrics = tutorial.metrics[settings.lookbackWindow];
    const lifetimeMetrics = tutorial.metrics["90 days"];
    const durationMultiplier =
      tutorial.durationMinutes > LONG_TUTORIAL_THRESHOLD_MINUTES
        ? settings.durationMultiplier
        : 1;
    const adjustedViews = recentMetrics.views * durationMultiplier;
    const lifetimeAdjustedViews = lifetimeMetrics.views * durationMultiplier;
    const remixRate = safeDivide(recentMetrics.remixClicks, Math.max(recentMetrics.views, 1));
    const lifetimeRemixRate = safeDivide(
      lifetimeMetrics.remixClicks,
      Math.max(lifetimeMetrics.views, 1),
    );
    const returnViewRate = safeDivide(
      recentMetrics.returningUsers,
      Math.max(recentMetrics.uniqueUsers, 1),
    );
    const lifetimeReturnViewRate = safeDivide(
      lifetimeMetrics.returningUsers,
      Math.max(lifetimeMetrics.uniqueUsers, 1),
    );
    const momentumScore = getMomentumScore(tutorial, settings);
    const overrideMultiplier = getOverrideMultiplier(
      metadata?.adminOverride,
      settings.boost,
      settings.decay,
    );
    const rotation = getRotationState(
      tutorial.isCurrentlyTrending,
      tutorial.daysInTrending,
      metadata?.daysSinceLastTrending,
      settings.durationDecay,
      settings.maxDays,
      settings.cooldown,
    );
    const meetsMinimums =
      recentMetrics.uniqueUsers >= settings.minUniqueUsers &&
      recentMetrics.views >= settings.minViews;

    const viewsScore = blendScores(
      settings.viewsWeight * Math.log(adjustedViews + 1),
      settings.viewsWeight * Math.log(lifetimeAdjustedViews + 1),
      settings,
    );
    const uniqueUsersScore = blendScores(
      settings.uniqueUsersWeight * Math.log(recentMetrics.uniqueUsers + 1),
      settings.uniqueUsersWeight * Math.log(lifetimeMetrics.uniqueUsers + 1),
      settings,
    );
    const remixClicksScore = blendScores(
      settings.remixClicksWeight * Math.log(recentMetrics.remixClicks + 1),
      settings.remixClicksWeight * Math.log(lifetimeMetrics.remixClicks + 1),
      settings,
    );
    const remixRateScore = blendScores(
      settings.remixRateWeight * remixRate,
      settings.remixRateWeight * lifetimeRemixRate,
      settings,
    );
    const returnRateScore = blendScores(
      settings.returnViewRateWeight * returnViewRate,
      settings.returnViewRateWeight * lifetimeReturnViewRate,
      settings,
    );

    let runningTotal =
      viewsScore +
      uniqueUsersScore +
      remixClicksScore +
      remixRateScore +
      returnRateScore +
      momentumScore;

    runningTotal *= overrideMultiplier;

    const isEligible = meetsMinimums && rotation.eligible;
    const finalScore = isEligible ? runningTotal * rotation.value : 0;

    return {
      name: tutorial.name,
      ageDays: tutorial.ageDays,
      durationMinutes: tutorial.durationMinutes,
      hasRemixProject: tutorial.hasRemixProject,
      isCurrentlyTrending: tutorial.isCurrentlyTrending,
      daysInTrending: tutorial.daysInTrending,
      views: recentMetrics.views,
      uniqueUsers: recentMetrics.uniqueUsers,
      remixClicks: recentMetrics.remixClicks,
      returningUsers: recentMetrics.returningUsers,
      remixRate,
      returnViewRate,
      isEligible,
      finalScore,
    } satisfies RankedTutorial;
  });

  return applyExplorationOrdering(
    rankedTutorials,
    settings.explorationPercent,
    (tutorial) => tutorialMetadata[tutorial.name]?.explorationCandidate === true,
    {
      creatorCap: settings.creatorCap,
      categoryCap: settings.categoryCap,
      getCreator: (tutorial) => tutorialMetadata[tutorial.name]?.creator,
      getCategory: (tutorial) => tutorialMetadata[tutorial.name]?.category,
    },
  );
}
