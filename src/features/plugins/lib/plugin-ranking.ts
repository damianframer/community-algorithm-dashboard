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

export type PluginLookbackWindow =
  | "7 days"
  | "14 days"
  | "30 days"
  | "60 days"
  | "90 days";

export type PluginMomentumWindow = "3 days" | "7 days" | "14 days" | "30 days";

export type PluginPricingType = "free" | "paid";

type PluginPeriodMetrics = {
  oneAndDoneUsers: number;
  opens: number;
  pageViews: number;
  repeatUsers: number;
  uniqueUsers: number;
};

type PluginMomentumMetrics = {
  currentWAU: number;
  previousWAU: number;
};

type PluginSeed = {
  daysInTrending: number;
  daysSinceLastUpdate: number;
  isCurrentlyTrending: boolean;
  metrics: Record<PluginLookbackWindow, PluginPeriodMetrics>;
  momentum: Record<PluginMomentumWindow, PluginMomentumMetrics>;
  name: string;
  pricingLabel: string;
  pricingType: PluginPricingType;
  weeklyActiveUsers: number;
};

export type PluginRankingSettings = {
  accelerationWeight: number;
  averageOpensPerUserWeight: number;
  boost: number;
  bounceRateProxyWeight: number;
  categoryCap: number;
  cooldown: number;
  creatorCap: number;
  decay: number;
  durationDecay: number;
  explorationPercent: number;
  lifetimeWeight: number;
  lookbackWindow: PluginLookbackWindow;
  maxDays: number;
  maxUpdateAge: number;
  minUniqueUsers: number;
  minWeeklyActiveUsers: number;
  momentumWeight: number;
  momentumWindow: PluginMomentumWindow;
  openRateWeight: number;
  paidOpenMultiplier: number;
  paidWAUMultiplier: number;
  pluginOpensWeight: number;
  recencyWeight: number;
  repeatOpenRateWeight: number;
  uniqueUsersWeight: number;
  updateFreshnessWeight: number;
  weeklyActiveUsersWeight: number;
};

export type RankedPlugin = {
  averageOpensPerUser: number;
  bounceRate: number;
  daysSinceLastUpdate: number;
  finalScore: number;
  isEligible: boolean;
  name: string;
  openRate: number;
  opens: number;
  pageViews: number;
  pricingLabel: string;
  pricingType: PluginPricingType;
  repeatOpenRate: number;
  uniqueUsers: number;
  weeklyActiveUsers: number;
};

const pluginSeeds: PluginSeed[] = [
  {
    name: "Forms Pro",
    pricingType: "paid",
    pricingLabel: "$29",
    weeklyActiveUsers: 2030,
    daysSinceLastUpdate: 6,
    isCurrentlyTrending: true,
    daysInTrending: 4,
    metrics: {
      "7 days": { pageViews: 6420, opens: 4410, uniqueUsers: 2350, repeatUsers: 1210, oneAndDoneUsers: 780 },
      "14 days": { pageViews: 11840, opens: 8050, uniqueUsers: 3940, repeatUsers: 2170, oneAndDoneUsers: 1200 },
      "30 days": { pageViews: 24100, opens: 16020, uniqueUsers: 7210, repeatUsers: 4060, oneAndDoneUsers: 1980 },
      "60 days": { pageViews: 44800, opens: 29700, uniqueUsers: 13200, repeatUsers: 7500, oneAndDoneUsers: 3500 },
      "90 days": { pageViews: 63500, opens: 42100, uniqueUsers: 18700, repeatUsers: 10600, oneAndDoneUsers: 4900 },
    },
    momentum: {
      "3 days": { currentWAU: 2030, previousWAU: 1870 },
      "7 days": { currentWAU: 2030, previousWAU: 1765 },
      "14 days": { currentWAU: 2030, previousWAU: 1680 },
      "30 days": { currentWAU: 2030, previousWAU: 1550 },
    },
  },
  {
    name: "Motion Toolkit",
    pricingType: "paid",
    pricingLabel: "$39",
    weeklyActiveUsers: 1780,
    daysSinceLastUpdate: 11,
    isCurrentlyTrending: true,
    daysInTrending: 6,
    metrics: {
      "7 days": { pageViews: 5890, opens: 3820, uniqueUsers: 2010, repeatUsers: 970, oneAndDoneUsers: 720 },
      "14 days": { pageViews: 10840, opens: 7040, uniqueUsers: 3470, repeatUsers: 1830, oneAndDoneUsers: 1110 },
      "30 days": { pageViews: 22650, opens: 14110, uniqueUsers: 6400, repeatUsers: 3460, oneAndDoneUsers: 1920 },
      "60 days": { pageViews: 42100, opens: 26200, uniqueUsers: 11800, repeatUsers: 6400, oneAndDoneUsers: 3400 },
      "90 days": { pageViews: 59600, opens: 37100, uniqueUsers: 16700, repeatUsers: 9100, oneAndDoneUsers: 4700 },
    },
    momentum: {
      "3 days": { currentWAU: 1780, previousWAU: 1620 },
      "7 days": { currentWAU: 1780, previousWAU: 1505 },
      "14 days": { currentWAU: 1780, previousWAU: 1430 },
      "30 days": { currentWAU: 1780, previousWAU: 1320 },
    },
  },
  {
    name: "SEO Helper",
    pricingType: "free",
    pricingLabel: "Free",
    weeklyActiveUsers: 1665,
    daysSinceLastUpdate: 23,
    isCurrentlyTrending: false,
    daysInTrending: 0,
    metrics: {
      "7 days": { pageViews: 7150, opens: 3360, uniqueUsers: 2140, repeatUsers: 720, oneAndDoneUsers: 1130 },
      "14 days": { pageViews: 13220, opens: 6410, uniqueUsers: 3980, repeatUsers: 1490, oneAndDoneUsers: 2080 },
      "30 days": { pageViews: 28240, opens: 13260, uniqueUsers: 8120, repeatUsers: 3070, oneAndDoneUsers: 4320 },
      "60 days": { pageViews: 52400, opens: 24600, uniqueUsers: 15000, repeatUsers: 5700, oneAndDoneUsers: 7900 },
      "90 days": { pageViews: 74200, opens: 34800, uniqueUsers: 21200, repeatUsers: 8100, oneAndDoneUsers: 11100 },
    },
    momentum: {
      "3 days": { currentWAU: 1665, previousWAU: 1690 },
      "7 days": { currentWAU: 1665, previousWAU: 1720 },
      "14 days": { currentWAU: 1665, previousWAU: 1710 },
      "30 days": { currentWAU: 1665, previousWAU: 1700 },
    },
  },
  {
    name: "CMS Bridge",
    pricingType: "free",
    pricingLabel: "Free",
    weeklyActiveUsers: 1495,
    daysSinceLastUpdate: 8,
    isCurrentlyTrending: true,
    daysInTrending: 2,
    metrics: {
      "7 days": { pageViews: 4720, opens: 3090, uniqueUsers: 1680, repeatUsers: 840, oneAndDoneUsers: 510 },
      "14 days": { pageViews: 8840, opens: 5860, uniqueUsers: 2940, repeatUsers: 1580, oneAndDoneUsers: 910 },
      "30 days": { pageViews: 18930, opens: 12020, uniqueUsers: 5450, repeatUsers: 3020, oneAndDoneUsers: 1720 },
      "60 days": { pageViews: 35100, opens: 22300, uniqueUsers: 10100, repeatUsers: 5600, oneAndDoneUsers: 3100 },
      "90 days": { pageViews: 49700, opens: 31600, uniqueUsers: 14300, repeatUsers: 7900, oneAndDoneUsers: 4300 },
    },
    momentum: {
      "3 days": { currentWAU: 1495, previousWAU: 1340 },
      "7 days": { currentWAU: 1495, previousWAU: 1260 },
      "14 days": { currentWAU: 1495, previousWAU: 1200 },
      "30 days": { currentWAU: 1495, previousWAU: 1100 },
    },
  },
  {
    name: "Copy Assist",
    pricingType: "paid",
    pricingLabel: "$19",
    weeklyActiveUsers: 1310,
    daysSinceLastUpdate: 3,
    isCurrentlyTrending: true,
    daysInTrending: 7,
    metrics: {
      "7 days": { pageViews: 3410, opens: 2880, uniqueUsers: 1290, repeatUsers: 760, oneAndDoneUsers: 260 },
      "14 days": { pageViews: 6210, opens: 5210, uniqueUsers: 2170, repeatUsers: 1300, oneAndDoneUsers: 510 },
      "30 days": { pageViews: 13220, opens: 10350, uniqueUsers: 4020, repeatUsers: 2440, oneAndDoneUsers: 1020 },
      "60 days": { pageViews: 24500, opens: 19200, uniqueUsers: 7400, repeatUsers: 4500, oneAndDoneUsers: 1800 },
      "90 days": { pageViews: 34700, opens: 27200, uniqueUsers: 10500, repeatUsers: 6400, oneAndDoneUsers: 2500 },
    },
    momentum: {
      "3 days": { currentWAU: 1310, previousWAU: 1100 },
      "7 days": { currentWAU: 1310, previousWAU: 990 },
      "14 days": { currentWAU: 1310, previousWAU: 920 },
      "30 days": { currentWAU: 1310, previousWAU: 810 },
    },
  },
  {
    name: "Theme Tokens",
    pricingType: "free",
    pricingLabel: "Free",
    weeklyActiveUsers: 1180,
    daysSinceLastUpdate: 15,
    isCurrentlyTrending: false,
    daysInTrending: 0,
    metrics: {
      "7 days": { pageViews: 3980, opens: 2210, uniqueUsers: 1380, repeatUsers: 520, oneAndDoneUsers: 760 },
      "14 days": { pageViews: 7340, opens: 4220, uniqueUsers: 2560, repeatUsers: 1010, oneAndDoneUsers: 1390 },
      "30 days": { pageViews: 16020, opens: 8610, uniqueUsers: 5030, repeatUsers: 1980, oneAndDoneUsers: 2780 },
      "60 days": { pageViews: 29700, opens: 16000, uniqueUsers: 9300, repeatUsers: 3700, oneAndDoneUsers: 5100 },
      "90 days": { pageViews: 42100, opens: 22600, uniqueUsers: 13200, repeatUsers: 5200, oneAndDoneUsers: 7200 },
    },
    momentum: {
      "3 days": { currentWAU: 1180, previousWAU: 1140 },
      "7 days": { currentWAU: 1180, previousWAU: 1090 },
      "14 days": { currentWAU: 1180, previousWAU: 1060 },
      "30 days": { currentWAU: 1180, previousWAU: 1020 },
    },
  },
  {
    name: "Localization Lab",
    pricingType: "paid",
    pricingLabel: "$24",
    weeklyActiveUsers: 960,
    daysSinceLastUpdate: 10,
    isCurrentlyTrending: false,
    daysInTrending: 0,
    metrics: {
      "7 days": { pageViews: 3010, opens: 1950, uniqueUsers: 980, repeatUsers: 480, oneAndDoneUsers: 310 },
      "14 days": { pageViews: 5680, opens: 3760, uniqueUsers: 1770, repeatUsers: 940, oneAndDoneUsers: 620 },
      "30 days": { pageViews: 11850, opens: 7740, uniqueUsers: 3430, repeatUsers: 1830, oneAndDoneUsers: 1080 },
      "60 days": { pageViews: 22000, opens: 14400, uniqueUsers: 6300, repeatUsers: 3400, oneAndDoneUsers: 1900 },
      "90 days": { pageViews: 31100, opens: 20300, uniqueUsers: 8900, repeatUsers: 4800, oneAndDoneUsers: 2600 },
    },
    momentum: {
      "3 days": { currentWAU: 960, previousWAU: 890 },
      "7 days": { currentWAU: 960, previousWAU: 840 },
      "14 days": { currentWAU: 960, previousWAU: 810 },
      "30 days": { currentWAU: 960, previousWAU: 760 },
    },
  },
  {
    name: "Commerce Sync",
    pricingType: "paid",
    pricingLabel: "$59",
    weeklyActiveUsers: 840,
    daysSinceLastUpdate: 19,
    isCurrentlyTrending: false,
    daysInTrending: 0,
    metrics: {
      "7 days": { pageViews: 2840, opens: 1605, uniqueUsers: 910, repeatUsers: 370, oneAndDoneUsers: 390 },
      "14 days": { pageViews: 5310, opens: 3090, uniqueUsers: 1640, repeatUsers: 710, oneAndDoneUsers: 730 },
      "30 days": { pageViews: 10940, opens: 6240, uniqueUsers: 3140, repeatUsers: 1410, oneAndDoneUsers: 1380 },
      "60 days": { pageViews: 20300, opens: 11600, uniqueUsers: 5800, repeatUsers: 2600, oneAndDoneUsers: 2500 },
      "90 days": { pageViews: 28700, opens: 16400, uniqueUsers: 8200, repeatUsers: 3700, oneAndDoneUsers: 3500 },
    },
    momentum: {
      "3 days": { currentWAU: 840, previousWAU: 790 },
      "7 days": { currentWAU: 840, previousWAU: 750 },
      "14 days": { currentWAU: 840, previousWAU: 730 },
      "30 days": { currentWAU: 840, previousWAU: 700 },
    },
  },
  {
    name: "Icon Vault",
    pricingType: "free",
    pricingLabel: "Free",
    weeklyActiveUsers: 920,
    daysSinceLastUpdate: 47,
    isCurrentlyTrending: false,
    daysInTrending: 0,
    metrics: {
      "7 days": { pageViews: 4680, opens: 1820, uniqueUsers: 1205, repeatUsers: 310, oneAndDoneUsers: 770 },
      "14 days": { pageViews: 8420, opens: 3390, uniqueUsers: 2160, repeatUsers: 590, oneAndDoneUsers: 1400 },
      "30 days": { pageViews: 18110, opens: 7020, uniqueUsers: 4240, repeatUsers: 1200, oneAndDoneUsers: 2840 },
      "60 days": { pageViews: 33600, opens: 13000, uniqueUsers: 7800, repeatUsers: 2200, oneAndDoneUsers: 5200 },
      "90 days": { pageViews: 47600, opens: 18400, uniqueUsers: 11100, repeatUsers: 3100, oneAndDoneUsers: 7300 },
    },
    momentum: {
      "3 days": { currentWAU: 920, previousWAU: 720 },
      "7 days": { currentWAU: 920, previousWAU: 640 },
      "14 days": { currentWAU: 920, previousWAU: 600 },
      "30 days": { currentWAU: 920, previousWAU: 540 },
    },
  },
  {
    name: "Audit Flow",
    pricingType: "free",
    pricingLabel: "Free",
    weeklyActiveUsers: 720,
    daysSinceLastUpdate: 31,
    isCurrentlyTrending: false,
    daysInTrending: 0,
    metrics: {
      "7 days": { pageViews: 2710, opens: 1210, uniqueUsers: 830, repeatUsers: 240, oneAndDoneUsers: 520 },
      "14 days": { pageViews: 5080, opens: 2340, uniqueUsers: 1540, repeatUsers: 470, oneAndDoneUsers: 990 },
      "30 days": { pageViews: 10820, opens: 4710, uniqueUsers: 3010, repeatUsers: 930, oneAndDoneUsers: 1970 },
      "60 days": { pageViews: 20100, opens: 8700, uniqueUsers: 5600, repeatUsers: 1700, oneAndDoneUsers: 3600 },
      "90 days": { pageViews: 28400, opens: 12300, uniqueUsers: 7900, repeatUsers: 2400, oneAndDoneUsers: 5100 },
    },
    momentum: {
      "3 days": { currentWAU: 720, previousWAU: 710 },
      "7 days": { currentWAU: 720, previousWAU: 700 },
      "14 days": { currentWAU: 720, previousWAU: 690 },
      "30 days": { currentWAU: 720, previousWAU: 680 },
    },
  },
  {
    name: "Data Table Plus",
    pricingType: "paid",
    pricingLabel: "$34",
    weeklyActiveUsers: 650,
    daysSinceLastUpdate: 13,
    isCurrentlyTrending: false,
    daysInTrending: 0,
    metrics: {
      "7 days": { pageViews: 2140, opens: 1440, uniqueUsers: 740, repeatUsers: 350, oneAndDoneUsers: 240 },
      "14 days": { pageViews: 4030, opens: 2760, uniqueUsers: 1360, repeatUsers: 690, oneAndDoneUsers: 470 },
      "30 days": { pageViews: 8640, opens: 5560, uniqueUsers: 2680, repeatUsers: 1420, oneAndDoneUsers: 910 },
      "60 days": { pageViews: 16000, opens: 10300, uniqueUsers: 5000, repeatUsers: 2600, oneAndDoneUsers: 1600 },
      "90 days": { pageViews: 22700, opens: 14600, uniqueUsers: 7100, repeatUsers: 3700, oneAndDoneUsers: 2200 },
    },
    momentum: {
      "3 days": { currentWAU: 650, previousWAU: 620 },
      "7 days": { currentWAU: 650, previousWAU: 590 },
      "14 days": { currentWAU: 650, previousWAU: 570 },
      "30 days": { currentWAU: 650, previousWAU: 540 },
    },
  },
  {
    name: "Video Lightbox",
    pricingType: "free",
    pricingLabel: "Free",
    weeklyActiveUsers: 580,
    daysSinceLastUpdate: 27,
    isCurrentlyTrending: false,
    daysInTrending: 0,
    metrics: {
      "7 days": { pageViews: 2380, opens: 1180, uniqueUsers: 690, repeatUsers: 210, oneAndDoneUsers: 410 },
      "14 days": { pageViews: 4420, opens: 2190, uniqueUsers: 1240, repeatUsers: 420, oneAndDoneUsers: 760 },
      "30 days": { pageViews: 9450, opens: 4510, uniqueUsers: 2440, repeatUsers: 880, oneAndDoneUsers: 1490 },
      "60 days": { pageViews: 17500, opens: 8400, uniqueUsers: 4500, repeatUsers: 1600, oneAndDoneUsers: 2700 },
      "90 days": { pageViews: 24800, opens: 11900, uniqueUsers: 6400, repeatUsers: 2300, oneAndDoneUsers: 3800 },
    },
    momentum: {
      "3 days": { currentWAU: 580, previousWAU: 470 },
      "7 days": { currentWAU: 580, previousWAU: 420 },
      "14 days": { currentWAU: 580, previousWAU: 390 },
      "30 days": { currentWAU: 580, previousWAU: 350 },
    },
  },
  {
    name: "Release Notes",
    pricingType: "free",
    pricingLabel: "Free",
    weeklyActiveUsers: 310,
    daysSinceLastUpdate: 58,
    isCurrentlyTrending: false,
    daysInTrending: 0,
    metrics: {
      "7 days": { pageViews: 980, opens: 340, uniqueUsers: 240, repeatUsers: 70, oneAndDoneUsers: 150 },
      "14 days": { pageViews: 1810, opens: 650, uniqueUsers: 430, repeatUsers: 120, oneAndDoneUsers: 280 },
      "30 days": { pageViews: 3920, opens: 1330, uniqueUsers: 830, repeatUsers: 240, oneAndDoneUsers: 540 },
      "60 days": { pageViews: 7300, opens: 2500, uniqueUsers: 1500, repeatUsers: 440, oneAndDoneUsers: 980 },
      "90 days": { pageViews: 10300, opens: 3500, uniqueUsers: 2100, repeatUsers: 620, oneAndDoneUsers: 1380 },
    },
    momentum: {
      "3 days": { currentWAU: 310, previousWAU: 290 },
      "7 days": { currentWAU: 310, previousWAU: 270 },
      "14 days": { currentWAU: 310, previousWAU: 260 },
      "30 days": { currentWAU: 310, previousWAU: 250 },
    },
  },
];

const pluginMetadata: Partial<
  Record<
    PluginSeed["name"],
    {
      adminOverride?: AdminOverride;
      category?: string;
      creator?: string;
      daysSinceLastTrending?: number | null;
      explorationCandidate?: boolean;
    }
  >
> = {
  "Forms Pro": { adminOverride: "great", creator: "Studio North", category: "Forms" },
  "Motion Toolkit": { creator: "Motion Forge", category: "Animation" },
  "SEO Helper": { creator: "Growth Loop", category: "Marketing", daysSinceLastTrending: 3, explorationCandidate: true },
  "CMS Bridge": { creator: "Content Works", category: "CMS" },
  "Copy Assist": { creator: "Growth Loop", category: "Copywriting" },
  "Theme Tokens": { creator: "Design Systems Co", category: "Design System", daysSinceLastTrending: 9, explorationCandidate: true },
  "Localization Lab": { creator: "Global Kit", category: "Localization", daysSinceLastTrending: 2 },
  "Commerce Sync": { adminOverride: "bad", creator: "Commerce Labs", category: "Commerce" },
  "Icon Vault": { creator: "Design Systems Co", category: "Assets", explorationCandidate: true },
  "Audit Flow": { creator: "Ops Works", category: "Workflow" },
  "Data Table Plus": { creator: "Ops Works", category: "Data", explorationCandidate: true },
  "Video Lightbox": { creator: "Motion Forge", category: "Media" },
  "Release Notes": { creator: "Ops Works", category: "Productivity" },
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function safeDivide(numerator: number, denominator: number) {
  if (denominator <= 0) return 0;
  return numerator / denominator;
}

function clampGrowth(growth: number) {
  return clamp(growth, -0.95, 2);
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
  settings: PluginRankingSettings,
) {
  return (
    (settings.recencyWeight / 100) * recentScore +
    (settings.lifetimeWeight / 100) * lifetimeScore
  );
}

function getWAUGrowth(
  momentumMetrics: PluginMomentumMetrics,
  wauMultiplier: number,
) {
  const adjCurrentWAU = momentumMetrics.currentWAU * wauMultiplier;
  const adjPreviousWAU = momentumMetrics.previousWAU * wauMultiplier;

  return clampGrowth(
    safeDivide(adjCurrentWAU - adjPreviousWAU, Math.max(adjPreviousWAU, 1)),
  );
}

function getPreviousMomentumWindow(
  window: PluginMomentumWindow,
): PluginMomentumWindow | null {
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
  plugin: PluginSeed,
  settings: PluginRankingSettings,
  wauMultiplier: number,
) {
  const currentGrowth = Math.max(
    0,
    getWAUGrowth(plugin.momentum[settings.momentumWindow], wauMultiplier),
  );
  const previousWindow = getPreviousMomentumWindow(settings.momentumWindow);
  const previousGrowth =
    previousWindow === null
      ? currentGrowth
      : Math.max(0, getWAUGrowth(plugin.momentum[previousWindow], wauMultiplier));
  const acceleration = Math.max(0, currentGrowth - previousGrowth);

  return (
    settings.momentumWeight * currentGrowth +
    settings.accelerationWeight * acceleration
  );
}

export function getPluginRankingSettings(
  settings: SidebarSettingsState,
): PluginRankingSettings {
  return {
    pluginOpensWeight: getNumericSettingValue(settings, "Weight Metrics", "Plugin Opens"),
    uniqueUsersWeight: getNumericSettingValue(settings, "Weight Metrics", "Unique Users"),
    weeklyActiveUsersWeight: getNumericSettingValue(settings, "Weight Metrics", "Weekly Active Users"),
    averageOpensPerUserWeight: getNumericSettingValue(settings, "Weight Metrics", "Average Opens per User"),
    openRateWeight: getNumericSettingValue(settings, "Rate Metrics", "Open Rate"),
    repeatOpenRateWeight: getNumericSettingValue(settings, "Rate Metrics", "Repeat Open Rate"),
    bounceRateProxyWeight: getNumericSettingValue(settings, "Rate Metrics", "Bounce Rate Proxy"),
    paidOpenMultiplier: getNumericSettingValue(settings, "Paid Normalization", "Paid Open Multiplier"),
    paidWAUMultiplier: getNumericSettingValue(settings, "Paid Normalization", "Paid WAU Multiplier"),
    lookbackWindow: getDropdownSettingValue(settings, "Time", "Lookback Window") as PluginLookbackWindow,
    recencyWeight: getNumericSettingValue(settings, "Time", "Recency Weight"),
    lifetimeWeight: getNumericSettingValue(settings, "Time", "Lifetime Weight"),
    updateFreshnessWeight: getNumericSettingValue(settings, "Plugin Maintenance", "Update Freshness Weight"),
    maxUpdateAge: getNumericSettingValue(settings, "Plugin Maintenance", "Max Update Age"),
    momentumWindow: getDropdownSettingValue(settings, "Momentum", "Window") as PluginMomentumWindow,
    momentumWeight: getNumericSettingValue(settings, "Momentum", "Weight"),
    accelerationWeight: getNumericSettingValue(settings, "Momentum", "Acceleration"),
    minUniqueUsers: getNumericSettingValue(settings, "Minimum Statistics", "Min Unique Users"),
    minWeeklyActiveUsers: getNumericSettingValue(settings, "Minimum Statistics", "Min Weekly Active Users"),
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

export function scorePlugins(settings: PluginRankingSettings): RankedPlugin[] {
  const rankedPlugins = pluginSeeds.map((plugin) => {
    const metadata = pluginMetadata[plugin.name];
    const recentMetrics = plugin.metrics[settings.lookbackWindow];
    const lifetimeMetrics = plugin.metrics["90 days"];
    const isPaid = plugin.pricingType === "paid";
    const openMultiplier = isPaid ? settings.paidOpenMultiplier : 1;
    const wauMultiplier = isPaid ? settings.paidWAUMultiplier : 1;

    const adjustedOpens = recentMetrics.opens * openMultiplier;
    const lifetimeAdjustedOpens = lifetimeMetrics.opens * openMultiplier;
    const adjustedWAU = plugin.weeklyActiveUsers * wauMultiplier;
    const averageOpensPerUser = safeDivide(adjustedOpens, Math.max(recentMetrics.uniqueUsers, 1));
    const lifetimeAverageOpensPerUser = safeDivide(
      lifetimeAdjustedOpens,
      Math.max(lifetimeMetrics.uniqueUsers, 1),
    );
    const openRate = safeDivide(adjustedOpens, Math.max(recentMetrics.pageViews, 1));
    const lifetimeOpenRate = safeDivide(
      lifetimeAdjustedOpens,
      Math.max(lifetimeMetrics.pageViews, 1),
    );
    const repeatOpenRate = safeDivide(
      recentMetrics.repeatUsers,
      Math.max(recentMetrics.uniqueUsers, 1),
    );
    const lifetimeRepeatOpenRate = safeDivide(
      lifetimeMetrics.repeatUsers,
      Math.max(lifetimeMetrics.uniqueUsers, 1),
    );
    const bounceRate = safeDivide(
      recentMetrics.oneAndDoneUsers,
      Math.max(recentMetrics.uniqueUsers, 1),
    );
    const lifetimeBounceRate = safeDivide(
      lifetimeMetrics.oneAndDoneUsers,
      Math.max(lifetimeMetrics.uniqueUsers, 1),
    );
    const freshnessFactor = clamp(
      1 - plugin.daysSinceLastUpdate / Math.max(settings.maxUpdateAge, 1),
      0,
      1,
    );
    const momentumScore = getMomentumScore(plugin, settings, wauMultiplier);
    const overrideMultiplier = getOverrideMultiplier(
      metadata?.adminOverride,
      settings.boost,
      settings.decay,
    );
    const rotation = getRotationState(
      plugin.isCurrentlyTrending,
      plugin.daysInTrending,
      metadata?.daysSinceLastTrending,
      settings.durationDecay,
      settings.maxDays,
      settings.cooldown,
    );
    const meetsMinimums =
      recentMetrics.uniqueUsers >= settings.minUniqueUsers &&
      plugin.weeklyActiveUsers >= settings.minWeeklyActiveUsers;

    const opensScore = blendScores(
      settings.pluginOpensWeight * Math.log(adjustedOpens + 1),
      settings.pluginOpensWeight * Math.log(lifetimeAdjustedOpens + 1),
      settings,
    );
    const uniqueUsersScore = blendScores(
      settings.uniqueUsersWeight * Math.log(recentMetrics.uniqueUsers + 1),
      settings.uniqueUsersWeight * Math.log(lifetimeMetrics.uniqueUsers + 1),
      settings,
    );
    const wauScore = settings.weeklyActiveUsersWeight * Math.log(adjustedWAU + 1);
    const averageOpensScore = blendScores(
      settings.averageOpensPerUserWeight * averageOpensPerUser,
      settings.averageOpensPerUserWeight * lifetimeAverageOpensPerUser,
      settings,
    );
    const openRateScore = blendScores(
      settings.openRateWeight * openRate,
      settings.openRateWeight * lifetimeOpenRate,
      settings,
    );
    const repeatRateScore = blendScores(
      settings.repeatOpenRateWeight * repeatOpenRate,
      settings.repeatOpenRateWeight * lifetimeRepeatOpenRate,
      settings,
    );
    const bounceScore = blendScores(
      settings.bounceRateProxyWeight * (1 - bounceRate),
      settings.bounceRateProxyWeight * (1 - lifetimeBounceRate),
      settings,
    );
    const maintenanceScore = settings.updateFreshnessWeight * freshnessFactor;

    let runningTotal =
      opensScore +
      uniqueUsersScore +
      wauScore +
      averageOpensScore +
      openRateScore +
      repeatRateScore +
      bounceScore +
      maintenanceScore +
      momentumScore;

    runningTotal *= overrideMultiplier;

    const isEligible = meetsMinimums && rotation.eligible;
    const finalScore = isEligible ? runningTotal * rotation.value : 0;

    return {
      name: plugin.name,
      pricingType: plugin.pricingType,
      pricingLabel: plugin.pricingLabel,
      finalScore,
      isEligible,
      opens: adjustedOpens,
      uniqueUsers: recentMetrics.uniqueUsers,
      weeklyActiveUsers: adjustedWAU,
      averageOpensPerUser,
      openRate,
      repeatOpenRate,
      bounceRate,
      daysSinceLastUpdate: plugin.daysSinceLastUpdate,
      pageViews: recentMetrics.pageViews,
    } satisfies RankedPlugin;
  });

  return applyExplorationOrdering(
    rankedPlugins,
    settings.explorationPercent,
    (plugin) => pluginMetadata[plugin.name]?.explorationCandidate === true,
    {
      creatorCap: settings.creatorCap,
      categoryCap: settings.categoryCap,
      getCreator: (plugin) => pluginMetadata[plugin.name]?.creator,
      getCategory: (plugin) => pluginMetadata[plugin.name]?.category,
    },
  );
}
