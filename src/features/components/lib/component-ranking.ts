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

export type ComponentLookbackWindow =
  | "7 days"
  | "14 days"
  | "30 days"
  | "60 days"
  | "90 days";

export type ComponentMomentumWindow = "3 days" | "7 days" | "14 days" | "30 days";

export type ComponentPricingType = "free" | "paid";

type ComponentPeriodMetrics = {
  distinctProjects: number;
  opens: number;
  projectInstalls: number;
  uniqueUsers: number;
};

type ComponentMomentumMetrics = {
  currentInstalls: number;
  currentUniqueUsers: number;
  previousInstalls: number;
  previousUniqueUsers: number;
};

type ComponentSeed = {
  ageDays: number;
  daysInTrending: number;
  isCurrentlyTrending: boolean;
  metrics: Record<ComponentLookbackWindow, ComponentPeriodMetrics>;
  momentum: Record<ComponentMomentumWindow, ComponentMomentumMetrics>;
  name: string;
  pricingLabel: string;
  pricingType: ComponentPricingType;
};

export type ComponentRankingSettings = {
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
  freshComponentBoost: number;
  lifetimeWeight: number;
  lookbackWindow: ComponentLookbackWindow;
  maxDays: number;
  minInstalls: number;
  minUniqueUsers: number;
  momentumWeight: number;
  momentumWindow: ComponentMomentumWindow;
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

export type RankedComponent = {
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
  pricingType: ComponentPricingType;
  projectInstalls: number;
  uniqueUsers: number;
};

const componentSeeds: ComponentSeed[] = [
  {
    name: "Hero Section",
    pricingType: "free",
    pricingLabel: "Free",
    ageDays: 120,
    isCurrentlyTrending: true,
    daysInTrending: 5,
    metrics: {
      "7 days": { opens: 4200, uniqueUsers: 1850, projectInstalls: 3100, distinctProjects: 2400 },
      "14 days": { opens: 7800, uniqueUsers: 3200, projectInstalls: 5800, distinctProjects: 4300 },
      "30 days": { opens: 15200, uniqueUsers: 6100, projectInstalls: 11400, distinctProjects: 8200 },
      "60 days": { opens: 28400, uniqueUsers: 11200, projectInstalls: 21000, distinctProjects: 15100 },
      "90 days": { opens: 39800, uniqueUsers: 15600, projectInstalls: 29200, distinctProjects: 21000 },
    },
    momentum: {
      "3 days": { currentInstalls: 1400, previousInstalls: 1200, currentUniqueUsers: 820, previousUniqueUsers: 710 },
      "7 days": { currentInstalls: 3100, previousInstalls: 2700, currentUniqueUsers: 1850, previousUniqueUsers: 1600 },
      "14 days": { currentInstalls: 5800, previousInstalls: 5100, currentUniqueUsers: 3200, previousUniqueUsers: 2900 },
      "30 days": { currentInstalls: 11400, previousInstalls: 10200, currentUniqueUsers: 6100, previousUniqueUsers: 5600 },
    },
  },
  {
    name: "Pricing Table",
    pricingType: "paid",
    pricingLabel: "$19",
    ageDays: 45,
    isCurrentlyTrending: true,
    daysInTrending: 3,
    metrics: {
      "7 days": { opens: 2800, uniqueUsers: 1240, projectInstalls: 2100, distinctProjects: 1600 },
      "14 days": { opens: 5200, uniqueUsers: 2300, projectInstalls: 3900, distinctProjects: 2900 },
      "30 days": { opens: 10100, uniqueUsers: 4300, projectInstalls: 7500, distinctProjects: 5400 },
      "60 days": { opens: 16800, uniqueUsers: 7100, projectInstalls: 12400, distinctProjects: 8900 },
      "90 days": { opens: 18200, uniqueUsers: 7800, projectInstalls: 13600, distinctProjects: 9700 },
    },
    momentum: {
      "3 days": { currentInstalls: 1050, previousInstalls: 820, currentUniqueUsers: 580, previousUniqueUsers: 440 },
      "7 days": { currentInstalls: 2100, previousInstalls: 1600, currentUniqueUsers: 1240, previousUniqueUsers: 950 },
      "14 days": { currentInstalls: 3900, previousInstalls: 3200, currentUniqueUsers: 2300, previousUniqueUsers: 1900 },
      "30 days": { currentInstalls: 7500, previousInstalls: 6400, currentUniqueUsers: 4300, previousUniqueUsers: 3700 },
    },
  },
  {
    name: "Testimonial Carousel",
    pricingType: "free",
    pricingLabel: "Free",
    ageDays: 200,
    isCurrentlyTrending: false,
    daysInTrending: 0,
    metrics: {
      "7 days": { opens: 3600, uniqueUsers: 1580, projectInstalls: 2600, distinctProjects: 2000 },
      "14 days": { opens: 6700, uniqueUsers: 2900, projectInstalls: 4800, distinctProjects: 3600 },
      "30 days": { opens: 13100, uniqueUsers: 5500, projectInstalls: 9400, distinctProjects: 6900 },
      "60 days": { opens: 24200, uniqueUsers: 10100, projectInstalls: 17500, distinctProjects: 12800 },
      "90 days": { opens: 34500, uniqueUsers: 14200, projectInstalls: 24800, distinctProjects: 18100 },
    },
    momentum: {
      "3 days": { currentInstalls: 1100, previousInstalls: 1080, currentUniqueUsers: 680, previousUniqueUsers: 670 },
      "7 days": { currentInstalls: 2600, previousInstalls: 2550, currentUniqueUsers: 1580, previousUniqueUsers: 1560 },
      "14 days": { currentInstalls: 4800, previousInstalls: 4700, currentUniqueUsers: 2900, previousUniqueUsers: 2850 },
      "30 days": { currentInstalls: 9400, previousInstalls: 9200, currentUniqueUsers: 5500, previousUniqueUsers: 5400 },
    },
  },
  {
    name: "Feature Grid",
    pricingType: "paid",
    pricingLabel: "$14",
    ageDays: 90,
    isCurrentlyTrending: true,
    daysInTrending: 8,
    metrics: {
      "7 days": { opens: 2100, uniqueUsers: 940, projectInstalls: 1650, distinctProjects: 1250 },
      "14 days": { opens: 3900, uniqueUsers: 1700, projectInstalls: 3000, distinctProjects: 2200 },
      "30 days": { opens: 7600, uniqueUsers: 3200, projectInstalls: 5800, distinctProjects: 4200 },
      "60 days": { opens: 13400, uniqueUsers: 5600, projectInstalls: 10200, distinctProjects: 7400 },
      "90 days": { opens: 16800, uniqueUsers: 7000, projectInstalls: 12800, distinctProjects: 9300 },
    },
    momentum: {
      "3 days": { currentInstalls: 780, previousInstalls: 700, currentUniqueUsers: 420, previousUniqueUsers: 380 },
      "7 days": { currentInstalls: 1650, previousInstalls: 1500, currentUniqueUsers: 940, previousUniqueUsers: 860 },
      "14 days": { currentInstalls: 3000, previousInstalls: 2800, currentUniqueUsers: 1700, previousUniqueUsers: 1580 },
      "30 days": { currentInstalls: 5800, previousInstalls: 5400, currentUniqueUsers: 3200, previousUniqueUsers: 3000 },
    },
  },
  {
    name: "Contact Form",
    pricingType: "free",
    pricingLabel: "Free",
    ageDays: 300,
    isCurrentlyTrending: false,
    daysInTrending: 0,
    metrics: {
      "7 days": { opens: 5100, uniqueUsers: 2200, projectInstalls: 3800, distinctProjects: 3000 },
      "14 days": { opens: 9400, uniqueUsers: 4000, projectInstalls: 7100, distinctProjects: 5500 },
      "30 days": { opens: 18200, uniqueUsers: 7600, projectInstalls: 13800, distinctProjects: 10200 },
      "60 days": { opens: 33800, uniqueUsers: 14000, projectInstalls: 25600, distinctProjects: 18900 },
      "90 days": { opens: 48200, uniqueUsers: 19800, projectInstalls: 36400, distinctProjects: 26800 },
    },
    momentum: {
      "3 days": { currentInstalls: 1600, previousInstalls: 1580, currentUniqueUsers: 950, previousUniqueUsers: 940 },
      "7 days": { currentInstalls: 3800, previousInstalls: 3750, currentUniqueUsers: 2200, previousUniqueUsers: 2180 },
      "14 days": { currentInstalls: 7100, previousInstalls: 7000, currentUniqueUsers: 4000, previousUniqueUsers: 3950 },
      "30 days": { currentInstalls: 13800, previousInstalls: 13600, currentUniqueUsers: 7600, previousUniqueUsers: 7500 },
    },
  },
  {
    name: "Navigation Bar",
    pricingType: "free",
    pricingLabel: "Free",
    ageDays: 180,
    isCurrentlyTrending: false,
    daysInTrending: 0,
    metrics: {
      "7 days": { opens: 4800, uniqueUsers: 2100, projectInstalls: 3500, distinctProjects: 2800 },
      "14 days": { opens: 8900, uniqueUsers: 3800, projectInstalls: 6500, distinctProjects: 5100 },
      "30 days": { opens: 17400, uniqueUsers: 7200, projectInstalls: 12700, distinctProjects: 9500 },
      "60 days": { opens: 32000, uniqueUsers: 13200, projectInstalls: 23400, distinctProjects: 17500 },
      "90 days": { opens: 45200, uniqueUsers: 18600, projectInstalls: 33000, distinctProjects: 24700 },
    },
    momentum: {
      "3 days": { currentInstalls: 1500, previousInstalls: 1480, currentUniqueUsers: 900, previousUniqueUsers: 890 },
      "7 days": { currentInstalls: 3500, previousInstalls: 3450, currentUniqueUsers: 2100, previousUniqueUsers: 2080 },
      "14 days": { currentInstalls: 6500, previousInstalls: 6400, currentUniqueUsers: 3800, previousUniqueUsers: 3750 },
      "30 days": { currentInstalls: 12700, previousInstalls: 12500, currentUniqueUsers: 7200, previousUniqueUsers: 7100 },
    },
  },
  {
    name: "Footer",
    pricingType: "free",
    pricingLabel: "Free",
    ageDays: 250,
    isCurrentlyTrending: false,
    daysInTrending: 0,
    metrics: {
      "7 days": { opens: 3900, uniqueUsers: 1700, projectInstalls: 2900, distinctProjects: 2300 },
      "14 days": { opens: 7200, uniqueUsers: 3100, projectInstalls: 5400, distinctProjects: 4100 },
      "30 days": { opens: 14000, uniqueUsers: 5900, projectInstalls: 10500, distinctProjects: 7800 },
      "60 days": { opens: 25800, uniqueUsers: 10800, projectInstalls: 19400, distinctProjects: 14400 },
      "90 days": { opens: 36500, uniqueUsers: 15200, projectInstalls: 27400, distinctProjects: 20300 },
    },
    momentum: {
      "3 days": { currentInstalls: 1250, previousInstalls: 1230, currentUniqueUsers: 730, previousUniqueUsers: 720 },
      "7 days": { currentInstalls: 2900, previousInstalls: 2850, currentUniqueUsers: 1700, previousUniqueUsers: 1680 },
      "14 days": { currentInstalls: 5400, previousInstalls: 5300, currentUniqueUsers: 3100, previousUniqueUsers: 3050 },
      "30 days": { currentInstalls: 10500, previousInstalls: 10300, currentUniqueUsers: 5900, previousUniqueUsers: 5800 },
    },
  },
  {
    name: "Animated Counter",
    pricingType: "paid",
    pricingLabel: "$9",
    ageDays: 12,
    isCurrentlyTrending: false,
    daysInTrending: 0,
    metrics: {
      "7 days": { opens: 1400, uniqueUsers: 620, projectInstalls: 980, distinctProjects: 740 },
      "14 days": { opens: 1400, uniqueUsers: 620, projectInstalls: 980, distinctProjects: 740 },
      "30 days": { opens: 1400, uniqueUsers: 620, projectInstalls: 980, distinctProjects: 740 },
      "60 days": { opens: 1400, uniqueUsers: 620, projectInstalls: 980, distinctProjects: 740 },
      "90 days": { opens: 1400, uniqueUsers: 620, projectInstalls: 980, distinctProjects: 740 },
    },
    momentum: {
      "3 days": { currentInstalls: 520, previousInstalls: 300, currentUniqueUsers: 310, previousUniqueUsers: 180 },
      "7 days": { currentInstalls: 980, previousInstalls: 0, currentUniqueUsers: 620, previousUniqueUsers: 0 },
      "14 days": { currentInstalls: 980, previousInstalls: 0, currentUniqueUsers: 620, previousUniqueUsers: 0 },
      "30 days": { currentInstalls: 980, previousInstalls: 0, currentUniqueUsers: 620, previousUniqueUsers: 0 },
    },
  },
  {
    name: "FAQ Accordion",
    pricingType: "free",
    pricingLabel: "Free",
    ageDays: 160,
    isCurrentlyTrending: false,
    daysInTrending: 0,
    metrics: {
      "7 days": { opens: 2600, uniqueUsers: 1150, projectInstalls: 1900, distinctProjects: 1500 },
      "14 days": { opens: 4800, uniqueUsers: 2100, projectInstalls: 3500, distinctProjects: 2700 },
      "30 days": { opens: 9400, uniqueUsers: 4000, projectInstalls: 6900, distinctProjects: 5100 },
      "60 days": { opens: 17400, uniqueUsers: 7300, projectInstalls: 12800, distinctProjects: 9500 },
      "90 days": { opens: 24600, uniqueUsers: 10300, projectInstalls: 18100, distinctProjects: 13400 },
    },
    momentum: {
      "3 days": { currentInstalls: 800, previousInstalls: 790, currentUniqueUsers: 490, previousUniqueUsers: 485 },
      "7 days": { currentInstalls: 1900, previousInstalls: 1870, currentUniqueUsers: 1150, previousUniqueUsers: 1130 },
      "14 days": { currentInstalls: 3500, previousInstalls: 3450, currentUniqueUsers: 2100, previousUniqueUsers: 2070 },
      "30 days": { currentInstalls: 6900, previousInstalls: 6800, currentUniqueUsers: 4000, previousUniqueUsers: 3950 },
    },
  },
  {
    name: "Image Gallery",
    pricingType: "paid",
    pricingLabel: "$24",
    ageDays: 70,
    isCurrentlyTrending: true,
    daysInTrending: 2,
    metrics: {
      "7 days": { opens: 1800, uniqueUsers: 810, projectInstalls: 1350, distinctProjects: 1020 },
      "14 days": { opens: 3400, uniqueUsers: 1500, projectInstalls: 2500, distinctProjects: 1900 },
      "30 days": { opens: 6600, uniqueUsers: 2800, projectInstalls: 4900, distinctProjects: 3600 },
      "60 days": { opens: 11000, uniqueUsers: 4600, projectInstalls: 8100, distinctProjects: 6000 },
      "90 days": { opens: 12400, uniqueUsers: 5200, projectInstalls: 9200, distinctProjects: 6800 },
    },
    momentum: {
      "3 days": { currentInstalls: 680, previousInstalls: 530, currentUniqueUsers: 380, previousUniqueUsers: 290 },
      "7 days": { currentInstalls: 1350, previousInstalls: 1050, currentUniqueUsers: 810, previousUniqueUsers: 630 },
      "14 days": { currentInstalls: 2500, previousInstalls: 2100, currentUniqueUsers: 1500, previousUniqueUsers: 1260 },
      "30 days": { currentInstalls: 4900, previousInstalls: 4200, currentUniqueUsers: 2800, previousUniqueUsers: 2400 },
    },
  },
  {
    name: "Cookie Banner",
    pricingType: "free",
    pricingLabel: "Free",
    ageDays: 140,
    isCurrentlyTrending: false,
    daysInTrending: 0,
    metrics: {
      "7 days": { opens: 2200, uniqueUsers: 980, projectInstalls: 1600, distinctProjects: 1250 },
      "14 days": { opens: 4100, uniqueUsers: 1800, projectInstalls: 3000, distinctProjects: 2300 },
      "30 days": { opens: 8000, uniqueUsers: 3400, projectInstalls: 5800, distinctProjects: 4300 },
      "60 days": { opens: 14800, uniqueUsers: 6200, projectInstalls: 10800, distinctProjects: 8000 },
      "90 days": { opens: 20900, uniqueUsers: 8700, projectInstalls: 15200, distinctProjects: 11200 },
    },
    momentum: {
      "3 days": { currentInstalls: 680, previousInstalls: 670, currentUniqueUsers: 420, previousUniqueUsers: 415 },
      "7 days": { currentInstalls: 1600, previousInstalls: 1580, currentUniqueUsers: 980, previousUniqueUsers: 970 },
      "14 days": { currentInstalls: 3000, previousInstalls: 2950, currentUniqueUsers: 1800, previousUniqueUsers: 1770 },
      "30 days": { currentInstalls: 5800, previousInstalls: 5700, currentUniqueUsers: 3400, previousUniqueUsers: 3350 },
    },
  },
  {
    name: "Video Background",
    pricingType: "paid",
    pricingLabel: "$29",
    ageDays: 35,
    isCurrentlyTrending: true,
    daysInTrending: 6,
    metrics: {
      "7 days": { opens: 1600, uniqueUsers: 720, projectInstalls: 1200, distinctProjects: 900 },
      "14 days": { opens: 3000, uniqueUsers: 1300, projectInstalls: 2200, distinctProjects: 1650 },
      "30 days": { opens: 5800, uniqueUsers: 2500, projectInstalls: 4300, distinctProjects: 3200 },
      "60 days": { opens: 7200, uniqueUsers: 3100, projectInstalls: 5400, distinctProjects: 4000 },
      "90 days": { opens: 7200, uniqueUsers: 3100, projectInstalls: 5400, distinctProjects: 4000 },
    },
    momentum: {
      "3 days": { currentInstalls: 600, previousInstalls: 460, currentUniqueUsers: 340, previousUniqueUsers: 260 },
      "7 days": { currentInstalls: 1200, previousInstalls: 920, currentUniqueUsers: 720, previousUniqueUsers: 550 },
      "14 days": { currentInstalls: 2200, previousInstalls: 1800, currentUniqueUsers: 1300, previousUniqueUsers: 1060 },
      "30 days": { currentInstalls: 4300, previousInstalls: 3600, currentUniqueUsers: 2500, previousUniqueUsers: 2100 },
    },
  },
  {
    name: "Stats Counter",
    pricingType: "free",
    pricingLabel: "Free",
    ageDays: 110,
    isCurrentlyTrending: false,
    daysInTrending: 0,
    metrics: {
      "7 days": { opens: 1900, uniqueUsers: 850, projectInstalls: 1400, distinctProjects: 1080 },
      "14 days": { opens: 3500, uniqueUsers: 1550, projectInstalls: 2600, distinctProjects: 1950 },
      "30 days": { opens: 6800, uniqueUsers: 2900, projectInstalls: 5000, distinctProjects: 3700 },
      "60 days": { opens: 12500, uniqueUsers: 5300, projectInstalls: 9200, distinctProjects: 6800 },
      "90 days": { opens: 17600, uniqueUsers: 7400, projectInstalls: 13000, distinctProjects: 9600 },
    },
    momentum: {
      "3 days": { currentInstalls: 600, previousInstalls: 590, currentUniqueUsers: 360, previousUniqueUsers: 355 },
      "7 days": { currentInstalls: 1400, previousInstalls: 1380, currentUniqueUsers: 850, previousUniqueUsers: 840 },
      "14 days": { currentInstalls: 2600, previousInstalls: 2560, currentUniqueUsers: 1550, previousUniqueUsers: 1530 },
      "30 days": { currentInstalls: 5000, previousInstalls: 4920, currentUniqueUsers: 2900, previousUniqueUsers: 2860 },
    },
  },
  {
    name: "Tabs Component",
    pricingType: "free",
    pricingLabel: "Free",
    ageDays: 95,
    isCurrentlyTrending: false,
    daysInTrending: 0,
    metrics: {
      "7 days": { opens: 1500, uniqueUsers: 670, projectInstalls: 1100, distinctProjects: 840 },
      "14 days": { opens: 2800, uniqueUsers: 1220, projectInstalls: 2050, distinctProjects: 1540 },
      "30 days": { opens: 5400, uniqueUsers: 2300, projectInstalls: 3900, distinctProjects: 2900 },
      "60 days": { opens: 9800, uniqueUsers: 4100, projectInstalls: 7100, distinctProjects: 5300 },
      "90 days": { opens: 13200, uniqueUsers: 5500, projectInstalls: 9600, distinctProjects: 7100 },
    },
    momentum: {
      "3 days": { currentInstalls: 470, previousInstalls: 460, currentUniqueUsers: 280, previousUniqueUsers: 275 },
      "7 days": { currentInstalls: 1100, previousInstalls: 1080, currentUniqueUsers: 670, previousUniqueUsers: 660 },
      "14 days": { currentInstalls: 2050, previousInstalls: 2020, currentUniqueUsers: 1220, previousUniqueUsers: 1200 },
      "30 days": { currentInstalls: 3900, previousInstalls: 3840, currentUniqueUsers: 2300, previousUniqueUsers: 2260 },
    },
  },
  {
    name: "Marquee Scroll",
    pricingType: "paid",
    pricingLabel: "$12",
    ageDays: 8,
    isCurrentlyTrending: false,
    daysInTrending: 0,
    metrics: {
      "7 days": { opens: 900, uniqueUsers: 410, projectInstalls: 620, distinctProjects: 480 },
      "14 days": { opens: 900, uniqueUsers: 410, projectInstalls: 620, distinctProjects: 480 },
      "30 days": { opens: 900, uniqueUsers: 410, projectInstalls: 620, distinctProjects: 480 },
      "60 days": { opens: 900, uniqueUsers: 410, projectInstalls: 620, distinctProjects: 480 },
      "90 days": { opens: 900, uniqueUsers: 410, projectInstalls: 620, distinctProjects: 480 },
    },
    momentum: {
      "3 days": { currentInstalls: 340, previousInstalls: 180, currentUniqueUsers: 220, previousUniqueUsers: 120 },
      "7 days": { currentInstalls: 620, previousInstalls: 0, currentUniqueUsers: 410, previousUniqueUsers: 0 },
      "14 days": { currentInstalls: 620, previousInstalls: 0, currentUniqueUsers: 410, previousUniqueUsers: 0 },
      "30 days": { currentInstalls: 620, previousInstalls: 0, currentUniqueUsers: 410, previousUniqueUsers: 0 },
    },
  },
];

const componentMetadata: Partial<
  Record<
    ComponentSeed["name"],
    {
      adminOverride?: AdminOverride;
      category?: string;
      creator?: string;
      daysSinceLastTrending?: number | null;
      explorationCandidate?: boolean;
    }
  >
> = {
  "Hero Section": { adminOverride: "great", creator: "Studio North", category: "Landing" },
  "Pricing Table": { creator: "Conversion Lab", category: "Commerce", explorationCandidate: true },
  "Testimonial Carousel": { adminOverride: "bad", creator: "Studio North", category: "Social Proof" },
  "Feature Grid": { creator: "Conversion Lab", category: "Landing", daysSinceLastTrending: 2 },
  "Contact Form": { creator: "Craft Wave", category: "Forms" },
  "Navigation Bar": { creator: "Pixel Thread", category: "Navigation" },
  Footer: { creator: "Pixel Thread", category: "Navigation" },
  "Animated Counter": { creator: "Motion Forge", category: "Metrics", explorationCandidate: true },
  "FAQ Accordion": { creator: "Craft Wave", category: "Content", explorationCandidate: true },
  "Image Gallery": { creator: "Frame House", category: "Media" },
  "Cookie Banner": { creator: "Craft Wave", category: "Utility" },
  "Video Background": { creator: "Motion Forge", category: "Media" },
  "Stats Counter": { creator: "Motion Forge", category: "Metrics" },
  "Tabs Component": { creator: "Pixel Thread", category: "Navigation" },
  "Marquee Scroll": { creator: "Motion Forge", category: "Media" },
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
  settings: ComponentRankingSettings,
) {
  return (
    (settings.recencyWeight / 100) * recentScore +
    (settings.lifetimeWeight / 100) * lifetimeScore
  );
}

function getBaseGrowth(
  momentumMetrics: ComponentMomentumMetrics,
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
  window: ComponentMomentumWindow,
): ComponentMomentumWindow | null {
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
  component: ComponentSeed,
  settings: ComponentRankingSettings,
  installMultiplier: number,
) {
  const currentGrowth = Math.max(
    0,
    getBaseGrowth(component.momentum[settings.momentumWindow], installMultiplier),
  );
  const previousWindow = getPreviousMomentumWindow(settings.momentumWindow);
  const previousGrowth =
    previousWindow === null
      ? currentGrowth
      : Math.max(
          0,
          getBaseGrowth(component.momentum[previousWindow], installMultiplier),
        );
  const acceleration = Math.max(0, currentGrowth - previousGrowth);

  return (
    settings.momentumWeight * currentGrowth +
    settings.accelerationWeight * acceleration
  );
}

export function getComponentRankingSettings(
  settings: SidebarSettingsState,
): ComponentRankingSettings {
  return {
    opensWeight: getNumericSettingValue(settings, "Weight Metrics", "Opens"),
    uniqueUsersWeight: getNumericSettingValue(settings, "Weight Metrics", "Unique Users"),
    projectInstallsWeight: getNumericSettingValue(settings, "Weight Metrics", "Project Installs"),
    projectSpreadWeight: getNumericSettingValue(settings, "Weight Metrics", "Project Spread"),
    copyRateWeight: getNumericSettingValue(settings, "Rate Metrics", "Copy Rate"),
    averageCopiesWeight: getNumericSettingValue(settings, "Rate Metrics", "Average Copies per User"),
    paidViewsMultiplier: getNumericSettingValue(settings, "Paid Normalization", "Paid Views Multiplier"),
    paidInstallMultiplier: getNumericSettingValue(settings, "Paid Normalization", "Paid Install Multiplier"),
    lookbackWindow: getDropdownSettingValue(settings, "Time", "Lookback Window") as ComponentLookbackWindow,
    recencyWeight: getNumericSettingValue(settings, "Time", "Recency Weight"),
    lifetimeWeight: getNumericSettingValue(settings, "Time", "Lifetime Weight"),
    freshComponentBoost: getNumericSettingValue(settings, "Time", "Fresh Component Boost"),
    freshBoostDuration: getNumericSettingValue(settings, "Time", "Fresh Boost Duration"),
    momentumWindow: getDropdownSettingValue(settings, "Momentum", "Window") as ComponentMomentumWindow,
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

export function scoreComponents(settings: ComponentRankingSettings): RankedComponent[] {
  const rankedComponents = componentSeeds.map((component) => {
    const metadata = componentMetadata[component.name];
    const recentMetrics = component.metrics[settings.lookbackWindow];
    const lifetimeMetrics = component.metrics["90 days"];
    const isPaid = component.pricingType === "paid";
    const viewsMultiplier = isPaid ? settings.paidViewsMultiplier : 1;
    const installMultiplier = isPaid ? settings.paidInstallMultiplier : 1;
    const opensAdjusted = recentMetrics.opens * viewsMultiplier;
    const lifetimeOpensAdjusted = lifetimeMetrics.opens * viewsMultiplier;
    const installsAdjusted = recentMetrics.projectInstalls * installMultiplier;
    const lifetimeInstallsAdjusted = lifetimeMetrics.projectInstalls * installMultiplier;
    const recentAverageCopies = safeDivide(
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
      1 - component.ageDays / Math.max(settings.freshBoostDuration, 1),
    );
    const freshScore = settings.freshComponentBoost * freshDecay;
    const momentumScore = getMomentumScore(component, settings, installMultiplier);
    const overrideMultiplier = getOverrideMultiplier(
      metadata?.adminOverride,
      settings.boost,
      settings.decay,
    );
    const rotation = getRotationState(
      component.isCurrentlyTrending,
      component.daysInTrending,
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
      settings.averageCopiesWeight * recentAverageCopies,
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
      name: component.name,
      pricingType: component.pricingType,
      pricingLabel: component.pricingLabel,
      ageDays: component.ageDays,
      isCurrentlyTrending: component.isCurrentlyTrending,
      daysInTrending: component.daysInTrending,
      opens: recentMetrics.opens,
      uniqueUsers: recentMetrics.uniqueUsers,
      projectInstalls: recentMetrics.projectInstalls,
      distinctProjects: recentMetrics.distinctProjects,
      copyRate,
      averageCopiesPerUser: recentAverageCopies,
      isEligible,
      finalScore,
    } satisfies RankedComponent;
  });

  return applyExplorationOrdering(
    rankedComponents,
    settings.explorationPercent,
    (component) => componentMetadata[component.name]?.explorationCandidate === true,
    {
      creatorCap: settings.creatorCap,
      categoryCap: settings.categoryCap,
      getCreator: (component) => componentMetadata[component.name]?.creator,
      getCategory: (component) => componentMetadata[component.name]?.category,
    },
  );
}
