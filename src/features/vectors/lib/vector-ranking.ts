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

export type VectorLookbackWindow =
  | "7 days"
  | "14 days"
  | "30 days"
  | "60 days"
  | "90 days";

export type VectorMomentumWindow = "3 days" | "7 days" | "14 days" | "30 days";

export type VectorPricingType = "free" | "paid";

type VectorPeriodMetrics = {
  distinctProjects: number;
  opens: number;
  projectInstalls: number;
  uniqueUsers: number;
};

type VectorMomentumMetrics = {
  currentInstalls: number;
  currentUniqueUsers: number;
  previousInstalls: number;
  previousUniqueUsers: number;
};

type VectorSeed = {
  ageDays: number;
  daysInTrending: number;
  isCurrentlyTrending: boolean;
  metrics: Record<VectorLookbackWindow, VectorPeriodMetrics>;
  momentum: Record<VectorMomentumWindow, VectorMomentumMetrics>;
  name: string;
  pricingLabel: string;
  pricingType: VectorPricingType;
};

export type VectorRankingSettings = {
  accelerationWeight: number;
  averageCopiesWeight: number;
  boost: number;
  categoryCap: number;
  cooldown: number;
  copyRateWeight: number;
  creatorCap: number;
  decay: number;
  durationDecay: number;
  explorationPercent: number;
  freshBoostDuration: number;
  freshVectorBoost: number;
  lifetimeWeight: number;
  lookbackWindow: VectorLookbackWindow;
  maxDays: number;
  minInstalls: number;
  minUniqueUsers: number;
  momentumWeight: number;
  momentumWindow: VectorMomentumWindow;
  opensWeight: number;
  paidInstallMultiplier: number;
  paidMinInstalls: number;
  paidMinUniqueUsers: number;
  paidViewsMultiplier: number;
  projectInstallsWeight: number;
  projectSpreadWeight: number;
  recencyWeight: number;
  uniqueUsersWeight: number;
};

export type RankedVector = {
  ageDays: number;
  averageCopiesPerUser: number;
  copyRate: number;
  daysInTrending: number;
  distinctProjects: number;
  finalScore: number;
  isCurrentlyTrending: boolean;
  isEligible: boolean;
  name: string;
  opens: number;
  pricingLabel: string;
  pricingType: VectorPricingType;
  projectInstalls: number;
  uniqueUsers: number;
};

const vectorSeeds: VectorSeed[] = [
  {
    name: "Geometric Shapes Pack",
    pricingType: "free",
    pricingLabel: "Free",
    ageDays: 150,
    isCurrentlyTrending: true,
    daysInTrending: 4,
    metrics: {
      "7 days": { opens: 3800, uniqueUsers: 1680, projectInstalls: 2900, distinctProjects: 2200 },
      "14 days": { opens: 7100, uniqueUsers: 2950, projectInstalls: 5400, distinctProjects: 4000 },
      "30 days": { opens: 13800, uniqueUsers: 5600, projectInstalls: 10500, distinctProjects: 7600 },
      "60 days": { opens: 25600, uniqueUsers: 10300, projectInstalls: 19400, distinctProjects: 14000 },
      "90 days": { opens: 36200, uniqueUsers: 14400, projectInstalls: 27200, distinctProjects: 19600 },
    },
    momentum: {
      "3 days": { currentInstalls: 1300, previousInstalls: 1120, currentUniqueUsers: 740, previousUniqueUsers: 640 },
      "7 days": { currentInstalls: 2900, previousInstalls: 2500, currentUniqueUsers: 1680, previousUniqueUsers: 1460 },
      "14 days": { currentInstalls: 5400, previousInstalls: 4700, currentUniqueUsers: 2950, previousUniqueUsers: 2650 },
      "30 days": { currentInstalls: 10500, previousInstalls: 9400, currentUniqueUsers: 5600, previousUniqueUsers: 5100 },
    },
  },
  {
    name: "Hand-Drawn Arrows",
    pricingType: "free",
    pricingLabel: "Free",
    ageDays: 220,
    isCurrentlyTrending: false,
    daysInTrending: 0,
    metrics: {
      "7 days": { opens: 4500, uniqueUsers: 1950, projectInstalls: 3400, distinctProjects: 2700 },
      "14 days": { opens: 8300, uniqueUsers: 3500, projectInstalls: 6300, distinctProjects: 4800 },
      "30 days": { opens: 16200, uniqueUsers: 6700, projectInstalls: 12200, distinctProjects: 9100 },
      "60 days": { opens: 30000, uniqueUsers: 12400, projectInstalls: 22600, distinctProjects: 16800 },
      "90 days": { opens: 42500, uniqueUsers: 17400, projectInstalls: 32000, distinctProjects: 23600 },
    },
    momentum: {
      "3 days": { currentInstalls: 1450, previousInstalls: 1430, currentUniqueUsers: 840, previousUniqueUsers: 830 },
      "7 days": { currentInstalls: 3400, previousInstalls: 3350, currentUniqueUsers: 1950, previousUniqueUsers: 1930 },
      "14 days": { currentInstalls: 6300, previousInstalls: 6200, currentUniqueUsers: 3500, previousUniqueUsers: 3450 },
      "30 days": { currentInstalls: 12200, previousInstalls: 12000, currentUniqueUsers: 6700, previousUniqueUsers: 6600 },
    },
  },
  {
    name: "Gradient Blobs",
    pricingType: "paid",
    pricingLabel: "$15",
    ageDays: 60,
    isCurrentlyTrending: true,
    daysInTrending: 2,
    metrics: {
      "7 days": { opens: 2400, uniqueUsers: 1080, projectInstalls: 1800, distinctProjects: 1350 },
      "14 days": { opens: 4500, uniqueUsers: 1980, projectInstalls: 3350, distinctProjects: 2500 },
      "30 days": { opens: 8700, uniqueUsers: 3700, projectInstalls: 6500, distinctProjects: 4700 },
      "60 days": { opens: 12200, uniqueUsers: 5100, projectInstalls: 9100, distinctProjects: 6600 },
      "90 days": { opens: 12200, uniqueUsers: 5100, projectInstalls: 9100, distinctProjects: 6600 },
    },
    momentum: {
      "3 days": { currentInstalls: 900, previousInstalls: 700, currentUniqueUsers: 500, previousUniqueUsers: 390 },
      "7 days": { currentInstalls: 1800, previousInstalls: 1400, currentUniqueUsers: 1080, previousUniqueUsers: 840 },
      "14 days": { currentInstalls: 3350, previousInstalls: 2800, currentUniqueUsers: 1980, previousUniqueUsers: 1660 },
      "30 days": { currentInstalls: 6500, previousInstalls: 5500, currentUniqueUsers: 3700, previousUniqueUsers: 3150 },
    },
  },
  {
    name: "Minimal Icons",
    pricingType: "free",
    pricingLabel: "Free",
    ageDays: 280,
    isCurrentlyTrending: false,
    daysInTrending: 0,
    metrics: {
      "7 days": { opens: 5600, uniqueUsers: 2400, projectInstalls: 4200, distinctProjects: 3300 },
      "14 days": { opens: 10400, uniqueUsers: 4400, projectInstalls: 7800, distinctProjects: 6000 },
      "30 days": { opens: 20200, uniqueUsers: 8400, projectInstalls: 15200, distinctProjects: 11200 },
      "60 days": { opens: 37400, uniqueUsers: 15500, projectInstalls: 28200, distinctProjects: 20800 },
      "90 days": { opens: 53000, uniqueUsers: 21800, projectInstalls: 39800, distinctProjects: 29400 },
    },
    momentum: {
      "3 days": { currentInstalls: 1800, previousInstalls: 1780, currentUniqueUsers: 1030, previousUniqueUsers: 1020 },
      "7 days": { currentInstalls: 4200, previousInstalls: 4150, currentUniqueUsers: 2400, previousUniqueUsers: 2380 },
      "14 days": { currentInstalls: 7800, previousInstalls: 7700, currentUniqueUsers: 4400, previousUniqueUsers: 4350 },
      "30 days": { currentInstalls: 15200, previousInstalls: 15000, currentUniqueUsers: 8400, previousUniqueUsers: 8300 },
    },
  },
  {
    name: "3D Isometric Set",
    pricingType: "paid",
    pricingLabel: "$29",
    ageDays: 40,
    isCurrentlyTrending: true,
    daysInTrending: 5,
    metrics: {
      "7 days": { opens: 1900, uniqueUsers: 850, projectInstalls: 1400, distinctProjects: 1050 },
      "14 days": { opens: 3500, uniqueUsers: 1550, projectInstalls: 2600, distinctProjects: 1950 },
      "30 days": { opens: 6800, uniqueUsers: 2900, projectInstalls: 5000, distinctProjects: 3700 },
      "60 days": { opens: 8800, uniqueUsers: 3700, projectInstalls: 6500, distinctProjects: 4800 },
      "90 days": { opens: 8800, uniqueUsers: 3700, projectInstalls: 6500, distinctProjects: 4800 },
    },
    momentum: {
      "3 days": { currentInstalls: 700, previousInstalls: 540, currentUniqueUsers: 400, previousUniqueUsers: 310 },
      "7 days": { currentInstalls: 1400, previousInstalls: 1080, currentUniqueUsers: 850, previousUniqueUsers: 660 },
      "14 days": { currentInstalls: 2600, previousInstalls: 2100, currentUniqueUsers: 1550, previousUniqueUsers: 1260 },
      "30 days": { currentInstalls: 5000, previousInstalls: 4200, currentUniqueUsers: 2900, previousUniqueUsers: 2450 },
    },
  },
  {
    name: "Abstract Patterns",
    pricingType: "free",
    pricingLabel: "Free",
    ageDays: 130,
    isCurrentlyTrending: false,
    daysInTrending: 0,
    metrics: {
      "7 days": { opens: 2800, uniqueUsers: 1240, projectInstalls: 2100, distinctProjects: 1600 },
      "14 days": { opens: 5200, uniqueUsers: 2280, projectInstalls: 3900, distinctProjects: 2900 },
      "30 days": { opens: 10100, uniqueUsers: 4300, projectInstalls: 7500, distinctProjects: 5500 },
      "60 days": { opens: 18700, uniqueUsers: 7900, projectInstalls: 13900, distinctProjects: 10200 },
      "90 days": { opens: 26400, uniqueUsers: 11100, projectInstalls: 19600, distinctProjects: 14400 },
    },
    momentum: {
      "3 days": { currentInstalls: 900, previousInstalls: 890, currentUniqueUsers: 530, previousUniqueUsers: 525 },
      "7 days": { currentInstalls: 2100, previousInstalls: 2070, currentUniqueUsers: 1240, previousUniqueUsers: 1225 },
      "14 days": { currentInstalls: 3900, previousInstalls: 3850, currentUniqueUsers: 2280, previousUniqueUsers: 2250 },
      "30 days": { currentInstalls: 7500, previousInstalls: 7400, currentUniqueUsers: 4300, previousUniqueUsers: 4250 },
    },
  },
  {
    name: "Social Media Icons",
    pricingType: "free",
    pricingLabel: "Free",
    ageDays: 190,
    isCurrentlyTrending: false,
    daysInTrending: 0,
    metrics: {
      "7 days": { opens: 3200, uniqueUsers: 1400, projectInstalls: 2400, distinctProjects: 1900 },
      "14 days": { opens: 5900, uniqueUsers: 2560, projectInstalls: 4400, distinctProjects: 3400 },
      "30 days": { opens: 11500, uniqueUsers: 4800, projectInstalls: 8600, distinctProjects: 6400 },
      "60 days": { opens: 21300, uniqueUsers: 8900, projectInstalls: 15900, distinctProjects: 11800 },
      "90 days": { opens: 30100, uniqueUsers: 12500, projectInstalls: 22400, distinctProjects: 16600 },
    },
    momentum: {
      "3 days": { currentInstalls: 1020, previousInstalls: 1010, currentUniqueUsers: 600, previousUniqueUsers: 595 },
      "7 days": { currentInstalls: 2400, previousInstalls: 2370, currentUniqueUsers: 1400, previousUniqueUsers: 1385 },
      "14 days": { currentInstalls: 4400, previousInstalls: 4350, currentUniqueUsers: 2560, previousUniqueUsers: 2530 },
      "30 days": { currentInstalls: 8600, previousInstalls: 8500, currentUniqueUsers: 4800, previousUniqueUsers: 4750 },
    },
  },
  {
    name: "Neon Line Art",
    pricingType: "paid",
    pricingLabel: "$19",
    ageDays: 10,
    isCurrentlyTrending: false,
    daysInTrending: 0,
    metrics: {
      "7 days": { opens: 1100, uniqueUsers: 490, projectInstalls: 780, distinctProjects: 590 },
      "14 days": { opens: 1100, uniqueUsers: 490, projectInstalls: 780, distinctProjects: 590 },
      "30 days": { opens: 1100, uniqueUsers: 490, projectInstalls: 780, distinctProjects: 590 },
      "60 days": { opens: 1100, uniqueUsers: 490, projectInstalls: 780, distinctProjects: 590 },
      "90 days": { opens: 1100, uniqueUsers: 490, projectInstalls: 780, distinctProjects: 590 },
    },
    momentum: {
      "3 days": { currentInstalls: 420, previousInstalls: 240, currentUniqueUsers: 250, previousUniqueUsers: 140 },
      "7 days": { currentInstalls: 780, previousInstalls: 0, currentUniqueUsers: 490, previousUniqueUsers: 0 },
      "14 days": { currentInstalls: 780, previousInstalls: 0, currentUniqueUsers: 490, previousUniqueUsers: 0 },
      "30 days": { currentInstalls: 780, previousInstalls: 0, currentUniqueUsers: 490, previousUniqueUsers: 0 },
    },
  },
  {
    name: "Flat Illustration Kit",
    pricingType: "free",
    pricingLabel: "Free",
    ageDays: 100,
    isCurrentlyTrending: false,
    daysInTrending: 0,
    metrics: {
      "7 days": { opens: 2000, uniqueUsers: 890, projectInstalls: 1500, distinctProjects: 1140 },
      "14 days": { opens: 3700, uniqueUsers: 1620, projectInstalls: 2800, distinctProjects: 2080 },
      "30 days": { opens: 7200, uniqueUsers: 3050, projectInstalls: 5400, distinctProjects: 3950 },
      "60 days": { opens: 13300, uniqueUsers: 5600, projectInstalls: 10000, distinctProjects: 7300 },
      "90 days": { opens: 18800, uniqueUsers: 7900, projectInstalls: 14100, distinctProjects: 10300 },
    },
    momentum: {
      "3 days": { currentInstalls: 640, previousInstalls: 630, currentUniqueUsers: 380, previousUniqueUsers: 375 },
      "7 days": { currentInstalls: 1500, previousInstalls: 1480, currentUniqueUsers: 890, previousUniqueUsers: 880 },
      "14 days": { currentInstalls: 2800, previousInstalls: 2760, currentUniqueUsers: 1620, previousUniqueUsers: 1600 },
      "30 days": { currentInstalls: 5400, previousInstalls: 5320, currentUniqueUsers: 3050, previousUniqueUsers: 3010 },
    },
  },
  {
    name: "Emoji Stickers",
    pricingType: "paid",
    pricingLabel: "$12",
    ageDays: 75,
    isCurrentlyTrending: true,
    daysInTrending: 3,
    metrics: {
      "7 days": { opens: 1700, uniqueUsers: 760, projectInstalls: 1250, distinctProjects: 940 },
      "14 days": { opens: 3100, uniqueUsers: 1380, projectInstalls: 2300, distinctProjects: 1720 },
      "30 days": { opens: 6100, uniqueUsers: 2600, projectInstalls: 4500, distinctProjects: 3300 },
      "60 days": { opens: 10100, uniqueUsers: 4300, projectInstalls: 7500, distinctProjects: 5500 },
      "90 days": { opens: 11500, uniqueUsers: 4800, projectInstalls: 8500, distinctProjects: 6300 },
    },
    momentum: {
      "3 days": { currentInstalls: 630, previousInstalls: 490, currentUniqueUsers: 350, previousUniqueUsers: 270 },
      "7 days": { currentInstalls: 1250, previousInstalls: 970, currentUniqueUsers: 760, previousUniqueUsers: 590 },
      "14 days": { currentInstalls: 2300, previousInstalls: 1920, currentUniqueUsers: 1380, previousUniqueUsers: 1150 },
      "30 days": { currentInstalls: 4500, previousInstalls: 3850, currentUniqueUsers: 2600, previousUniqueUsers: 2230 },
    },
  },
  {
    name: "Divider Lines",
    pricingType: "free",
    pricingLabel: "Free",
    ageDays: 170,
    isCurrentlyTrending: false,
    daysInTrending: 0,
    metrics: {
      "7 days": { opens: 1600, uniqueUsers: 710, projectInstalls: 1200, distinctProjects: 910 },
      "14 days": { opens: 3000, uniqueUsers: 1300, projectInstalls: 2200, distinctProjects: 1660 },
      "30 days": { opens: 5800, uniqueUsers: 2450, projectInstalls: 4300, distinctProjects: 3150 },
      "60 days": { opens: 10700, uniqueUsers: 4500, projectInstalls: 7900, distinctProjects: 5800 },
      "90 days": { opens: 15100, uniqueUsers: 6300, projectInstalls: 11200, distinctProjects: 8200 },
    },
    momentum: {
      "3 days": { currentInstalls: 510, previousInstalls: 505, currentUniqueUsers: 300, previousUniqueUsers: 298 },
      "7 days": { currentInstalls: 1200, previousInstalls: 1185, currentUniqueUsers: 710, previousUniqueUsers: 702 },
      "14 days": { currentInstalls: 2200, previousInstalls: 2170, currentUniqueUsers: 1300, previousUniqueUsers: 1285 },
      "30 days": { currentInstalls: 4300, previousInstalls: 4240, currentUniqueUsers: 2450, previousUniqueUsers: 2420 },
    },
  },
  {
    name: "Tech Logo Bundle",
    pricingType: "paid",
    pricingLabel: "$22",
    ageDays: 6,
    isCurrentlyTrending: false,
    daysInTrending: 0,
    metrics: {
      "7 days": { opens: 800, uniqueUsers: 360, projectInstalls: 540, distinctProjects: 410 },
      "14 days": { opens: 800, uniqueUsers: 360, projectInstalls: 540, distinctProjects: 410 },
      "30 days": { opens: 800, uniqueUsers: 360, projectInstalls: 540, distinctProjects: 410 },
      "60 days": { opens: 800, uniqueUsers: 360, projectInstalls: 540, distinctProjects: 410 },
      "90 days": { opens: 800, uniqueUsers: 360, projectInstalls: 540, distinctProjects: 410 },
    },
    momentum: {
      "3 days": { currentInstalls: 300, previousInstalls: 150, currentUniqueUsers: 190, previousUniqueUsers: 100 },
      "7 days": { currentInstalls: 540, previousInstalls: 0, currentUniqueUsers: 360, previousUniqueUsers: 0 },
      "14 days": { currentInstalls: 540, previousInstalls: 0, currentUniqueUsers: 360, previousUniqueUsers: 0 },
      "30 days": { currentInstalls: 540, previousInstalls: 0, currentUniqueUsers: 360, previousUniqueUsers: 0 },
    },
  },
];

const vectorMetadata: Partial<
  Record<
    VectorSeed["name"],
    {
      adminOverride?: AdminOverride;
      category?: string;
      creator?: string;
      daysSinceLastTrending?: number | null;
      explorationCandidate?: boolean;
    }
  >
> = {
  "Geometric Shapes Pack": { adminOverride: "great", creator: "Shape House", category: "Shapes" },
  "Hand-Drawn Arrows": { creator: "Sketch Supply", category: "UI", explorationCandidate: true },
  "Gradient Blobs": { creator: "Shape House", category: "Backgrounds" },
  "Minimal Icons": { creator: "Icon Union", category: "Icons" },
  "3D Isometric Set": { creator: "Render Studio", category: "3D" },
  "Abstract Patterns": { creator: "Shape House", category: "Backgrounds", daysSinceLastTrending: 2 },
  "Social Media Icons": { creator: "Icon Union", category: "Icons" },
  "Neon Line Art": { creator: "Render Studio", category: "Illustration" },
  "Flat Illustration Kit": { creator: "Render Studio", category: "Illustration" },
  "Emoji Stickers": { creator: "Fun Pack", category: "Stickers", explorationCandidate: true },
  "Divider Lines": { creator: "Sketch Supply", category: "UI" },
  "Tech Logo Bundle": { creator: "Brand Foundry", category: "Logos" },
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
  settings: VectorRankingSettings,
) {
  return (
    (settings.recencyWeight / 100) * recentScore +
    (settings.lifetimeWeight / 100) * lifetimeScore
  );
}

function getBaseGrowth(
  momentumMetrics: VectorMomentumMetrics,
  installMultiplier: number,
) {
  const prevInstallsAdj = momentumMetrics.previousInstalls * installMultiplier;
  const currInstallsAdj = momentumMetrics.currentInstalls * installMultiplier;
  const userGrowth = safeDivide(
    momentumMetrics.currentUniqueUsers - momentumMetrics.previousUniqueUsers,
    Math.max(momentumMetrics.previousUniqueUsers, 1),
  );
  const installGrowth = safeDivide(
    currInstallsAdj - prevInstallsAdj,
    Math.max(prevInstallsAdj, 1),
  );

  return 0.4 * clampGrowth(userGrowth) + 0.6 * clampGrowth(installGrowth);
}

function getPreviousMomentumWindow(
  window: VectorMomentumWindow,
): VectorMomentumWindow | null {
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
  vector: VectorSeed,
  settings: VectorRankingSettings,
  installMultiplier: number,
) {
  const currentGrowth = Math.max(
    0,
    getBaseGrowth(vector.momentum[settings.momentumWindow], installMultiplier),
  );
  const previousWindow = getPreviousMomentumWindow(settings.momentumWindow);
  const previousGrowth =
    previousWindow === null
      ? currentGrowth
      : Math.max(0, getBaseGrowth(vector.momentum[previousWindow], installMultiplier));
  const acceleration = Math.max(0, currentGrowth - previousGrowth);

  return (
    settings.momentumWeight * currentGrowth +
    settings.accelerationWeight * acceleration
  );
}

export function getVectorRankingSettings(
  settings: SidebarSettingsState,
): VectorRankingSettings {
  return {
    opensWeight: getNumericSettingValue(settings, "Weight Metrics", "Opens"),
    uniqueUsersWeight: getNumericSettingValue(settings, "Weight Metrics", "Unique Users"),
    projectInstallsWeight: getNumericSettingValue(settings, "Weight Metrics", "Project Installs"),
    projectSpreadWeight: getNumericSettingValue(settings, "Weight Metrics", "Project Spread"),
    copyRateWeight: getNumericSettingValue(settings, "Rate Metrics", "Copy Rate"),
    averageCopiesWeight: getNumericSettingValue(settings, "Rate Metrics", "Average Copies per User"),
    paidViewsMultiplier: getNumericSettingValue(settings, "Paid Normalization", "Paid Views Multiplier"),
    paidInstallMultiplier: getNumericSettingValue(settings, "Paid Normalization", "Paid Install Multiplier"),
    lookbackWindow: getDropdownSettingValue(settings, "Time", "Lookback Window") as VectorLookbackWindow,
    recencyWeight: getNumericSettingValue(settings, "Time", "Recency Weight"),
    lifetimeWeight: getNumericSettingValue(settings, "Time", "Lifetime Weight"),
    freshVectorBoost: getNumericSettingValue(settings, "Time", "Fresh Vector Boost"),
    freshBoostDuration: getNumericSettingValue(settings, "Time", "Fresh Boost Duration"),
    momentumWindow: getDropdownSettingValue(settings, "Momentum", "Window") as VectorMomentumWindow,
    momentumWeight: getNumericSettingValue(settings, "Momentum", "Weight"),
    accelerationWeight: getNumericSettingValue(settings, "Momentum", "Acceleration"),
    minUniqueUsers: getNumericSettingValue(settings, "Minimum Statistics", "Min Unique Users"),
    minInstalls: getNumericSettingValue(settings, "Minimum Statistics", "Min Installs"),
    paidMinUniqueUsers: getNumericSettingValue(settings, "Minimum Statistics", "Paid Min Unique Users"),
    paidMinInstalls: getNumericSettingValue(settings, "Minimum Statistics", "Paid Min Installs"),
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

export function scoreVectors(settings: VectorRankingSettings): RankedVector[] {
  const rankedVectors = vectorSeeds.map((vector) => {
    const metadata = vectorMetadata[vector.name];
    const recentMetrics = vector.metrics[settings.lookbackWindow];
    const lifetimeMetrics = vector.metrics["90 days"];
    const isPaid = vector.pricingType === "paid";
    const viewsMultiplier = isPaid ? settings.paidViewsMultiplier : 1;
    const installMultiplier = isPaid ? settings.paidInstallMultiplier : 1;
    const opensAdjusted = recentMetrics.opens * viewsMultiplier;
    const lifetimeOpensAdjusted = lifetimeMetrics.opens * viewsMultiplier;
    const installsAdjusted = recentMetrics.projectInstalls * installMultiplier;
    const lifetimeInstallsAdjusted = lifetimeMetrics.projectInstalls * installMultiplier;
    const averageCopiesPerUser = safeDivide(
      installsAdjusted,
      Math.max(isPaid ? recentMetrics.uniqueUsers * viewsMultiplier : recentMetrics.uniqueUsers, 1),
    );
    const lifetimeAverageCopies = safeDivide(
      lifetimeInstallsAdjusted,
      Math.max(
        isPaid ? lifetimeMetrics.uniqueUsers * viewsMultiplier : lifetimeMetrics.uniqueUsers,
        1,
      ),
    );
    const copyRate = safeDivide(installsAdjusted, Math.max(opensAdjusted, 1));
    const lifetimeCopyRate = safeDivide(
      lifetimeInstallsAdjusted,
      Math.max(lifetimeOpensAdjusted, 1),
    );
    const freshDecay = Math.max(
      0,
      1 - vector.ageDays / Math.max(settings.freshBoostDuration, 1),
    );
    const freshScore = settings.freshVectorBoost * freshDecay;
    const momentumScore = getMomentumScore(vector, settings, installMultiplier);
    const overrideMultiplier = getOverrideMultiplier(
      metadata?.adminOverride,
      settings.boost,
      settings.decay,
    );
    const rotation = getRotationState(
      vector.isCurrentlyTrending,
      vector.daysInTrending,
      metadata?.daysSinceLastTrending,
      settings.durationDecay,
      settings.maxDays,
      settings.cooldown,
    );
    const minUsers = isPaid ? settings.paidMinUniqueUsers : settings.minUniqueUsers;
    const minInstalls = isPaid ? settings.paidMinInstalls : settings.minInstalls;
    const meetsMinimums =
      recentMetrics.uniqueUsers >= minUsers &&
      recentMetrics.projectInstalls >= minInstalls;

    const opensScore = blendScores(
      settings.opensWeight * Math.log(opensAdjusted + 1),
      settings.opensWeight * Math.log(lifetimeOpensAdjusted + 1),
      settings,
    );
    const uniqueUsersScore = blendScores(
      settings.uniqueUsersWeight * Math.log(recentMetrics.uniqueUsers + 1),
      settings.uniqueUsersWeight * Math.log(lifetimeMetrics.uniqueUsers + 1),
      settings,
    );
    const installsScore = blendScores(
      settings.projectInstallsWeight * Math.log(installsAdjusted + 1),
      settings.projectInstallsWeight * Math.log(lifetimeInstallsAdjusted + 1),
      settings,
    );
    const spreadScore = blendScores(
      settings.projectSpreadWeight * Math.log(recentMetrics.distinctProjects + 1),
      settings.projectSpreadWeight * Math.log(lifetimeMetrics.distinctProjects + 1),
      settings,
    );
    const copyRateScore = blendScores(
      settings.copyRateWeight * copyRate,
      settings.copyRateWeight * lifetimeCopyRate,
      settings,
    );
    const averageCopiesScore = blendScores(
      settings.averageCopiesWeight * averageCopiesPerUser,
      settings.averageCopiesWeight * lifetimeAverageCopies,
      settings,
    );

    let runningTotal =
      opensScore +
      uniqueUsersScore +
      installsScore +
      spreadScore +
      copyRateScore +
      averageCopiesScore +
      freshScore +
      momentumScore;

    runningTotal *= overrideMultiplier;

    const isEligible = meetsMinimums && rotation.eligible;
    const finalScore = isEligible ? runningTotal * rotation.value : 0;

    return {
      name: vector.name,
      pricingType: vector.pricingType,
      pricingLabel: vector.pricingLabel,
      ageDays: vector.ageDays,
      isCurrentlyTrending: vector.isCurrentlyTrending,
      daysInTrending: vector.daysInTrending,
      opens: recentMetrics.opens,
      uniqueUsers: recentMetrics.uniqueUsers,
      projectInstalls: recentMetrics.projectInstalls,
      distinctProjects: recentMetrics.distinctProjects,
      copyRate,
      averageCopiesPerUser,
      isEligible,
      finalScore,
    } satisfies RankedVector;
  });

  return applyExplorationOrdering(
    rankedVectors,
    settings.explorationPercent,
    (vector) => vectorMetadata[vector.name]?.explorationCandidate === true,
    {
      creatorCap: settings.creatorCap,
      categoryCap: settings.categoryCap,
      getCreator: (vector) => vectorMetadata[vector.name]?.creator,
      getCategory: (vector) => vectorMetadata[vector.name]?.category,
    },
  );
}
